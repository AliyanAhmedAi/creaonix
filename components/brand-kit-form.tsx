"use client";

import { useActionState } from "react";
import { saveBrandKit, type BrandKitActionState } from "@/app/brand-kit/actions";

export function BrandKitForm({ value, canEdit }: { value: { audience: string; voice: string; topics: string; call_to_action: string }; canEdit: boolean }) {
  const [state, action, pending] = useActionState<BrandKitActionState, FormData>(saveBrandKit, {});
  return <form action={action} className="auth-form content-form">
    <div className="field-group"><label htmlFor="audience">Who do you create for?</label><textarea id="audience" name="audience" rows={3} maxLength={500} defaultValue={value.audience} placeholder="Describe the people you want your content to help." readOnly={!canEdit} /></div>
    <div className="field-group"><label htmlFor="voice">Brand voice</label><textarea id="voice" name="voice" rows={4} maxLength={1000} defaultValue={value.voice} placeholder="A few words about your style, tone, and point of view." readOnly={!canEdit} /></div>
    <div className="field-group"><label htmlFor="topics">Core topics</label><textarea id="topics" name="topics" rows={4} maxLength={2000} defaultValue={value.topics} placeholder="List the themes you return to. One per line works well." readOnly={!canEdit} /></div>
    <div className="field-group"><label htmlFor="callToAction">Usual call to action</label><input id="callToAction" name="callToAction" maxLength={500} defaultValue={value.call_to_action} placeholder="e.g. Save this for your next planning session." readOnly={!canEdit} /></div>
    {state.error && <p className="form-message" role="alert">{state.error}</p>}
    {state.saved && <p className="success-message" role="status">Brand Kit saved. AI Studio can now use these guidelines.</p>}
    {canEdit && <button className="button primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save Brand Kit"}</button>}
  </form>;
}
