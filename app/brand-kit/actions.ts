"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

const brandSchema = z.object({
  audience: z.string().trim().max(500),
  voice: z.string().trim().max(1000),
  topics: z.string().trim().max(2000),
  callToAction: z.string().trim().max(500)
});
export type BrandKitActionState = { error?: string; saved?: boolean };

export async function saveBrandKit(_: BrandKitActionState, formData: FormData): Promise<BrandKitActionState> {
  const parsed = brandSchema.safeParse({ audience: formData.get("audience") ?? "", voice: formData.get("voice") ?? "", topics: formData.get("topics") ?? "", callToAction: formData.get("callToAction") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the brand details." };
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state !== "ready") return { error: "Your workspace isn’t ready. Refresh and try again." };
  if (!can(context.role, "content.write")) return { error: "You need editor access to update the Brand Kit." };

  const existing = await context.supabase.from("brand_kits").select("id").eq("workspace_id", context.workspace.id).maybeSingle();
  if (existing.error) return { error: "Apply migration 0004_brand_kit.sql to enable the Brand Kit." };
  const values = { ...parsed.data, call_to_action: parsed.data.callToAction, updated_by: context.userId, workspace_id: context.workspace.id };
  const result = existing.data
    ? await context.supabase.from("brand_kits").update(values).eq("id", existing.data.id).eq("workspace_id", context.workspace.id)
    : await context.supabase.from("brand_kits").insert(values);
  if (result.error) return { error: "We couldn’t save your Brand Kit. Try again." };
  revalidatePath("/brand-kit");
  revalidatePath("/ai");
  return { saved: true };
}
