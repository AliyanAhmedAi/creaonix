"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createContent, type ContentActionState } from "@/app/content/actions";

export function ContentForm() {
  const [state, action, pending] = useActionState<ContentActionState, FormData>(createContent, {});
  return <form action={action} className="auth-form content-form">
    <div className="field-group"><label htmlFor="title">Working title</label><input id="title" name="title" required maxLength={200} placeholder="e.g. A week of simple creator workflows" /><p className="field-help">You can refine the title as your idea takes shape.</p></div>
    <div className="field-group"><label htmlFor="contentType">Format</label><select id="contentType" name="contentType" defaultValue="video"><option value="video">Video</option><option value="short">Short-form video</option><option value="post">Social post</option><option value="newsletter">Newsletter</option><option value="podcast">Podcast</option></select></div>
    <div className="field-group"><label htmlFor="description">Notes <span className="muted">(optional)</span></label><textarea id="description" name="description" rows={5} maxLength={5000} placeholder="Capture the hook, audience, or details you don’t want to forget." /></div>
    {state.error && <p className="form-message" role="alert">{state.error}</p>}
    <div className="form-actions"><Link className="button secondary" href="/content">Cancel</Link><button className="button primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save idea"}</button></div>
  </form>;
}
