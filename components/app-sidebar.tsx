"use client";

import Link from "next/link";
import { useState } from "react";
import type { WorkspaceRole } from "@/lib/domain/types";

const groups = [
  { label: "Create", links: [["Dashboard", "/dashboard"], ["Content", "/content"], ["AI Studio", "/ai"]] },
  { label: "Manage", links: [["Media", "/media"], ["Scripts", "/scripts"], ["Calendar", "/calendar"]] },
  { label: "Publish", links: [["Social accounts", null]] },
  { label: "Insights", links: [["Analytics", null], ["Comments", null]] },
  { label: "Workspace", links: [["Brand kit", "/brand-kit"], ["Team", null], ["Billing", "/billing"]] }
];

export function AppSidebar({ workspaceName, role, active, isPlatformAdmin = false }: { workspaceName: string; role: WorkspaceRole; active: "Dashboard" | "Content" | "Calendar" | "AI Studio" | "Brand kit" | "Media" | "Scripts" | "Billing" | "Admin portal"; isPlatformAdmin?: boolean }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryLinks = [
    { label: "Dashboard", href: "/dashboard", icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /> },
    { label: "Content", href: "/content", icon: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /> },
    { label: "AI Studio", href: "/ai", icon: <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3ZM19 15l1 2.5 2.5 1-2.5 1L19 22l-1-2.5-2.5-1 2.5-1 1-2.5Z" /> },
    { label: "Calendar", href: "/calendar", icon: <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 8h3v3H8z" /> }
  ];
  const primaryLabels = new Set(primaryLinks.map(({ label }) => label));
  const hasMoreActive = active === "Media" || active === "Scripts" || active === "Brand kit" || active === "Billing" || active === "Admin portal";

  return <aside className="sidebar">
    <Link className="brand" href="/"><span className="brand-mark">C</span> Creaonix</Link>
    <div className="workspace-switcher"><span>Workspace</span><strong>{workspaceName}</strong></div>
    {groups.map((group) => <nav className="nav-group" key={group.label} aria-label={group.label}>
      <span className="nav-label">{group.label}</span>
      {group.links.map(([label, href]) => href ? <Link key={label} href={href} aria-current={label === active ? "page" : undefined} className={`nav-link ${label === active ? "active" : ""}`}><i className="nav-dot" />{label}</Link> : <span key={label} className="nav-link nav-disabled" aria-disabled="true" title="Coming soon"><i className="nav-dot" />{label}<small>Soon</small></span>)}
    </nav>)}
    {isPlatformAdmin && <nav className="nav-group" aria-label="Administration"><span className="nav-label">Owner</span><Link href="/admin" aria-current={active === "Admin portal" ? "page" : undefined} className={`nav-link ${active === "Admin portal" ? "active" : ""}`}><i className="nav-dot" />Admin portal</Link></nav>}
    <div className="sidebar-footer"><strong>{role[0].toUpperCase() + role.slice(1)} access</strong><p>{role === "viewer" ? "You can view this workspace." : "Workspace content stays private to your team."}</p></div>
    <nav className="mobile-primary-nav" aria-label="Primary navigation">
      {primaryLinks.map(({ label, href, icon }) => <Link key={label} href={href} aria-current={label === active ? "page" : undefined} className={`mobile-nav-link${label === active ? " active" : ""}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg><span>{label}</span>
      </Link>)}
      <button className={`mobile-nav-link mobile-more-button${hasMoreActive ? " active" : ""}`} type="button" aria-expanded={moreOpen} aria-controls="mobile-more-menu" onClick={() => setMoreOpen((open) => !open)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg><span>More</span>
      </button>
      {moreOpen && <div className="mobile-more-panel" id="mobile-more-menu">
        {groups.map((group) => {
          const links = group.links.filter(([label]) => typeof label === "string" && !primaryLabels.has(label));
          if (links.length === 0) return null;
          return <section className="mobile-more-group" key={group.label}><p>{group.label}</p>{links.map(([label, href]) => {
            if (!label) return null;
            return href
              ? <Link key={label} href={href} aria-current={label === active ? "page" : undefined} onClick={() => setMoreOpen(false)}>{label}</Link>
              : <span className="mobile-more-disabled" key={label}>{label}<small>Soon</small></span>;
          })}</section>;
        })}
        {isPlatformAdmin && <section className="mobile-more-group"><p>Owner</p><Link href="/admin" aria-current={active === "Admin portal" ? "page" : undefined} onClick={() => setMoreOpen(false)}>Admin portal</Link></section>}
      </div>}
    </nav>
  </aside>;
}
