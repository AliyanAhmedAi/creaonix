# Creaonix MVP Development Plan

## Product goal

Creaonix is a secure, AI-powered, multi-tenant SaaS operating system for social-media creators. It should let a creator move through one reliable workflow:

`Create → Store → Edit → Repurpose → Schedule → Publish → Manage Comments → Analyze → Improve`

The initial audience is solo creators and small creator teams publishing to YouTube, Instagram, and TikTok. Support must be capability-driven: only expose features officially available through each provider's API and permissions.

## Technical foundation

| Area | MVP choice |
| --- | --- |
| Web application | Next.js, TypeScript, React |
| UI | Tailwind CSS, shadcn/ui, Lucide React |
| Database, auth, realtime, storage | Supabase PostgreSQL, Auth, Realtime, Storage |
| Validation and forms | Zod, React Hook Form |
| Background work | Redis, BullMQ, Node.js workers |
| Video processing | FFmpeg workers |
| AI | Groq behind an `AIProvider` abstraction |
| Payments | Easypaisa behind a `PaymentProvider` abstraction |
| Analytics charts | Recharts |
| Hosting | Vercel for Next.js; managed Redis and worker/container infrastructure |

Do not create a separate Express backend unless a clear architecture need arises. Long-running work—video processing, transcription, publishing, analytics, payment verification, notifications, and email—must run in background workers, never in request handlers.

## Architecture rules

- Model the product as a multi-tenant workspace SaaS: `User → Workspace → Workspace Members → tenant data`.
- Every tenant-owned table has `workspace_id`; Supabase Row Level Security must enforce isolation.
- Enforce authorization server-side: authentication, workspace membership, role permission, subscription, feature access, and usage limit.
- Use provider/service abstractions for AI, payment, social, storage, email, and video processing; do not scatter vendor calls through the app.
- Keep credentials server-only. Never put API keys, OAuth tokens, or payment secrets in the browser, URLs, localStorage, logs, or `NEXT_PUBLIC_*` variables.
- Persist provider capabilities and have the UI dynamically hide or disable unsupported provider actions.
- Never fake payment confirmation, social publishing, comments, analytics, or other production integration states.

## Initial roles

| Role | Access |
| --- | --- |
| Owner | Full workspace access |
| Admin | Workspace administration |
| Editor | Create and edit content |
| Viewer | Read-only access |

Roles and permissions are enforced on the server, not only through UI visibility.

## Creator MVP capabilities

### Workspace and content

- Email/password authentication, email verification/reset, and Google OAuth.
- Multiple workspaces where allowed by plan; members, roles, profile, account settings, and workspace settings.
- Dashboard focused on “What should I do today?”: quick actions, content status, upcoming schedule, performance, and AI recommendations.
- Central content lifecycle: `IDEA → SCRIPT → PRODUCTION → EDITING → READY → SCHEDULED → PUBLISHING → PUBLISHED`, with `FAILED` and `ARCHIVED` states.
- Content, scripts with versions/autosave, media library, thumbnails, brand kit, and responsive calendar.

### AI

- Provider abstraction with Groq as the first provider.
- Ideas, scripts, hooks, titles, captions, descriptions, rewrites, outlines, and repurposing.
- Brand Kit and authorized workspace context can inform generations.
- AI chat and analytics assistant must only use available data and never invent analytics.
- Enforce plan-based AI quotas and record generations.

### Media and video

- Secure upload and workspace-scoped storage for avatars, assets, videos, thumbnails, audio, documents, and exports.
- Store media metadata: storage path, size, duration, resolution, format, thumbnail, and processing state.
- Worker-driven FFmpeg tasks: trim, cut, crop, resize, conversion, audio extraction, thumbnail extraction, subtitle rendering, clip generation, and 16:9/9:16/1:1 conversion.
- Asynchronous transcription with timestamp segments, subtitle preview/style/export, and creator-approved AI clip suggestions.
- Basic editor only: trim, cut, crop, resize, text/subtitle overlays, aspect ratio, and preview.

### Social, publishing, and community

- OAuth-only connections for YouTube, Instagram, and TikTok; encrypted server-side token storage and refresh/revocation handling.
- `SocialProvider` interface with per-provider `getCapabilities()` for upload, publish, schedule, comments, analytics, thumbnails, captions, and visibility.
- Universal composer with platform-specific title, caption, description, thumbnail, visibility, media, and publishing options.
- Publish now, schedule, reschedule, cancel, and retry through BullMQ. Permanent API errors should not retry indefinitely.
- Calendar month/week/list views with workspace-timezone support and drag-and-drop rescheduling.
- Unified comments inbox and AI reply suggestions; the creator must approve every reply.

### Analytics and notifications

- Scheduled background synchronization of supported provider metrics, storing normalized metrics plus useful raw provider data.
- Date, platform, and content filters; dashboards for views, engagement, followers/subscribers, watch time, likes, comments, and shares where available.
- In-app realtime notifications for processing, publishing, comments, payments, subscription status, and usage warnings.

