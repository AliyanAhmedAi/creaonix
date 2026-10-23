import Link from "next/link";
import type { ContentStatus } from "@/lib/domain/types";

type RecentContent = { id: string; title: string; status: ContentStatus; content_type: string; created_at: string };
const statusLabel: Record<ContentStatus, string> = { idea: "Idea", script: "Script", production: "Production", editing: "Editing", ready: "Ready", scheduled: "Scheduled", publishing: "Publishing", published: "Published", failed: "Failed", archived: "Archived" };

export function DashboardRealData({ counts, recent }: { counts: { total: number; active: number; ready: number; published: number }; recent: RecentContent[] }) {
  return <>
    <section className="notice"><span className="notice-badge" aria-hidden="true">✦</span><p><strong>Your creative home base.</strong> Capture ideas here and move them forward when you’re ready.</p></section>
    <section className="grid metrics" aria-label="Workspace overview">
      <Metric label="Content in workspace" value={counts.total} detail="All saved ideas and drafts" icon="▤" />
      <Metric label="In progress" value={counts.active} detail="Ideas, scripts, and production" icon="◷" />
      <Metric label="Ready to publish" value={counts.ready} detail="Prepared for your next step" icon="↗" />
      <Metric label="Published" value={counts.published} detail="Across your workspace" icon="✓" />
    </section>
    <section className="grid content-grid">
      <article className="card"><header className="card-header"><div><h2>Recently updated</h2><p className="muted" style={{ margin: "4px 0 0" }}>Your latest ideas and drafts</p></div><Link href="/content">View all</Link></header>
        {recent.length ? <ul className="content-list">{recent.map((item) => <li className="content-row" key={item.id}><span className="content-thumb" aria-hidden="true" /><div><div className="content-title">{item.title}</div><div className="content-meta">{item.content_type.replaceAll("_", " ")} · {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(item.created_at))}</div></div><span className={`status ${item.status}`}>{statusLabel[item.status]}</span></li>)}</ul> : <div className="dashboard-empty"><p>Your first idea is one small step away.</p><Link className="button secondary" href="/content/new">Create an idea</Link></div>}
      </article>
      <aside className="card"><header className="card-header"><h2>Make room for ideas</h2></header>
        <div className="suggestion"><div className="suggestion-title">Start with a rough title <span className="tag">01</span></div><p>A working title is enough. Add context now and shape the idea later.</p></div>
        <div className="suggestion"><div className="suggestion-title">Keep your workflow yours <span className="tag">02</span></div><p>Move each piece from idea to published at your own pace. Nothing is scheduled automatically.</p></div>
        <div className="suggestion"><div className="suggestion-title">Come back when you’re ready <span className="tag">03</span></div><p>Your workspace keeps saved ideas together, ready for the next creative session.</p></div>
      </aside>
    </section>
  </>;
}

function Metric({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: string }) {
  return <article className="card metric"><div className="metric-top"><span className="metric-label">{label}</span><span className="metric-icon" aria-hidden="true">{icon}</span></div><div className="metric-value">{value}</div><span className="trend neutral">{detail}</span></article>;
}
