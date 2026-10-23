-- Workspace-scoped script editing and immutable snapshots of non-empty revisions.
alter table public.content
  add column script text check (script is null or char_length(script) <= 50000);

create table public.script_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  content_id uuid not null references public.content(id) on delete cascade,
  body text not null check (char_length(body) <= 50000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index script_versions_content_created_idx
  on public.script_versions(content_id, created_at desc);

alter table public.script_versions enable row level security;

create policy "members can view script versions"
  on public.script_versions for select
  using (public.is_workspace_member(workspace_id));

create or replace function public.snapshot_content_script()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.script is not null and length(trim(new.script)) > 0
     and new.script is distinct from old.script then
    insert into public.script_versions(workspace_id, content_id, body, created_by)
    values (new.workspace_id, new.id, new.script, auth.uid());
  end if;
  return new;
end;
$$;

create trigger content_script_version_after_update
  after update of script on public.content
  for each row execute function public.snapshot_content_script();

create trigger content_script_version_after_insert
  after insert on public.content
  for each row when (new.script is not null and length(trim(new.script)) > 0)
  execute function public.snapshot_content_script();
