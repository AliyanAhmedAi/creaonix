"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ContentStatus } from "@/lib/domain/types";
import { updateContent, type ContentActionState } from "@/app/content/actions";

const statuses: ContentStatus[] = ["idea", "script", "production", "editing", "ready", "scheduled", "archived"];
const labels: Record<ContentStatus, string> = { idea: "Idea", script: "Script", production: "Production", editing: "Editing", ready: "Ready", scheduled: "Scheduled", publishing: "Publishing", published: "Published", failed: "Failed", archived: "Archived" };

export function ContentEditor({ item }: { item: { id: string; title: string; description: string | null; script: string | null; status: ContentStatus; scheduled_for: string | null } }) {
  const [state, action, pending] = useActionState<ContentActionState, FormData>(updateContent, {});
  const localValue = item.scheduled_for ? new Date(item.scheduled_for).toISOString().slice(0, 16) : "";
  return <form action={action} className="auth-form content-form">
    <input type="hidden" name="id" value={item.id} />
    <div className="field-group"><label htmlFor="title">Title</label><input id="title" name="title" required maxLength={200} defaultValue={item.title} /></div>
    <div className="field-group"><label htmlFor="status">Workflow status</label><select id="status" name="status" defaultValue={item.status}>{statuses.map((status) => <option value={status} key={status}>{labels[status]}</option>)}</select><p className="field-help">Scheduling a time below moves this idea to Scheduled. This does not publish it.</p></div>
    <div className="field-group"><label htmlFor="scheduledFor">Schedule time <span className="muted">(UTC)</span></label><input id="scheduledFor" name="scheduledFor" type="datetime-local" defaultValue={localValue} /><p className="field-help">A planning reminder only; connect a supported channel and publishing workflow before any post can go live.</p></div>
    <div className="field-group"><label htmlFor="description">Notes</label><textarea id="description" name="description" rows={8} maxLength={5000} defaultValue={item.description ?? ""} /></div>
    <div className="field-group"><label htmlFor="script">Script</label><textarea id="script" name="script" rows={16} maxLength={50000} defaultValue={item.script ?? ""} placeholder="Write or paste a script…" /><p className="field-help">Changes are saved with this content item and captured in script history.</p></div>
    {state.error && <p className="form-message" role="alert">{state.error}</p>}
    <div className="form-actions"><Link className="button secondary" href="/content">Cancel</Link><button className="button primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button></div>
  </form>;
}
