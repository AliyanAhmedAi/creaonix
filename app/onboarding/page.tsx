import { redirect } from "next/navigation";
import { WorkspaceForm } from "@/components/workspace-form";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function OnboardingPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "ready") redirect("/dashboard");
  if (context.state === "setup" || context.state === "error") return <main id="main-content" className="auth-page"><section className="auth-card"><span className="brand auth-brand"><span className="brand-mark" aria-hidden="true">C</span> Creonix</span><p className="eyebrow">Workspace setup</p><h1>Connect your workspace</h1><p className="auth-intro">Configure Supabase in .env.local and apply the included migrations to continue.</p></section></main>;

  return (
    <main id="main-content" className="auth-page">
      <section className="auth-card" aria-labelledby="workspace-title">
        <span className="brand auth-brand"><span className="brand-mark" aria-hidden="true">C</span> Creonix</span>
        <p className="eyebrow">Step 1 of 1</p>
        <h1 id="workspace-title">Create your workspace</h1>
        <p className="auth-intro">A workspace keeps your content, media, teammates, and integrations isolated and secure.</p>
        <WorkspaceForm />
      </section>
    </main>
  );
}
