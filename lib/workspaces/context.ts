import { createClient } from "@/lib/supabase/server";
import { hasSubscriptionAccess } from "@/lib/billing/access";
import type { Workspace, WorkspaceRole } from "@/lib/domain/types";
import { redirect } from "next/navigation";

export type WorkspaceContext =
  | { state: "setup" }
  | { state: "signed-out" }
  | { state: "needs-workspace" }
  | { state: "error" }
  | { state: "ready"; userId: string; role: WorkspaceRole; workspace: Workspace; supabase: Awaited<ReturnType<typeof createClient>> };

export async function getWorkspaceContext(options: { allowBillingWithoutAccess?: boolean } = {}): Promise<WorkspaceContext> {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    return { state: "setup" };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) return { state: "error" };
  if (!user) return { state: "signed-out" };

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, name, slug, timezone)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return { state: "error" };
  if (!data) return { state: "needs-workspace" };

  const workspace = Array.isArray(data.workspaces) ? data.workspaces[0] : data.workspaces;
  if (!workspace) return { state: "error" };

  if (!options.allowBillingWithoutAccess) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at, current_period_ends_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!hasSubscriptionAccess(subscription)) redirect("/billing");
  }

  return {
    state: "ready",
    userId: user.id,
    role: data.role as WorkspaceRole,
    workspace: workspace as Workspace,
    supabase
  };
}
