import { AppSidebar } from "@/components/app-sidebar";
import { DashboardRealData } from "@/components/dashboard/dashboard-real-data";
import { WorkspaceGate } from "@/components/workspace-gate";
import { getWorkspaceContext } from "@/lib/workspaces/context";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;
  const table = context.supabase.from("content");
  const [all, active, ready, published, recent] = await Promise.all([
    table.select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).is("deleted_at", null),
    table.select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).in("status", ["idea", "script", "production", "editing"]).is("deleted_at", null),
    table.select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).eq("status", "ready").is("deleted_at", null),
    table.select("id", { count: "exact", head: true }).eq("workspace_id", context.workspace.id).eq("status", "published").is("deleted_at", null),
    table.select("id, title, status, content_type, created_at").eq("workspace_id", context.workspace.id).is("deleted_at", null).order("updated_at", { ascending: false }).limit(4)
  ]);
  if (all.error || active.error || ready.error || published.error || recent.error) return <WorkspaceGate state="error" />;
  const greeting = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Dashboard" /><main id="main-content" className="main"><header className="topbar"><div><p className="eyebrow">{greeting} · {context.workspace.name}</p><h1>Your creative workspace</h1></div><div className="actions"><a className="button primary" href="/content/new">+ Create content</a></div></header><DashboardRealData counts={{ total: all.count ?? 0, active: active.count ?? 0, ready: ready.count ?? 0, published: published.count ?? 0 }} recent={recent.data ?? []} /></main></div>;
}
