-- Workspace-private AI generation history. Provider credentials remain server-only.
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  generation_type text not null check (generation_type in ('ideas', 'script')),
  prompt text not null check (char_length(prompt) <= 5000),
  output text not null check (char_length(output) <= 20000),
  model text not null check (char_length(model) between 1 and 120),
  created_at timestamptz not null default now()
);

create index ai_generations_workspace_created_idx on public.ai_generations(workspace_id, created_at desc);
alter table public.ai_generations enable row level security;

create policy "workspace members can view AI history" on public.ai_generations
for select using (public.is_workspace_member(workspace_id));

create policy "editors can save AI generations" on public.ai_generations
for insert with check (
  created_by = auth.uid()
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[])
);
