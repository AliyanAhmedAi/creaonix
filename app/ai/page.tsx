import { redirect } from "next/navigation";
import { AIDraftForm } from "@/components/ai-draft-form";
import { AppSidebar } from "@/components/app-sidebar";
import { WorkspaceGate } from "@/components/workspace-gate";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function AIPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;
  const configured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_MODEL);
  const { data, error } = await context.supabase.from("ai_generations").select("id, generation_type, output, created_at").eq("workspace_id", context.workspace.id).order("created_at", { ascending: false }).limit(10);
  if (error) return <WorkspaceGate state="error" />;
  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="AI Studio" /><main id="main-content" className="main">
    <header className="topbar"><div><p className="eyebrow">{context.workspace.name} / Create</p><h1>AI Studio</h1><p className="page-intro">Use AI as a writing partner. Review every draft before using it.</p></div><span className={`tag ${configured ? "configured" : ""}`}>{configured ? "Provider configured" : "Setup needed"}</span></header>
    <section className="ai-layout"><article className="card"><header className="card-header"><div><h2>Start a draft</h2><p className="muted" style={{ margin: "4px 0 0" }}>Generated text is saved privately to this workspace.</p></div></header><div className="form-body"><AIDraftForm enabled={configured && can(context.role, "content.write")} /></div></article>
      <aside className="card"><header className="card-header"><div><h2>Recent drafts</h2><p className="muted" style={{ margin: "4px 0 0" }}>Saved generations for this workspace</p></div></header>{data.length ? <ul className="ai-history">{data.map((item) => <li key={item.id}><span className="tag">{item.generation_type}</span><strong>{item.generation_type === "ideas" ? "Content ideas" : "Script draft"}</strong><time>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(item.created_at))}</time><details><summary>View saved draft</summary><pre>{item.output}</pre></details></li>)}</ul> : <p className="dashboard-empty">No saved drafts yet.</p>}</aside></section>
  </main></div>;
}
