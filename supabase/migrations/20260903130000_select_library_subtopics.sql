drop function if exists public.add_library_topic_to_checklist(uuid, uuid, integer);

create or replace function public.add_library_topic_to_checklist(
  p_level_id uuid,
  p_library_topic_id uuid,
  p_subtopic_ids uuid[],
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
    and id = any(coalesce(p_subtopic_ids, array[]::uuid[]))
  order by sort_order, created_at;

  return v_topic_id;
end;
$$;

grant execute on function public.add_library_topic_to_checklist(uuid, uuid, uuid[], integer)
  to authenticated;
