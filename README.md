# Creonix

The Creonix creator operating system is being implemented from the Foundation phase in [`plan.md`](./plan.md).

## Current slice

- Responsive landing page and workspace dashboard with live workspace-scoped counts
- Workspace, role, content-status, social capability, and provider contracts
- Supabase email/password and Google OAuth routes, session refresh, and workspace onboarding
- Foundation migrations with workspace-scoped RLS and secure workspace onboarding
- Content capture, versioned script editing, workflow editing, UTC planning calendar, Brand Kit, and server-side Groq AI drafts
- Private Supabase media storage with workspace folders, RLS, and expiring signed view links
- Environment and security-header baseline

The dashboard and content library read workspace-scoped rows from Supabase; there are no seeded or fabricated content records. Members with editor access can capture ideas, add notes, and update workflow status; viewers are read-only. Unimplemented destinations are clearly marked “Soon.”

## Local setup

1. Copy `.env.example` to `.env.local` and add a Supabase project URL and anonymous key.
2. Apply migrations `0001_foundation.sql` through `0006_scripts.sql` in order using the Supabase CLI or SQL editor.
3. In Supabase Auth, configure the site's URL and redirect URL for `/auth/callback`. Enable Google only after its OAuth credentials are configured in Supabase.
4. Install packages with `pnpm install`.
5. Start the app with `pnpm dev -- --port 3001` and open `http://localhost:3001`.

Before enabling provider features, implement the relevant server-side provider and validate its official capabilities. Never expose provider, payment, or AI secrets to the browser.

AI Studio requires `GROQ_API_KEY` and `GROQ_MODEL` as server-only environment variables; AI generation is unavailable until both are configured. Calendar entries are planning reminders only; Creonix does not publish posts in this slice. Media uploads use a private Supabase Storage bucket; video transcoding requires a separate worker. Analytics, social OAuth/publishing, comments, billing, and administration remain future integrations; they are not represented as live features.
