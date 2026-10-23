"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime", "audio/mpeg", "audio/wav", "audio/mp4", "application/pdf"]);
const maxBytes = 50 * 1024 * 1024;

export function MediaUpload({ workspaceId, canUpload }: { workspaceId: string; canUpload: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpload) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("file") as File | null;
    if (!file || !file.size) { setMessage("Choose a file first."); return; }
    if (!allowed.has(file.type)) { setMessage("Choose an image, video, audio file, or PDF."); return; }
    if (file.size > maxBytes) { setMessage("Files must be 50 MB or smaller."); return; }
    setBusy(true);
    setMessage("Uploading privately…");
    const cleanName = file.name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-180) || "upload";
    const path = `${workspaceId}/${crypto.randomUUID()}-${cleanName}`;
    try {
      const supabase = createClient();
      const stored = await supabase.storage.from("workspace-media").upload(path, file, { contentType: file.type, upsert: false });
      if (stored.error) throw new Error("UPLOAD_FAILED");
      const user = await supabase.auth.getUser();
      const { error } = await supabase.from("media").insert({ workspace_id: workspaceId, created_by: user.data.user?.id, storage_path: path, file_name: file.name.slice(0, 255), mime_type: file.type, byte_size: file.size });
      if (error) {
        await supabase.storage.from("workspace-media").remove([path]);
        throw new Error("RECORD_FAILED");
      }
      setMessage("Upload complete.");
      window.location.reload();
    } catch {
      setMessage("Upload failed. Check Supabase setup and apply migration 0005_private_media.sql.");
    } finally { setBusy(false); }
  }
  return <form className="upload-form" onSubmit={upload}>
    <label className="upload-picker" htmlFor="media-file"><span className="upload-icon" aria-hidden="true">↑</span><span><strong>Choose a file</strong><small>Images, video, audio, or PDF · up to 50 MB</small></span></label>
    <input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/mp4,application/pdf" disabled={!canUpload || busy} />
    {canUpload ? <button className="button primary" type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload privately"}</button> : <p className="field-help">You have view-only access. Ask an editor to add media.</p>}
    {message && <p role="status" className="field-help">{message}</p>}
  </form>;
}
