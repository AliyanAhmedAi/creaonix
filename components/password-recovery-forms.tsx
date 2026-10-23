"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset, updatePassword, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = {};

export function RequestPasswordResetForm() {
  const [state, action] = useActionState(requestPasswordReset, initialState);
  return <form action={action} className="auth-form" noValidate>
    <div className="field-group"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" inputMode="email" required /></div>
    {state.error ? <p className="form-message" role="alert">{state.error}</p> : null}
    {state.message ? <p className="form-message success-message" role="status">{state.message}</p> : null}
    <SubmitButton>Send reset link</SubmitButton>
    <p className="auth-footer"><Link href="/login">Back to sign in</Link></p>
  </form>;
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePassword, initialState);
  return <form action={action} className="auth-form" noValidate>
    <div className="field-group"><label htmlFor="password">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required aria-describedby="password-help" /><p id="password-help" className="field-help">Use at least 8 characters.</p></div>
    <div className="field-group"><label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></div>
    {state.error ? <p className="form-message" role="alert">{state.error}</p> : null}
    {state.message ? <p className="form-message success-message" role="status">{state.message}</p> : null}
    <SubmitButton>Update password</SubmitButton>
  </form>;
}

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return <button className="button primary auth-submit" type="submit" disabled={pending}>{pending ? "Please wait…" : children}</button>;
}
