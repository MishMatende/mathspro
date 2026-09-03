create extension if not exists pgcrypto;

create table if not exists public.topic_library_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topic_library_subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topic_library_topics(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists topic_library_subtopics_topic_id_idx
  on public.topic_library_subtopics(topic_id);

alter table public.topic_library_topics enable row level security;
alter table public.topic_library_subtopics enable row level security;

create policy "Authenticated users can read topic library topics"
  on public.topic_library_topics for select to authenticated using (true);
create policy "Admins can manage topic library topics"
  on public.topic_library_topics for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Authenticated users can read topic library subtopics"
  on public.topic_library_subtopics for select to authenticated using (true);
create policy "Admins can manage topic library subtopics"
  on public.topic_library_subtopics for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create or replace function public.add_library_topic_to_checklist(
  p_level_id uuid,
  p_library_topic_id uuid,
  p_sort_order integer default 0
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_topic_id uuid;
begin
  insert into public.checklist_topics (level_id, title, sort_order)
  select p_level_id, title, p_sort_order
  from public.topic_library_topics
  where id = p_library_topic_id
  returning id into v_topic_id;

  if v_topic_id is null then
    raise exception 'Topic library entry not found';
  end if;

  insert into public.checklist_subtopics (topic_id, title, sort_order)
  select v_topic_id, title, sort_order
  from public.topic_library_subtopics
  where topic_id = p_library_topic_id
  order by sort_order, created_at;

  return v_topic_id;
end;
$$;

grant execute on function public.add_library_topic_to_checklist(uuid, uuid, integer)
  to authenticated;
