import Link from "next/link";
import { UpdatePasswordForm } from "@/components/password-recovery-forms";

export default function UpdatePasswordPage() {
  return <main id="main-content" className="auth-page">
    <section className="auth-card" aria-labelledby="update-password-title">
      <Link className="brand auth-brand" href="/"><span className="brand-mark" aria-hidden="true">C</span> Creaonix</Link>
      <p className="eyebrow">Account recovery</p>
      <h1 id="update-password-title">Choose a new password</h1>
      <p className="auth-intro">Set a new password for your Creaonix account.</p>
      <UpdatePasswordForm />
    </section>
  </main>;
}
