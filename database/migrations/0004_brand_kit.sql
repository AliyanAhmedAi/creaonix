-- One editable brand context per workspace; AI may use it as writing guidance.
create table public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  audience text not null default '' check (char_length(audience) <= 500),
  voice text not null default '' check (char_length(voice) <= 1000),
  topics text not null default '' check (char_length(topics) <= 2000),
  call_to_action text not null default '' check (char_length(call_to_action) <= 500),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brand_kits_set_updated_at before update on public.brand_kits
for each row execute function public.set_updated_at();

alter table public.brand_kits enable row level security;
create policy "workspace members can view brand kit" on public.brand_kits
for select using (public.is_workspace_member(workspace_id));
create policy "editors can create brand kit" on public.brand_kits
for insert with check (
  updated_by = auth.uid()
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[])
);
create policy "editors can update brand kit" on public.brand_kits
for update using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[]))
with check (
  updated_by = auth.uid()
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[])
);
