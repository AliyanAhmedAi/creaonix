-- Secure first-workspace creation and complete the essential foundation policies.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger workspaces_set_updated_at before update on public.workspaces
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.create_workspace(
  p_workspace_name text,
  p_workspace_slug text,
  p_workspace_timezone text default 'UTC'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  created_workspace_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required' using errcode = '28000';
  end if;

  insert into public.workspaces (name, slug, timezone)
  values (trim(p_workspace_name), lower(trim(p_workspace_slug)), p_workspace_timezone)
  returning id into created_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (created_workspace_id, auth.uid(), 'owner');

  return created_workspace_id;
end;
$$;

revoke all on function public.create_workspace(text, text, text) from public;
grant execute on function public.create_workspace(text, text, text) to authenticated;

create policy "profiles insert self" on public.profiles for insert with check (id = auth.uid());
create policy "workspace managers can update workspaces" on public.workspaces for update
using (public.has_workspace_role(id, array['owner', 'admin']::public.workspace_role[]))
with check (public.has_workspace_role(id, array['owner', 'admin']::public.workspace_role[]));
create policy "owners can manage members" on public.workspace_members for insert
with check (public.has_workspace_role(workspace_id, array['owner']::public.workspace_role[]));
create policy "owners can update members" on public.workspace_members for update
using (public.has_workspace_role(workspace_id, array['owner']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner']::public.workspace_role[]));
create policy "owners can remove members" on public.workspace_members for delete
using (public.has_workspace_role(workspace_id, array['owner']::public.workspace_role[]));
