"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createWorkspace, type WorkspaceActionState } from "@/app/onboarding/actions";

const initialState: WorkspaceActionState = {};

export function WorkspaceForm() {
  const [state, formAction] = useActionState(createWorkspace, initialState);

  return (
    <form action={formAction} className="auth-form" noValidate>
      <div className="field-group">
        <label htmlFor="name">Workspace name</label>
        <input id="name" name="name" autoComplete="organization" maxLength={100} required placeholder="e.g. Northstar Studio" />
      </div>
      <div className="field-group">
        <label htmlFor="slug">Workspace URL</label>
        <div className="input-prefix"><span aria-hidden="true">creaonix.app/</span><input id="slug" name="slug" autoComplete="off" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={100} required placeholder="northstar-studio" aria-describedby="slug-help" /></div>
        <p id="slug-help" className="field-help">Use lowercase letters, numbers, and hyphens only.</p>
      </div>
      {state.error ? <p className="form-message" role="alert">{state.error}</p> : null}
      <WorkspaceSubmitButton />
    </form>
  );
}

function WorkspaceSubmitButton() {
  const { pending } = useFormStatus();
  return <button className="button primary auth-submit" type="submit" disabled={pending}>{pending ? "Creating workspace…" : "Create workspace"}</button>;
}
