import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ContentForm } from "@/components/content-form";
import { WorkspaceGate } from "@/components/workspace-gate";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function NewContentPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;
  if (!can(context.role, "content.write")) redirect("/content");
  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Content" /><main id="main-content" className="main">
    <header className="topbar"><div><p className="eyebrow"><Link href="/content">Content</Link> / New idea</p><h1>Capture a new idea</h1><p className="page-intro">Start lightweight. You can add detail and update the status later.</p></div></header>
    <section className="card form-card"><header className="card-header"><h2>Idea details</h2><span className="tag">Saved to {context.workspace.name}</span></header><div className="form-body"><ContentForm /></div></section>
  </main></div>;
}
