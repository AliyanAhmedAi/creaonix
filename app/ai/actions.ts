"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { GroqProvider } from "@/lib/ai/groq";
import { can } from "@/lib/permissions/workspace";
import { getWorkspaceContext } from "@/lib/workspaces/context";

const requestSchema = z.object({
  task: z.enum(["ideas", "script"]),
  topic: z.string().trim().min(3, "Add a little more detail about your topic.").max(300),
  audience: z.string().trim().min(2, "Describe who this is for.").max(200),
  tone: z.string().trim().min(2).max(160)
});

export type DraftActionState = { error?: string; output?: string };

export async function generateDraft(_: DraftActionState, formData: FormData): Promise<DraftActionState> {
  const parsed = requestSchema.safeParse({ task: formData.get("task"), topic: formData.get("topic"), audience: formData.get("audience"), tone: formData.get("tone") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your draft details." };
  const context = await getWorkspaceContext();
  if (context.state === "signed-out") redirect("/login");
  if (context.state !== "ready") return { error: "Your workspace isn’t ready. Refresh and try again." };
  if (!can(context.role, "content.write")) return { error: "You need editor access to generate drafts." };
  if (!process.env.GROQ_API_KEY || !process.env.GROQ_MODEL) return { error: "AI is not configured yet. Add GROQ_API_KEY and GROQ_MODEL to the server environment." };

  const { data: brandKit } = await context.supabase.from("brand_kits").select("voice, topics").eq("workspace_id", context.workspace.id).maybeSingle();
  const draftInput = { ...parsed.data, brandVoice: [brandKit?.voice, brandKit?.topics].filter(Boolean).join("\n") || parsed.data.tone };

  let output: string;
  try {
    output = await new GroqProvider().draft(draftInput);
  } catch {
    return { error: "The AI provider couldn’t complete that request. Check the server configuration and try again." };
  }

  const { error } = await context.supabase.from("ai_generations").insert({
    workspace_id: context.workspace.id,
    created_by: context.userId,
    generation_type: parsed.data.task,
    prompt: JSON.stringify(draftInput),
    output,
    model: process.env.GROQ_MODEL
  });
  if (error) return { error: "The draft was generated but couldn’t be saved. Apply migration 0003_creator_ai.sql, then try again." };
  revalidatePath("/ai");
  return { output };
}
