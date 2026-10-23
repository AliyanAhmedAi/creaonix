"use client";

import { useActionState } from "react";
import { generateDraft, type DraftActionState } from "@/app/ai/actions";

export function AIDraftForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState<DraftActionState, FormData>(generateDraft, {});
  return <form action={action} className="auth-form ai-form">
    <div className="field-group"><label htmlFor="task">What are we making?</label><select id="task" name="task" defaultValue="ideas"><option value="ideas">Five content ideas</option><option value="script">A short-form script</option></select></div>
    <div className="field-group"><label htmlFor="topic">Topic or starting point</label><textarea id="topic" name="topic" required minLength={3} maxLength={300} rows={3} placeholder="What do you want to talk about?" /></div>
    <div className="field-group"><label htmlFor="audience">Who is it for?</label><input id="audience" name="audience" required minLength={2} maxLength={200} placeholder="e.g. new freelance designers" /></div>
    <div className="field-group"><label htmlFor="tone">Voice or tone</label><input id="tone" name="tone" required minLength={2} maxLength={160} defaultValue="Warm, direct, and practical" /></div>
    {!enabled && <p className="field-help">This workspace can use AI once a server-side Groq key and model are configured.</p>}
    {state.error && <p className="form-message" role="alert">{state.error}</p>}
    <button className="button primary" type="submit" disabled={pending}>{pending ? "Drafting…" : "Generate draft"}</button>
    {state.output && <section className="ai-output" aria-live="polite" aria-label="Generated draft"><div className="card-header"><h2>Your draft</h2></div><pre>{state.output}</pre></section>}
  </form>;
}
