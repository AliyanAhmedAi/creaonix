import Link from "next/link";
import type { ContentStatus } from "@/lib/domain/types";
import { updateContentStatus } from "@/app/content/actions";

type Item = { id: string; title: string; description: string | null; content_type: string; status: ContentStatus; created_at: string };
const labels: Record<ContentStatus, string> = { idea: "Idea", script: "Script", production: "Production", editing: "Editing", ready: "Ready", scheduled: "Scheduled", publishing: "Publishing", published: "Published", failed: "Failed", archived: "Archived" };

export function ContentTable({ items, canEdit }: { items: Item[]; canEdit: boolean }) {
  if (items.length === 0) return <div className="empty-state"><span className="empty-icon">✦</span><h2>Your content space starts here</h2><p>Save your first idea, then move it through your creative workflow.</p><Link className="button primary" href="/content/new">Create your first idea</Link></div>;
  return <div className="table-wrap"><table className="content-table"><thead><tr><th scope="col">Title</th><th scope="col">Format</th><th scope="col">Created</th><th scope="col">Status</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}>
    <th scope="row"><Link className="table-title table-link" href={`/content/${item.id}`}>{item.title}</Link>{item.description && <span className="table-description">{item.description}</span>}</th>
    <td>{item.content_type.replaceAll("_", " ")}</td><td>{new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td>
    <td>{canEdit ? <form action={updateContentStatus}><input type="hidden" name="id" value={item.id} /><label className="sr-only" htmlFor={`status-${item.id}`}>Status for {item.title}</label><select id={`status-${item.id}`} name="status" className={`status-select status ${item.status}`} defaultValue={item.status} onChange={(event) => event.currentTarget.form?.requestSubmit()}>{Object.entries(labels).filter(([value]) => value !== "scheduled" || item.status === "scheduled").map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></form> : <span className={`status ${item.status}`}>{labels[item.status]}</span>}</td>
  </tr>)}</tbody></table></div>;
}
