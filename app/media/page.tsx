import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { MediaUpload } from "@/components/media-upload";
import { WorkspaceGate } from "@/components/workspace-gate";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function MediaPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;
  const { data, error } = await context.supabase.from("media").select("id, storage_path, file_name, mime_type, byte_size, created_at").eq("workspace_id", context.workspace.id).order("created_at", { ascending: false }).limit(200);
  if (error) return <WorkspaceGate state="error" />;
  const assets = await Promise.all((data ?? []).map(async (item) => {
    const { data: signed } = await context.supabase.storage.from("workspace-media").createSignedUrl(item.storage_path, 900);
    return { ...item, url: signed?.signedUrl ?? null };
  }));
  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Media" /><main id="main-content" className="main">
    <header className="topbar"><div><p className="eyebrow">{context.workspace.name} / Manage</p><h1>Media library</h1><p className="page-intro">Private workspace files. Signed links expire automatically; uploads are not public.</p></div></header>
    <section className="card media-upload-card"><header className="card-header"><div><h2>Add to your library</h2><p className="muted" style={{ margin: "4px 0 0" }}>Files stay in private workspace storage</p></div></header><div className="form-body"><MediaUpload workspaceId={context.workspace.id} canUpload={can(context.role, "content.write")} /></div></section>
    <section className="card media-library"><header className="card-header"><div><h2>Your files</h2><p className="muted" style={{ margin: "4px 0 0" }}>{assets.length} {assets.length === 1 ? "file" : "files"}</p></div></header>{assets.length ? <ul className="media-grid">{assets.map((asset) => <li className="media-item" key={asset.id}><div className="media-preview">{asset.url && asset.mime_type.startsWith("image/") ? <img src={asset.url} alt="" /> : <span aria-hidden="true">{asset.mime_type.startsWith("video/") ? "▶" : asset.mime_type.startsWith("audio/") ? "♫" : "▤"}</span>}</div><div className="media-info"><strong title={asset.file_name}>{asset.file_name}</strong><small>{(asset.byte_size / 1024 / 1024).toFixed(1)} MB · {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(asset.created_at))}</small>{asset.url && <a href={asset.url} target="_blank" rel="noreferrer">Open private file ↗</a>}</div></li>)}</ul> : <div className="empty-state"><span className="empty-icon">▧</span><h2>Your library is ready</h2><p>Upload a private asset to keep it with the rest of this workspace.</p></div>}</section>
  </main></div>;
}
