"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Enter a workspace name.").max(100, "Workspace names may be at most 100 characters."),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens.").max(100)
});

export type WorkspaceActionState = { error?: string };

export async function createWorkspace(_: WorkspaceActionState, formData: FormData): Promise<WorkspaceActionState> {
  const input = workspaceSchema.safeParse({ name: formData.get("name"), slug: formData.get("slug") });
  if (!input.success) return { error: input.error.issues[0]?.message ?? "Check your workspace details." };

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/login");

  const { error } = await supabase.rpc("create_workspace", {
    p_workspace_name: input.data.name,
    p_workspace_slug: input.data.slug
  });
  if (error) {
    return { error: error.code === "23505" ? "That workspace URL is already in use." : "We couldn't create this workspace. Try again." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
