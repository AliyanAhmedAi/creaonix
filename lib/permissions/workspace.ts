import type { WorkspaceRole } from "@/lib/domain/types";

export type WorkspaceAction =
  | "workspace.manage"
  | "member.manage"
  | "content.read"
  | "content.write"
  | "content.delete"
  | "billing.manage";

const permissions: Record<WorkspaceRole, readonly WorkspaceAction[]> = {
  owner: ["workspace.manage", "member.manage", "content.read", "content.write", "content.delete", "billing.manage"],
  admin: ["workspace.manage", "member.manage", "content.read", "content.write", "content.delete"],
  editor: ["content.read", "content.write"],
  viewer: ["content.read"]
};

export function can(role: WorkspaceRole, action: WorkspaceAction): boolean {
  return permissions[role].includes(action);
}
