begin;
create or replace function public.complete_content_publication(p_job_id uuid,p_deployment_id text)returns void
language plpgsql set search_path='' as $$
declare v_job public.publication_jobs%rowtype;v_snapshot jsonb;
begin
 select * into v_job from public.publication_jobs where id=p_job_id for update;
 if v_job.status='live' then return;end if;
 if v_job.status<>'building' or v_job.deployment_id is distinct from p_deployment_id then raise exception 'PUBLICATION_MISMATCH';end if;
 select snapshot into v_snapshot from public.content_releases where id=v_job.release_id;
 update public.content_places p set published_revision_id=(v_snapshot->'revisions'->>p.id::text)::uuid where v_snapshot->'revisions' ? p.id::text;
 update public.content_places p set archived_at=case when coalesce(r.content->>'visibility','visible')='archived' then coalesce(p.archived_at,now())else null end from public.content_place_revisions r where r.id=p.published_revision_id and p.kind='offleash';
 update public.content_events e set published_revision_id=(v_snapshot->'eventRevisions'->>e.id::text)::uuid where v_snapshot->'eventRevisions' ? e.id::text;
 insert into public.analytics_event_coverage(event_slug,started_at,actions_started_at)select c->>'slug',now(),now()from jsonb_array_elements(coalesce(v_snapshot->'events','[]'::jsonb))c on conflict(event_slug)do update set actions_started_at=coalesce(analytics_event_coverage.actions_started_at,excluded.actions_started_at);
 update public.publication_jobs set status='live',live_at=now(),updated_at=now()where id=p_job_id;
 insert into public.admin_activity_log(action,release_id,details) values('publication_live',v_job.release_id,jsonb_build_object('deployment_id',p_deployment_id));
end;
$$;

commit;
