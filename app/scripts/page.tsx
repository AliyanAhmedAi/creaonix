import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { WorkspaceGate } from "@/components/workspace-gate";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function ScriptsPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;

  const { data, error } = await context.supabase.from("content")
    .select("id, title, status, updated_at, script")
    .eq("workspace_id", context.workspace.id).is("deleted_at", null)
    .not("script", "is", null).order("updated_at", { ascending: false });

  if (error) return <WorkspaceGate state="error" />;
  const scripts = (data ?? []).filter((item) => item.script?.trim());

  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Scripts" />
    <main id="main-content" className="main">
      <header className="topbar"><div><p className="eyebrow">Manage</p><h1>Scripts</h1><p className="muted">Drafts saved with your content, with a private revision trail.</p></div><Link className="button primary" href="/content/new">New content</Link></header>
      <section className="card">
        <header className="card-header"><h2>Saved scripts</h2><span className="muted">{scripts.length} {scripts.length === 1 ? "script" : "scripts"}</span></header>
        {scripts.length ? <div className="table-wrap"><table className="content-table"><thead><tr><th scope="col">Content</th><th scope="col">Status</th><th scope="col">Last saved</th></tr></thead><tbody>
          {scripts.map((item) => <tr key={item.id}><th scope="row"><Link className="table-link" href={`/content/${item.id}`}>{item.title}</Link><span className="table-description">{item.script?.slice(0, 140)}</span></th><td><span className={`status ${item.status}`}>{item.status}</span></td><td>{new Date(item.updated_at).toLocaleDateString()}</td></tr>)}
        </tbody></table></div> : <div className="dashboard-empty"><h3>No scripts yet</h3><p>Open a content item and add a script. Each saved revision is kept privately for your workspace.</p><Link className="button secondary" href="/content">Go to content library</Link></div>}
      </section>
    </main>
  </div>;
}
