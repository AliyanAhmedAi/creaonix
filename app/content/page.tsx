import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ContentTable } from "@/components/content-table";
import { WorkspaceGate } from "@/components/workspace-gate";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function ContentPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;
  const { data, error } = await context.supabase.from("content").select("id, title, description, content_type, status, created_at").eq("workspace_id", context.workspace.id).is("deleted_at", null).order("updated_at", { ascending: false });
  if (error) return <WorkspaceGate state="error" />;
  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Content" /><main id="main-content" className="main">
    <header className="topbar"><div><p className="eyebrow">{context.workspace.name} / Create</p><h1>Your content</h1><p className="page-intro">Keep the ideas, drafts, and finished work for this workspace in one place.</p></div>{can(context.role, "content.write") && <Link className="button primary" href="/content/new">+ New idea</Link>}</header>
    <section className="card" aria-label="Workspace content"><header className="card-header"><div><h2>Content library</h2><p className="muted" style={{ margin: "4px 0 0" }}>{data.length} {data.length === 1 ? "item" : "items"}</p></div><span className="tag">{context.role}</span></header><ContentTable items={data} canEdit={can(context.role, "content.write")} /></section>
  </main></div>;
}