### Billing and administration

- Configurable Free, Creator, Pro, and Agency plans. Prices and feature limits come from data/config, not frontend constants.
- Central feature-gating API: `canUseFeature`, `checkUsageLimit`, and `getPlanLimits`.
- Track billing-period usage: AI requests, storage, processing minutes, scheduled/published posts, social accounts, team members, and workspaces.
- Easypaisa payment orders and server-side merchant verification. Activate subscriptions only after verified payments; support secure manual admin verification with audit logs if required.
- Billing dashboard: current plan, usage, upgrade/downgrade/renew/cancel, payment history, and grace periods.
- Separate protected admin area: users, workspaces, plans, subscriptions, payments, usage, revenue, system state, and audit logs.

## Data model

At minimum, plan migrations for:

`users`, `workspaces`, `workspace_members`, `plans`, `plan_features`, `subscriptions`, `payments`, `invoices`, `usage`, `content`, `content_versions`, `scripts`, `script_versions`, `media`, `videos`, `thumbnails`, `social_accounts`, `scheduled_posts`, `publishing_jobs`, `comments`, `analytics`, `analytics_snapshots`, `brand_kits`, `notifications`, `ai_generations`, and `audit_logs`.

Use foreign keys, timestamps, appropriate soft deletion, unique constraints, and indexes for `workspace_id`, status, creation time, scheduled time, social account, and subscription status. Apply RLS policies to every workspace-scoped table and storage object.

## Queue design

Create queues for `video-processing`, `transcription`, `ai-processing`, `clip-generation`, `publishing`, `analytics-sync`, `social-sync`, `notifications`, `emails`, and `payment-verification`.

Each job records its type, status, attempt count, timestamps, and safe error detail. Apply exponential backoff only to temporary failures; classify invalid OAuth, permission, invalid-media, and permanent provider failures as non-retriable.

## API and application layout

```text
app/
  (marketing)/ dashboard/ content/ media/ scripts/ calendar/ analytics/
  comments/ ai/ settings/ admin/ api/
components/
  ui/ dashboard/ content/ media/ billing/ analytics/ social/
lib/
  supabase/ ai/ social/ billing/ payments/ storage/ video/ permissions/ notifications/
workers/
  video/ publishing/ analytics/ ai/ notifications/ payments/
database/
  migrations/ seed/
schemas/ types/ services/ docs/ tests/
```

Organize APIs under `/api/content`, `/api/media`, `/api/scripts`, `/api/ai`, `/api/video`, `/api/social`, `/api/publishing`, `/api/comments`, `/api/analytics`, `/api/billing`, `/api/payments`, `/api/usage`, `/api/notifications`, and `/api/admin`. Validate requests with Zod and return consistent, non-sensitive errors.

```json
{
  "success": false,
  "error": {
    "code": "SUBSCRIPTION_LIMIT_REACHED",
    "message": "You have reached your video processing limit."
  }
}
```

## Delivery phases

1. **Foundation** — Next.js setup, design system, Supabase Auth, database, RLS, storage, workspaces, roles.
2. **Creator workspace** — Dashboard, content, media, scripts, Brand Kit, calendar.
3. **AI** — Provider architecture, Groq, chat, content generation, repurposing.
4. **Video** — Upload, workers, FFmpeg, transcription, subtitles, clip finder, basic editing.
5. **Social** — YouTube/Instagram/TikTok OAuth, provider abstraction, capability system.
6. **Publishing** — Composer, platform variants, scheduling, workers, retry policies, calendar refinement.
7. **Community** — Supported comments, notifications, approval-based AI reply suggestions.
8. **Analytics** — Sync workers, dashboards, content analytics, AI analysis.
9. **Monetization** — Plans, usage, Easypaisa, verified payments, subscriptions, billing, gating, renewals and grace periods.
10. **Administration and hardening** — Admin portal, revenue/usage reports, audits, monitoring, security review, and production readiness.

## Security and reliability checklist

- Enforce RLS, server authorization, secure headers, rate limits, CSRF protections where applicable, file validation, and upload limits.
- Encrypt or otherwise securely store provider tokens; never log secrets.
- Use signed URLs for private media access; do not make creator media public by default.
- Treat downgrade and cancellation safely: preserve data, block only new excess usage, warn before any permanent deletion.
- Provide empty, loading, progress, success, and actionable error/retry states for every major asynchronous workflow.
- Use structured logging and monitoring for app, worker, AI, payment, social, video, and OAuth failures.

## Testing and MVP acceptance

Build unit tests for permissions, feature gating, usage calculations, billing calculations, and subscription status. Add integration tests for Supabase, storage, AI provider, social providers, and the approved Easypaisa flow. Add end-to-end coverage for:

`Signup → Create workspace → Create content → Upload video → AI processing → Connect social account → Schedule → Verified payment → Subscription activation`

The MVP is ready only when this core workflow is secure, workspace-isolated, responsive, observable, and works with real provider capabilities—not mocked production states.
