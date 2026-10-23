import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { WorkspaceGate } from "@/components/workspace-gate";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function CalendarPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;
  const { data, error } = await context.supabase.from("content").select("id, title, content_type, scheduled_for").eq("workspace_id", context.workspace.id).eq("status", "scheduled").not("scheduled_for", "is", null).gte("scheduled_for", new Date().toISOString()).is("deleted_at", null).order("scheduled_for", { ascending: true }).limit(100);
  if (error) return <WorkspaceGate state="error" />;
  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Calendar" /><main id="main-content" className="main">
    <header className="topbar"><div><p className="eyebrow">{context.workspace.name} / Plan</p><h1>Calendar</h1><p className="page-intro">A planning view of content you’ve assigned a time to. Creonix won’t publish anything from this calendar.</p></div><Link className="button primary" href="/content/new">+ Add idea</Link></header>
    <section className="card"><header className="card-header"><div><h2>Upcoming</h2><p className="muted" style={{ margin: "4px 0 0" }}>Times are shown in UTC</p></div><span className="tag">{data.length} scheduled</span></header>
      {data.length ? <ol className="calendar-list">{data.map((item) => <li className="calendar-item" key={item.id}><time dateTime={item.scheduled_for!}><span>{new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(item.scheduled_for!))}</span><strong>{new Intl.DateTimeFormat("en", { day: "2-digit", timeZone: "UTC" }).format(new Date(item.scheduled_for!))}</strong><small>{new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(new Date(item.scheduled_for!))}</small></time><div className="calendar-event"><span className="tag">{item.content_type.replaceAll("_", " ")}</span><Link href={`/content/${item.id}`}>{item.title}</Link><span className="content-meta">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(item.scheduled_for!))} UTC</span></div></li>)}</ol> : <div className="empty-state"><span className="empty-icon">◷</span><h2>Nothing on the calendar yet</h2><p>Open a content idea and choose a planning time to see it here.</p><Link className="button secondary" href="/content">Browse your content</Link></div>}
    </section>
  </main></div>;
}
