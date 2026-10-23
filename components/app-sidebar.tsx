import Link from "next/link";
import type { WorkspaceRole } from "@/lib/domain/types";

const groups = [
  { label: "Create", links: [["Dashboard", "/dashboard"], ["Content", "/content"], ["AI Studio", "/ai"]] },
  { label: "Manage", links: [["Media", "/media"], ["Scripts", "/scripts"], ["Calendar", "/calendar"]] },
  { label: "Publish", links: [["Social accounts", null]] },
  { label: "Insights", links: [["Analytics", null], ["Comments", null]] },
  { label: "Workspace", links: [["Brand kit", "/brand-kit"], ["Team", null], ["Billing", null]] }
];

export function AppSidebar({ workspaceName, role, active }: { workspaceName: string; role: WorkspaceRole; active: "Dashboard" | "Content" | "Calendar" | "AI Studio" | "Brand kit" | "Media" | "Scripts" }) {
  return <aside className="sidebar">
    <Link className="brand" href="/"><span className="brand-mark">C</span> Creonix</Link>
    <div className="workspace-switcher"><span>Workspace</span><strong>{workspaceName}</strong></div>
    {groups.map((group) => <nav className="nav-group" key={group.label} aria-label={group.label}>
      <span className="nav-label">{group.label}</span>
      {group.links.map(([label, href]) => href ? <Link key={label} href={href} aria-current={label === active ? "page" : undefined} className={`nav-link ${label === active ? "active" : ""}`}><i className="nav-dot" />{label}</Link> : <span key={label} className="nav-link nav-disabled" aria-disabled="true" title="Coming soon"><i className="nav-dot" />{label}<small>Soon</small></span>)}
    </nav>)}
    <div className="sidebar-footer"><strong>{role[0].toUpperCase() + role.slice(1)} access</strong><p>{role === "viewer" ? "You can view this workspace." : "Workspace content stays private to your team."}</p></div>
  </aside>;
}
