begin;
create function public.admin_event_publication_states()returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_object_agg(e.id::text,j.status),'{}'::jsonb)
 from public.content_events e join lateral (
  select p.status from public.publication_jobs p join public.content_releases r on r.id=p.release_id
  where r.snapshot->'eventRevisions'->>e.id::text=e.draft_revision_id::text
  order by p.created_at desc limit 1
 )j on true where e.draft_revision_id is distinct from e.published_revision_id;
$$;
revoke all on function public.admin_event_publication_states()from public,anon,authenticated;
grant execute on function public.admin_event_publication_states()to service_role;
commit;
