-- Account-level subscriptions for a free, once-per-account trial and manual paid activation.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'standard' check (plan in ('standard', 'pro', 'max')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'expired', 'canceled')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  current_period_started_at timestamptz,
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
revoke all on table public.subscriptions from anon, authenticated;
grant select on table public.subscriptions to authenticated;
drop policy if exists "users can view their own subscription" on public.subscriptions;
create policy "users can view their own subscription" on public.subscriptions
  for select to authenticated using (user_id = auth.uid());

-- Authenticated users may create a trial for their own account once. The primary key
-- prevents restarting it; there are intentionally no client insert/update/delete grants.
create or replace function public.start_account_trial()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required' using errcode = '28000';
  end if;

  insert into public.subscriptions (user_id, plan, status)
  values (auth.uid(), 'standard', 'trialing')
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.start_account_trial() from public, anon;
grant execute on function public.start_account_trial() to authenticated;

create or replace function public.start_trial_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'standard', 'trialing')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_trial_created on auth.users;
create trigger on_auth_user_trial_created
after insert on auth.users
for each row execute function public.start_trial_for_new_user();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();

comment on table public.subscriptions is
  'One row per auth account. Trial begins at account creation; paid plan activation is performed manually by the project owner after payment.';
