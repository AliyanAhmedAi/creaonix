import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { BrandKitForm } from "@/components/brand-kit-form";
import { WorkspaceGate } from "@/components/workspace-gate";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

export default async function BrandKitPage() {
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;
  const { data, error } = await context.supabase.from("brand_kits").select("audience, voice, topics, call_to_action").eq("workspace_id", context.workspace.id).maybeSingle();
  if (error) return <WorkspaceGate state="error" />;
  const value = data ?? { audience: "", voice: "", topics: "", call_to_action: "" };
  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Brand kit" /><main id="main-content" className="main">
    <header className="topbar"><div><p className="eyebrow">{context.workspace.name} / Workspace</p><h1>Brand Kit</h1><p className="page-intro">Capture the voice and audience that make your content yours. Editors can update this shared context.</p></div></header>
    <section className="card form-card"><header className="card-header"><div><h2>Creative guidelines</h2><p className="muted" style={{ margin: "4px 0 0" }}>Private to this workspace. Used only as drafting guidance in AI Studio.</p></div></header><div className="form-body"><BrandKitForm value={value} canEdit={can(context.role, "content.write")} /></div></section>
  </main></div>;
}
