import Link from "next/link";
import { RequestPasswordResetForm } from "@/components/password-recovery-forms";

export default function ForgotPasswordPage() {
  return <main id="main-content" className="auth-page">
    <section className="auth-card" aria-labelledby="forgot-password-title">
      <Link className="brand auth-brand" href="/"><span className="brand-mark" aria-hidden="true">C</span> Creonix</Link>
      <p className="eyebrow">Account recovery</p>
      <h1 id="forgot-password-title">Reset your password</h1>
      <p className="auth-intro">Enter your account email and we’ll send a secure reset link if an account exists.</p>
      <RequestPasswordResetForm />
    </section>
  </main>;
}
