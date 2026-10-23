"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthActionState } from "@/app/auth/actions";

type AuthFormProps = {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  submitLabel: string;
};

const initialState: AuthActionState = {};

export function AuthForm({ action, submitLabel }: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="auth-form" noValidate>
      <div className="field-group">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <div className="field-group">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" minLength={8} required aria-describedby="password-help" />
        <p id="password-help" className="field-help">Use at least 8 characters.</p>
      </div>
      {state.error ? <p className="form-message" role="alert">{state.error}</p> : null}
      {state.message ? <p className="form-message success-message" role="status">{state.message}</p> : null}
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return <button className="button primary auth-submit" type="submit" disabled={pending}>{pending ? "Please wait…" : children}</button>;
}
