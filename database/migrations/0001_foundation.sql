-- Creonix Foundation: identities come from auth.users; all tenant data is workspace-scoped.
create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner', 'admin', 'editor', 'viewer');
create type public.content_status as enum ('idea', 'script', 'production', 'editing', 'ready', 'scheduled', 'publishing', 'published', 'failed', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.content (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  content_type text not null,
  status public.content_status not null default 'idea',
  created_by uuid not null references auth.users(id),
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index content_workspace_created_idx on public.content(workspace_id, created_at desc) where deleted_at is null;
create index content_workspace_status_idx on public.content(workspace_id, status) where deleted_at is null;
create index content_scheduled_idx on public.content(workspace_id, scheduled_for) where scheduled_for is not null and deleted_at is null;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles public.workspace_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid() and role = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.content enable row level security;

create policy "profiles are visible to self" on public.profiles for select using (id = auth.uid());
create policy "profiles update self" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "members can view workspaces" on public.workspaces for select using (public.is_workspace_member(id));
create policy "members can view member list" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "members can view content" on public.content for select using (public.is_workspace_member(workspace_id));
create policy "editors can create content" on public.content for insert with check (
  created_by = auth.uid() and public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[])
);
create policy "editors can update content" on public.content for update using (
  public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[])
) with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[]));
create policy "admins can delete content" on public.content for delete using (
  public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
);
