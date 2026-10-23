import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ContentEditor } from "@/components/content-editor";
import { WorkspaceGate } from "@/components/workspace-gate";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;
  const { data, error } = await context.supabase.from("content").select("id, title, description, script, status, scheduled_for").eq("id", id).eq("workspace_id", context.workspace.id).is("deleted_at", null).maybeSingle();
  if (error) return <WorkspaceGate state="error" />;
  if (!data) notFound();
  const { data: versions, error: versionsError } = await context.supabase.from("script_versions").select("id, body, created_at").eq("content_id", id).eq("workspace_id", context.workspace.id).order("created_at", { ascending: false }).limit(20);
  if (versionsError) return <WorkspaceGate state="error" />;
  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Content" /><main id="main-content" className="main">
    <header className="topbar"><div><p className="eyebrow"><Link href="/content">Content library</Link> / Edit</p><h1>Edit content</h1></div><span className="tag">{context.role}</span></header>
    <section className="card form-card"><header className="card-header"><h2>Content details</h2><span className={`status ${data.status}`}>{data.status}</span></header><div className="form-body">{can(context.role, "content.write") ? <ContentEditor item={data} /> : <div><h3>{data.title}</h3><p>{data.description || "No notes added."}</p><pre>{data.script || "No script added."}</pre></div>}</div></section>
    {versions?.length ? <section className="card form-card" style={{ marginTop: 16 }}><header className="card-header"><h2>Script history</h2><span className="muted">Latest {versions.length} revisions</span></header><ul className="ai-history">{versions.map((version, index) => <li key={version.id}><strong>Revision {versions.length - index}</strong><time dateTime={version.created_at}>{new Date(version.created_at).toLocaleString()}</time><details><summary>View saved script</summary><pre>{version.body}</pre></details></li>)}</ul></section> : null}
  </main></div>;
}
