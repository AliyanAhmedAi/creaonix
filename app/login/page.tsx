import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signIn, signInWithGoogle } from "@/app/auth/actions";

const errors: Record<string, string> = {
  oauth: "Google sign-in could not be started. Please try again.",
  callback: "That sign-in link is invalid or has expired. Please try again.",
  configuration: "Supabase is not configured yet. Add the required environment variables first."
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main id="main-content" className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <Link className="brand auth-brand" href="/"><span className="brand-mark" aria-hidden="true">C</span> Creaonix</Link>
        <p className="eyebrow">Welcome back</p>
        <h1 id="login-title">Sign in to your workspace</h1>
        <p className="auth-intro">Continue organizing your creator workflow in one place.</p>
        {error && errors[error] ? <p className="form-message" role="alert">{errors[error]}</p> : null}
        <form action={signInWithGoogle}><button className="button secondary auth-submit" type="submit">Continue with Google</button></form>
        <div className="auth-divider" aria-hidden="true"><span>or</span></div>
        <AuthForm action={signIn} submitLabel="Sign in" />
        <p className="auth-forgot"><Link href="/forgot-password">Forgot password?</Link></p>
        <p className="auth-footer">New to Creaonix? <Link href="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
