"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { contentStatuses } from "@/lib/domain/types";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

const contentSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(200, "Titles can be up to 200 characters."),
  description: z.string().trim().max(5000, "Description can be up to 5,000 characters.").optional(),
  contentType: z.enum(["video", "short", "post", "newsletter", "podcast"])
});

export type ContentActionState = { error?: string };

export async function createContent(_: ContentActionState, formData: FormData): Promise<ContentActionState> {
  const parsed = contentSchema.safeParse({
    title: formData.get("title"), description: formData.get("description"), contentType: formData.get("contentType")
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the content details." };

  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state !== "ready") return { error: "Your workspace isn’t ready. Refresh and try again." };
  if (!can(context.role, "content.write")) return { error: "You have view-only access to this workspace." };

  const { error } = await context.supabase.from("content").insert({
    workspace_id: context.workspace.id,
    created_by: context.userId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    content_type: parsed.data.contentType,
    status: "idea"
  });
  if (error) return { error: "We couldn’t save this content. Please try again." };

  revalidatePath("/dashboard");
  revalidatePath("/content");
  redirect("/content");
}

export async function updateContentStatus(formData: FormData): Promise<void> {
  const id = z.string().uuid().safeParse(formData.get("id"));
  const status = z.enum(contentStatuses).safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state !== "ready" || !can(context.role, "content.write")) return;

  let update = context.supabase.from("content").update({ status: status.data })
    .eq("id", id.data).eq("workspace_id", context.workspace.id).is("deleted_at", null);
  if (status.data === "scheduled") update = update.not("scheduled_for", "is", null);
  await update;
  revalidatePath("/dashboard");
  revalidatePath("/content");
}

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Add a title.").max(200, "Titles can be up to 200 characters."),
  description: z.string().trim().max(5000, "Description can be up to 5,000 characters."),
  script: z.string().trim().max(50000, "Scripts can be up to 50,000 characters."),
  status: z.enum(contentStatuses),
  scheduledFor: z.string().optional()
});

export async function updateContent(_: ContentActionState, formData: FormData): Promise<ContentActionState> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"), title: formData.get("title"), description: formData.get("description") ?? "",
    script: formData.get("script") ?? "",
    status: formData.get("status"), scheduledFor: formData.get("scheduledFor")
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the content details." };
  const schedule = parsed.data.scheduledFor;
  if (schedule && Number.isNaN(Date.parse(`${schedule}:00Z`))) return { error: "Choose a valid schedule time." };
  if (parsed.data.status === "scheduled" && !schedule) return { error: "Choose a UTC time before marking this scheduled." };

  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state !== "ready") return { error: "Your workspace isn’t ready. Refresh and try again." };
  if (!can(context.role, "content.write")) return { error: "You have view-only access to this workspace." };

  const nextStatus = schedule ? "scheduled" : parsed.data.status;
  const { error } = await context.supabase.from("content").update({
    title: parsed.data.title,
    description: parsed.data.description || null,
    script: parsed.data.script || null,
    status: nextStatus,
    scheduled_for: schedule ? new Date(`${schedule}:00Z`).toISOString() : null
  }).eq("id", parsed.data.id).eq("workspace_id", context.workspace.id).is("deleted_at", null);
  if (error) return { error: "We couldn’t update this content. Please try again." };

  revalidatePath("/dashboard");
  revalidatePath("/content");
  revalidatePath(`/content/${parsed.data.id}`);
  revalidatePath("/calendar");
  redirect("/content");
}
