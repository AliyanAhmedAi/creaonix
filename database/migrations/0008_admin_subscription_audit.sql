-- Audit trail for manual owner actions. Writes use the server-side service role;
-- regular application users must not read or write these records.
create table if not exists public.subscription_admin_events (
  id bigint generated always as identity primary key,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  admin_email text not null,
  action text not null check (action in ('activate', 'trial', 'cancel', 'expire')),
  plan text check (plan is null or plan in ('standard', 'pro', 'max')),
  days integer check (days is null or days between 1 and 365),
  created_at timestamptz not null default now()
);

alter table public.subscription_admin_events enable row level security;
revoke all on table public.subscription_admin_events from anon, authenticated;
comment on table public.subscription_admin_events is
  'Server-side audit log of owner-managed account access and manual subscription changes.';
