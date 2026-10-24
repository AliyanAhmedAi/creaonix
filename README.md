# Creaonix

The Creaonix creator operating system is being implemented from the Foundation phase in [`plan.md`](./plan.md).

## Current slice

- Responsive landing page and workspace dashboard with live workspace-scoped counts
- Workspace, role, content-status, social capability, and provider contracts
- Supabase email/password and Google OAuth routes, session refresh, and workspace onboarding
- Foundation migrations with workspace-scoped RLS and secure workspace onboarding
- Content capture, versioned script editing, workflow editing, UTC planning calendar, Brand Kit, and server-side Groq AI drafts
- Private Supabase media storage with workspace folders, RLS, and expiring signed view links
- Standard, Pro, and Max monthly plans with a one-time 7-day trial and owner-managed manual activation after payment
- Restricted admin portal for subscription management, password-reset emails, and soft-deleting user sign-in accounts
- Environment and security-header baseline

The dashboard and content library read workspace-scoped rows from Supabase; there are no seeded or fabricated content records. Members with editor access can capture ideas, add notes, and update workflow status; viewers are read-only. Unimplemented destinations are clearly marked “Soon.”

## Local setup

1. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase **Project Settings → API**. These are the project URL and publishable/anon key, not a secret key.
2. For the owner portal, set `SUPABASE_SERVICE_ROLE_KEY` to the server-only service-role/secret key, and set `CREAONIX_ADMIN_EMAILS` to a comma-separated allowlist containing your owner sign-in email. Never use a `NEXT_PUBLIC_` prefix for the service-role key, and never commit `.env.local` or paste secret keys into source files.
3. Apply the complete SQL contents of migrations `0001_foundation.sql` through `0008_admin_subscription_audit.sql` in order, one migration at a time, using the Supabase CLI or SQL Editor. In SQL Editor, paste the contents of each `.sql` file—not the filename—and run it. `0007` creates one 7-day trial per Auth account; `0008` adds the private audit table for owner subscription actions. A successful schema migration normally returns “Success. No rows returned.”
4. In Supabase Auth, configure the site's URL and redirect URL for `/auth/callback`. Enable Google only after its OAuth credentials are configured in Supabase.
5. Install packages with `pnpm install`.
6. Start the app with `pnpm dev -- --port 3001` and open `http://localhost:3001`.

Paid plans are not charged by Creaonix: plan buttons open WhatsApp with the selected plan and price. The owner confirms payment and activates access in `/admin`; activation grants 30 days. The portal can send a Supabase password-recovery email and soft-delete an account's sign-in identity while preserving workspace content. It cannot view a user's existing password. User password-reset email delivery depends on Supabase Auth SMTP/email configuration.

Before enabling provider features, implement the relevant server-side provider and validate its official capabilities. Never expose provider, payment, or AI secrets to the browser.

AI Studio requires `GROQ_API_KEY` and `GROQ_MODEL` as server-only environment variables; AI generation is unavailable until both are configured. Calendar entries are planning reminders only; Creaonix does not publish posts in this slice. Media uploads use a private Supabase Storage bucket; video transcoding requires a separate worker. Automated payment processing, analytics, social OAuth/publishing, and comments remain future integrations; they are not represented as live features.
