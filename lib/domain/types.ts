export const workspaceRoles = ["owner", "admin", "editor", "viewer"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

export const contentStatuses = [
  "idea",
  "script",
  "production",
  "editing",
  "ready",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "archived"
] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

export type ContentSummary = {
  id: string;
  title: string;
  status: ContentStatus;
  platform: "youtube" | "instagram" | "tiktok";
  scheduledFor?: string;
};
