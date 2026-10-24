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

  let authResult: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    authResult = await supabase.auth.getUser();
  } catch {
    return { state: "error" };
  }
  const { data: { user }, error: authError } = authResult;
  if (authError) return { state: "error" };
  if (!user) return { state: "signed-out" };

  let workspace: Workspace;
  let role: WorkspaceRole;
  try {
    const { data, error } = await supabase
      .from("workspace_members")
      .select("role, workspaces(id, name, slug, timezone)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) return { state: "error" };
    if (!data) return { state: "needs-workspace" };

    const relatedWorkspace = Array.isArray(data.workspaces) ? data.workspaces[0] : data.workspaces;
    if (!relatedWorkspace) return { state: "error" };
    workspace = relatedWorkspace as Workspace;
    role = data.role as WorkspaceRole;
  } catch {
    return { state: "error" };
  }

  if (!options.allowBillingWithoutAccess) {
    let subscription;
    try {
      const result = await supabase
        .from("subscriptions")
        .select("status, trial_ends_at, current_period_ends_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (result.error) return { state: "error" };
      subscription = result.data;
    } catch {
      return { state: "error" };
    }
    if (!hasSubscriptionAccess(subscription)) redirect("/billing");
  }

  return {
    state: "ready",
    userId: user.id,
    role,
    workspace,
    supabase
  };
}
