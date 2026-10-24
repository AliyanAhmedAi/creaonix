import Link from "next/link";

export function WorkspaceGate({ state }: { state: "setup" | "error" }) {
  const setup = state === "setup";
  return <main id="main-content" className="auth-page"><section className="auth-card" aria-labelledby="gate-title">
    <span className="brand auth-brand"><span className="brand-mark" aria-hidden="true">C</span> Creaonix</span>
    <p className="eyebrow">Workspace setup</p>
    <h1 id="gate-title">{setup ? "Connect your workspace" : "We couldn’t load your workspace"}</h1>
    <p className="auth-intro">{setup ? "Add your Supabase project URL and public anon key to .env.local, then run the included database migrations." : "Try again in a moment. Your workspace data has not been changed."}</p>
    {setup ? <p className="field-help">Required: <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</p> : <Link className="button secondary" href="/dashboard">Try again</Link>}
  </section></main>;
}
