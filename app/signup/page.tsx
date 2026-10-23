import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "@/app/auth/actions";

export default function SignUpPage() {
  return (
    <main id="main-content" className="auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <Link className="brand auth-brand" href="/"><span className="brand-mark" aria-hidden="true">C</span> Creonix</Link>
        <p className="eyebrow">Get started</p>
        <h1 id="signup-title">Build your creator workspace</h1>
        <p className="auth-intro">Create your account, then set up the workspace that holds your content.</p>
        <AuthForm action={signUp} submitLabel="Create account" />
        <p className="auth-footer">Already have an account? <Link href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
