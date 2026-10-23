-- Private workspace media metadata and Supabase Storage bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('workspace-media', 'workspace-media', false, 52428800, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime','audio/mpeg','audio/wav','audio/mp4','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create table public.media (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (char_length(mime_type) <= 120),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 52428800),
  created_at timestamptz not null default now()
);
create index media_workspace_created_idx on public.media(workspace_id, created_at desc);
alter table public.media enable row level security;
create policy "workspace members can view media metadata" on public.media for select using (public.is_workspace_member(workspace_id));
create policy "editors can add media metadata" on public.media for insert with check (
  created_by = auth.uid() and storage_path like workspace_id::text || '/%'
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[])
);
create policy "editors can remove media metadata" on public.media for delete using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'editor']::public.workspace_role[]));

create policy "workspace members can read private media" on storage.objects for select using (
  bucket_id = 'workspace-media' and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
);
create policy "editors can upload private media" on storage.objects for insert with check (
  bucket_id = 'workspace-media' and public.has_workspace_role(((storage.foldername(name))[1])::uuid, array['owner', 'admin', 'editor']::public.workspace_role[])
);
create policy "editors can delete private media" on storage.objects for delete using (
  bucket_id = 'workspace-media' and public.has_workspace_role(((storage.foldername(name))[1])::uuid, array['owner', 'admin', 'editor']::public.workspace_role[])
);
