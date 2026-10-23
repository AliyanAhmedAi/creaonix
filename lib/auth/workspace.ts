import { can, type WorkspaceAction } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import type { WorkspaceRole } from "@/lib/domain/types";

export class AuthorizationError extends Error {
  constructor(message = "You are not allowed to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireWorkspacePermission(workspaceId: string, action: WorkspaceAction): Promise<WorkspaceRole> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new AuthorizationError("Sign in to continue.");

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error || !data || !can(data.role as WorkspaceRole, action)) throw new AuthorizationError();
  return data.role as WorkspaceRole;
}
