"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export type AuthActionState = { error?: string; message?: string };

export async function signIn(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const input = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!input.success) return { error: input.error.issues[0]?.message ?? "Check your sign-in details." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(input.data);
  if (error) {
    const reason = error.message.toLowerCase();
    if (reason.includes("email not confirmed")) {
      return { error: "Supabase still requires email confirmation for this account. Check the Email provider's Confirm email setting and save it." };
    }
    if (reason.includes("invalid login credentials")) {
      return { error: "Email or password didn't match. Use the exact credentials from signup, or create a new account if signup never completed." };
    }
    if (reason.includes("rate limit") || reason.includes("too many requests")) {
      return { error: "Too many sign-in attempts. Wait a few minutes, then try again." };
    }
    return { error: `Supabase sign-in failed: ${error.message}` };
  }

  redirect("/dashboard");
}

export async function signUp(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const input = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!input.success) return { error: input.error.issues[0]?.message ?? "Check your sign-up details." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const { data, error } = await supabase.auth.signUp({
    ...input.data,
    options: { emailRedirectTo: origin ? `${origin}/auth/callback?next=/dashboard` : undefined }
  });

  if (error) {
    const reason = error.message.toLowerCase();
    if (reason.includes("already registered") || reason.includes("already exists")) {
      return { error: "An account for this email already exists. Try signing in instead." };
    }
    if (reason.includes("rate limit") || reason.includes("too many requests")) {
      return { error: "Too many signup attempts. Wait a few minutes, then try again." };
    }
    if (reason.includes("redirect") || reason.includes("url")) {
      return { error: "Supabase rejected the signup redirect. Add http://localhost:3001/auth/callback to Authentication → URL Configuration → Redirect URLs." };
    }
    return { error: `Supabase signup failed: ${error.message}` };
  }
  if (data.session) redirect("/onboarding");
  return { message: "Account created. Check your inbox to confirm your email, then sign in." };
}

const recoveryEmailSchema = z.object({ email: z.string().trim().email("Enter the email address for your account.") });

export async function requestPasswordReset(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const input = recoveryEmailSchema.safeParse({ email: formData.get("email") });
  if (!input.success) return { error: input.error.issues[0]?.message ?? "Enter a valid email address." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const redirectTo = origin ? `${origin}/auth/callback?next=%2Freset-password%2Fupdate` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(input.data.email, { redirectTo });

  if (error) {
    const reason = error.message.toLowerCase();
    if (reason.includes("rate limit") || reason.includes("too many requests")) {
      return { error: "Too many reset requests. Wait a few minutes before trying again." };
    }
    if (reason.includes("redirect") || reason.includes("url")) {
      return { error: "Supabase rejected the reset redirect. Allow http://localhost:3001/auth/callback in Authentication → URL Configuration → Redirect URLs." };
    }
    return { error: "We couldn't send a reset link. Check the Supabase Auth email settings and try again." };
  }

  // Keep the response identical whether or not the address belongs to an account.
  return { message: "If an account exists for that address, a password reset link will be sent." };
}

const newPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your new password.")
});

export async function updatePassword(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const input = newPasswordSchema.safeParse({ password: formData.get("password"), confirmPassword: formData.get("confirmPassword") });
  if (!input.success) return { error: input.error.issues[0]?.message ?? "Check your new password." };
  if (input.data.password !== input.data.confirmPassword) return { error: "The passwords don't match." };

  const supabase = await createClient();
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !user) return { error: "Your reset link is invalid or has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: input.data.password });
  if (error) return { error: "We couldn't update your password. Request a fresh reset link and try again." };

  redirect("/dashboard");
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: origin ? `${origin}/auth/callback?next=/dashboard` : undefined }
  });

  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
