-- Tutor Resource Library
-- Expects public.profiles(id uuid, name text, role text) where role is
-- 'admin' or 'tutor', and public.tutors(id uuid) matching auth.users.id.

create extension if not exists pgcrypto;

create or replace function public.resource_is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.resource_is_tutor()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role in ('tutor', 'admin')) $$;

create table if not exists public.tutor_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text not null default '',
  subject text not null,
  level text,
  storage_path text not null unique,
  file_size bigint not null default 0 check (file_size >= 0),
  access_scope text not null default 'all_tutors' check (access_scope in ('all_tutors', 'specific_tutors')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutor_resource_assignments (
  resource_id uuid not null references public.tutor_resources(id) on delete cascade,
  tutor_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (resource_id, tutor_id)
);

create table if not exists public.tutor_resource_annotations (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.tutor_resources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  annotation_data jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resource_id, user_id, page_number)
);

create table if not exists public.tutor_resource_access_logs (
  id bigint generated always as identity primary key,
  resource_id uuid not null references public.tutor_resources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('view', 'annotation_saved', 'annotation_deleted')),
  accessed_at timestamptz not null default now()
);

create index if not exists tutor_resources_subject_idx on public.tutor_resources(subject);
create index if not exists tutor_resources_status_idx on public.tutor_resources(status);
create index if not exists tutor_resource_assignments_tutor_idx on public.tutor_resource_assignments(tutor_id);
create index if not exists tutor_resource_annotations_lookup_idx on public.tutor_resource_annotations(resource_id, user_id, page_number);
create index if not exists tutor_resource_logs_resource_idx on public.tutor_resource_access_logs(resource_id, accessed_at desc);

create or replace function public.set_resource_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists set_tutor_resources_updated_at on public.tutor_resources;
create trigger set_tutor_resources_updated_at before update on public.tutor_resources
for each row execute function public.set_resource_updated_at();
drop trigger if exists set_tutor_resource_annotations_updated_at on public.tutor_resource_annotations;
create trigger set_tutor_resource_annotations_updated_at before update on public.tutor_resource_annotations
for each row execute function public.set_resource_updated_at();

create or replace function public.can_access_tutor_resource(p_resource_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select public.resource_is_admin() or exists (
    select 1 from public.tutor_resources r
    where r.id = p_resource_id and r.status = 'active'
      and public.resource_is_tutor()
      and (r.access_scope = 'all_tutors' or exists (
        select 1 from public.tutor_resource_assignments a
        where a.resource_id = r.id and a.tutor_id = auth.uid()
      ))
  )
$$;

alter table public.tutor_resources enable row level security;
alter table public.tutor_resource_assignments enable row level security;
alter table public.tutor_resource_annotations enable row level security;
alter table public.tutor_resource_access_logs enable row level security;

create policy "Authorized users read tutor resources" on public.tutor_resources
for select to authenticated using (public.can_access_tutor_resource(id));
create policy "Admins insert tutor resources" on public.tutor_resources
for insert to authenticated with check (public.resource_is_admin() and created_by = auth.uid());
create policy "Admins update tutor resources" on public.tutor_resources
for update to authenticated using (public.resource_is_admin()) with check (public.resource_is_admin());
create policy "Admins delete tutor resources" on public.tutor_resources
for delete to authenticated using (public.resource_is_admin());

create policy "Admins read assignments" on public.tutor_resource_assignments
for select to authenticated using (public.resource_is_admin() or tutor_id = auth.uid());
create policy "Admins insert assignments" on public.tutor_resource_assignments
for insert to authenticated with check (public.resource_is_admin());
create policy "Admins delete assignments" on public.tutor_resource_assignments
for delete to authenticated using (public.resource_is_admin());

create policy "Tutors read own annotations" on public.tutor_resource_annotations
for select to authenticated using (user_id = auth.uid() and public.can_access_tutor_resource(resource_id));
create policy "Tutors create own annotations" on public.tutor_resource_annotations
for insert to authenticated with check (user_id = auth.uid() and public.can_access_tutor_resource(resource_id));
create policy "Tutors update own annotations" on public.tutor_resource_annotations
for update to authenticated using (user_id = auth.uid() and public.can_access_tutor_resource(resource_id))
with check (user_id = auth.uid() and public.can_access_tutor_resource(resource_id));
create policy "Tutors delete own annotations" on public.tutor_resource_annotations
for delete to authenticated using (user_id = auth.uid() and public.can_access_tutor_resource(resource_id));

create policy "Admins read access logs" on public.tutor_resource_access_logs
for select to authenticated using (public.resource_is_admin());
create policy "Users create own access logs" on public.tutor_resource_access_logs
for insert to authenticated with check (user_id = auth.uid() and public.can_access_tutor_resource(resource_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tutor-resources', 'tutor-resources', false, 26214400, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins upload tutor resource PDFs" on storage.objects
for insert to authenticated with check (bucket_id = 'tutor-resources' and public.resource_is_admin());
create policy "Admins update tutor resource PDFs" on storage.objects
for update to authenticated using (bucket_id = 'tutor-resources' and public.resource_is_admin())
with check (bucket_id = 'tutor-resources' and public.resource_is_admin());
create policy "Admins delete tutor resource PDFs" on storage.objects
for delete to authenticated using (bucket_id = 'tutor-resources' and public.resource_is_admin());
create policy "Authorized users read tutor resource PDFs" on storage.objects
for select to authenticated using (
  bucket_id = 'tutor-resources' and exists (
    select 1 from public.tutor_resources r
    where r.storage_path = name and public.can_access_tutor_resource(r.id)
  )
);

revoke all on function public.resource_is_admin() from public;
revoke all on function public.resource_is_tutor() from public;
revoke all on function public.can_access_tutor_resource(uuid) from public;
grant execute on function public.resource_is_admin() to authenticated;
grant execute on function public.resource_is_tutor() to authenticated;
grant execute on function public.can_access_tutor_resource(uuid) to authenticated;
