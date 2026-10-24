import type { ContentSummary } from "@/lib/domain/types";

const content: ContentSummary[] = [
  { id: "1", title: "How I plan a full month of creator content", status: "scheduled", platform: "youtube", scheduledFor: "Today, 4:00 PM" },
  { id: "2", title: "3 hooks that stopped my scroll", status: "ready", platform: "tiktok" },
  { id: "3", title: "Behind the scenes: my research process", status: "editing", platform: "instagram" },
  { id: "4", title: "Creator workflow template", status: "published", platform: "youtube" }
];

const statusLabel: Record<ContentSummary["status"], string> = { idea: "Idea", script: "Script", production: "Production", editing: "Editing", ready: "Ready", scheduled: "Scheduled", publishing: "Publishing", published: "Published", failed: "Failed", archived: "Archived" };

export function DashboardOverview() {
  return <>
    <section className="notice"><span className="notice-badge">i</span><p><strong>Preview data only.</strong> Connect Supabase to replace these development examples with real workspace data.</p></section>
    <section className="grid metrics" aria-label="Performance overview">
      <Metric label="Published this month" value="0" trend="Start your first workflow" icon="↗" neutral />
      <Metric label="Upcoming posts" value="0" trend="No posts scheduled" icon="◷" neutral />
      <Metric label="Connected accounts" value="0 / 3" trend="Connect a provider" icon="◎" neutral />
      <Metric label="AI requests" value="2 / 5" trend="3 remaining" icon="✦" />
    </section>
    <section className="card" style={{ marginTop: 16 }}>
      <header className="card-header"><h2>Quick actions</h2></header>
      <div className="quick-actions">
        {[["＋", "Create content"], ["✦", "Generate with AI"], ["↑", "Upload video"], ["▤", "Write a script"], ["◷", "Schedule post"]].map(([icon, label]) => <button className="quick-action" type="button" key={label}><span>{icon}</span>{label}</button>)}
      </div>
    </section>
    <section className="grid content-grid">
      <article className="card"><header className="card-header"><div><h2>Today&apos;s content</h2><p className="muted" style={{ margin: "4px 0 0" }}>Your creator workflow at a glance</p></div><a href="#">View all</a></header>
        <ul className="content-list">{content.map((item) => <li className="content-row" key={item.id}><span className="content-thumb" /><div><div className="content-title">{item.title}</div><div className="content-meta">{item.platform}{item.scheduledFor ? ` · ${item.scheduledFor}` : ""}</div></div><span className={`status ${item.status}`}>{statusLabel[item.status]}</span></li>)}</ul>
      </article>
      <aside className="card"><header className="card-header"><h2>AI recommendations</h2><a href="#">AI Studio</a></header>
        <div className="suggestion"><div className="suggestion-title">Start with a content pillar <span className="tag">Strategy</span></div><p>Define 3 recurring topics to make your next month easier to plan and repurpose.</p></div>
        <div className="suggestion"><div className="suggestion-title">Connect your first channel <span className="tag">Setup</span></div><p>Official provider access lets Creaonix prepare publishing and analytics only where supported.</p></div>
        <div className="suggestion"><div className="suggestion-title">Create a brand kit <span className="tag">AI</span></div><p>Add your voice, CTA, and visual identity before generating scripts or captions.</p></div>
      </aside>
    </section>
  </>;
}

function Metric({ label, value, trend, icon, neutral = false }: { label: string; value: string; trend: string; icon: string; neutral?: boolean }) {
  return <article className="card metric"><div className="metric-top"><span className="metric-label">{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}</div><span className={`trend ${neutral ? "neutral" : ""}`}>{trend}</span></article>;
}
