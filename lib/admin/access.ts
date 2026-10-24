import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export function getPlatformAdminEmails() {
  return (process.env.CREAONIX_ADMIN_EMAILS ?? process.env.CREONIX_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getPlatformAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    const allowlist = getPlatformAdminEmails();

    return {
      user,
      isAdmin: !error && Boolean(user?.email && allowlist.includes(user.email.toLowerCase())),
      unavailable: Boolean(error)
    };
  } catch {
    // Missing or unreachable Supabase configuration must not crash the admin route.
    return { user: null, isAdmin: false, unavailable: true };
  }
}

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
