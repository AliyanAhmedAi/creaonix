"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSupabaseClient, getPlatformAdmin } from "@/lib/admin/access";
import { createClient } from "@/lib/supabase/server";

const subscriptionForm = z.object({
  email: z.string().trim().email().max(320),
  action: z.enum(["activate", "cancel", "expire"]),
  plan: z.enum(["standard", "pro", "max"])
});

const emailSchema = z.string().trim().email().max(320);

async function findUserByEmail(admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>, email: string) {
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) return { user: null, error };
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user) return { user, error: null };
    if (data.users.length < 100) break;
  }
  return { user: null, error: null };
}

export async function sendClientPasswordReset(formData: FormData) {
  const { isAdmin } = await getPlatformAdmin();
  if (!isAdmin) redirect("/login");
  const input = emailSchema.safeParse(formData.get("email"));
  if (!input.success) redirect("/admin?result=invalid");

  const admin = createAdminSupabaseClient();
  if (!admin) redirect("/admin?result=configuration");
  const { user, error: lookupError } = await findUserByEmail(admin, input.data.toLowerCase());
  if (lookupError) redirect("/admin?result=lookup-error");
  if (!user) redirect("/admin?result=user-not-found");

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const redirectTo = origin ? `${origin}/auth/callback?next=%2Freset-password%2Fupdate` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(user.email!, { redirectTo });
  if (error) redirect("/admin?result=reset-error");

  revalidatePath("/admin");
  redirect("/admin?result=reset-requested");
}

export async function softDeleteClientAccount(formData: FormData) {
  const { isAdmin } = await getPlatformAdmin();
  if (!isAdmin) redirect("/login");
  const email = emailSchema.safeParse(formData.get("email"));
  const confirmation = emailSchema.safeParse(formData.get("confirmEmail"));
  if (!email.success || !confirmation.success || email.data.toLowerCase() !== confirmation.data.toLowerCase()) {
    redirect("/admin?result=delete-confirmation");
  }

  const admin = createAdminSupabaseClient();
  if (!admin) redirect("/admin?result=configuration");
  const normalizedEmail = email.data.toLowerCase();
  const protectedAdmins = (process.env.CREONIX_ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (protectedAdmins.includes(normalizedEmail)) redirect("/admin?result=protected-admin");

  const { user, error: lookupError } = await findUserByEmail(admin, normalizedEmail);
  if (lookupError) redirect("/admin?result=lookup-error");
  if (!user) redirect("/admin?result=user-not-found");

  // Soft-delete the Auth identity: this disables the sign-in account while preserving
  // workspace content and avoiding destructive cascades across shared client data.
  const { error } = await admin.auth.admin.deleteUser(user.id, true);
  if (error) redirect("/admin?result=delete-error");

  const { error: subscriptionError } = await admin.from("subscriptions").update({
    status: "canceled",
    current_period_ends_at: new Date().toISOString()
  }).eq("user_id", user.id);

  revalidatePath("/admin");
  revalidatePath("/billing");
  redirect(subscriptionError ? "/admin?result=deleted-status-warning" : "/admin?result=account-deleted");
}

export async function updateSubscription(formData: FormData) {
  const { isAdmin } = await getPlatformAdmin();
  if (!isAdmin) redirect("/login");

  const input = subscriptionForm.safeParse({
    email: formData.get("email"),
    action: formData.get("action"),
    plan: formData.get("plan")
  });
  if (!input.success) redirect("/admin?result=invalid");

  const admin = createAdminSupabaseClient();
  if (!admin) redirect("/admin?result=configuration");

  const { user: targetUser, error: lookupError } = await findUserByEmail(admin, input.data.email.toLowerCase());
  if (lookupError) redirect("/admin?result=lookup-error");
  if (!targetUser) redirect("/admin?result=user-not-found");

  const now = new Date();
  const subscriptions = admin.from("subscriptions");
  let error;
  if (input.data.action === "activate") {
    const { data: existing, error: lookupError } = await subscriptions
      .select("user_id")
      .eq("user_id", targetUser.id)
      .maybeSingle();
    if (lookupError) redirect("/admin?result=save-error");

    const paidAccess = {
      plan: input.data.plan,
      status: "active",
      current_period_started_at: now.toISOString(),
      current_period_ends_at: new Date(now.getTime() + 30 * 86_400_000).toISOString()
    };
    const result = existing
      ? await subscriptions.update(paidAccess).eq("user_id", targetUser.id)
      : await subscriptions.insert({ user_id: targetUser.id, ...paidAccess });
    error = result.error;
  } else {
    const update = {
      status: input.data.action === "cancel" ? "canceled" : "expired",
      current_period_ends_at: now.toISOString()
    };
    const { data: existing, error: lookupError } = await subscriptions
      .select("user_id")
      .eq("user_id", targetUser.id)
      .maybeSingle();
    if (lookupError) redirect("/admin?result=save-error");
    const result = existing
      ? await subscriptions.update(update).eq("user_id", targetUser.id)
      : await subscriptions.insert({ user_id: targetUser.id, plan: "standard", ...update });
    error = result.error;
  }
  if (error) redirect("/admin?result=save-error");

  const { user: adminUser } = await getPlatformAdmin();
  if (adminUser?.email) {
    await admin.from("subscription_admin_events").insert({
      target_user_id: targetUser.id,
      admin_email: adminUser.email,
      action: input.data.action,
      plan: input.data.action === "activate" ? input.data.plan : null,
      days: null
    });
  }

  revalidatePath("/admin");
  revalidatePath("/billing");
  redirect("/admin?result=updated");
}
