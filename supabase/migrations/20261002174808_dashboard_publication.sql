begin;
create function public.request_content_publication(p_places jsonb,p_actor_id uuid) returns jsonb
language plpgsql set search_path='' as $$
declare v_snapshot jsonb; v_release uuid; v_job uuid; v_sha text; v_selected_count integer;
begin
 perform pg_advisory_xact_lock(hashtextextended('hondaanzee-publication',0));
 if exists(select 1 from public.publication_jobs where status in ('requested','building')) then raise exception 'PUBLICATION_BUSY';end if;
 if jsonb_typeof(p_places) is distinct from 'object' or (select count(*) from jsonb_object_keys(p_places))=0 then raise exception 'NO_CHANGES_SELECTED';end if;
 -- Lock selected places before checking version and freezing revisions.
 perform 1 from public.content_places where id::text in(select jsonb_object_keys(p_places)) order by id for update;
 select count(*) into v_selected_count from public.content_places where p_places ? id::text and version=(p_places->>id::text)::integer and archived_at is null;
 if v_selected_count <> (select count(*) from jsonb_object_keys(p_places)) then raise exception 'VERSION_CONFLICT';end if;
 with selected as (
  select p.*,r.content,r.id as revision_id from public.content_places p
  join public.content_place_revisions r on r.id=case when p_places ? p.id::text then p.draft_revision_id else p.published_revision_id end
  where p.archived_at is null
 )select jsonb_build_object(
 'hotspots',coalesce(jsonb_agg(content order by legacy_id)filter(where kind='hotspot'),'[]'::jsonb),
 'services',coalesce(jsonb_agg(content order by legacy_id)filter(where kind='service'),'[]'::jsonb),
 'revisions',coalesce(jsonb_object_agg(id::text,revision_id::text),'{}'::jsonb)
 )into v_snapshot from selected;
 -- Never publish a new incomplete listing without a real image.
 if exists(select 1 from jsonb_array_elements((v_snapshot->'hotspots')||(v_snapshot->'services')) c where coalesce(c->>'name','')='' or coalesce(c->>'description','')='' or coalesce(c->>'address','')='' or coalesce(c->>'image','')='')then raise exception 'INCOMPLETE_PLACE';end if;
 v_sha=encode(extensions.digest(convert_to(v_snapshot::text,'UTF8'),'sha256'),'hex');
 insert into public.content_releases(snapshot,snapshot_sha256,created_by) values(v_snapshot,v_sha,p_actor_id) returning id into v_release;
 insert into public.publication_jobs(release_id)values(v_release)returning id into v_job;
 insert into public.admin_activity_log(actor_id,action,release_id,details)values(p_actor_id,'request_publication',v_release,jsonb_build_object('selected',p_places));
 return jsonb_build_object('id',v_job,'release_id',v_release,'sha256',v_sha);
end;
$$;
create function public.read_catalog_build(p_release_id uuid default null) returns jsonb
language plpgsql set search_path='' as $$
declare v_release public.content_releases%rowtype;v_id uuid;
begin
 v_id=p_release_id;
 if v_id is null then
  select release_id into v_id from public.publication_jobs where status in ('requested','building','live') order by created_at desc limit 1;
 end if;
 if v_id is null then return jsonb_build_object('releaseId',null);end if;
 select * into v_release from public.content_releases where id=v_id;
 if not found then raise exception 'RELEASE_NOT_FOUND';end if;
 return jsonb_build_object('releaseId',v_release.id,'snapshotJson',v_release.snapshot::text,'sha256',v_release.snapshot_sha256);
end;
$$;
create function public.complete_content_publication(p_job_id uuid,p_deployment_id text)returns void
language plpgsql set search_path='' as $$
declare v_job public.publication_jobs%rowtype;v_snapshot jsonb;
begin
 select * into v_job from public.publication_jobs where id=p_job_id for update;
 if v_job.status='live' then return;end if;
 if v_job.status<>'building' or v_job.deployment_id is distinct from p_deployment_id then raise exception 'PUBLICATION_MISMATCH';end if;
 select snapshot into v_snapshot from public.content_releases where id=v_job.release_id;
 update public.content_places p set published_revision_id=(v_snapshot->'revisions'->>p.id::text)::uuid where v_snapshot->'revisions' ? p.id::text;
 update public.publication_jobs set status='live',live_at=now(),updated_at=now()where id=p_job_id;
 insert into public.admin_activity_log(action,release_id,details) values('publication_live',v_job.release_id,jsonb_build_object('deployment_id',p_deployment_id));
end;
$$;
revoke all on function public.request_content_publication(jsonb,uuid),public.read_catalog_build(uuid),public.complete_content_publication(uuid,text) from public,anon,authenticated;
grant execute on function public.request_content_publication(jsonb,uuid),public.read_catalog_build(uuid),public.complete_content_publication(uuid,text) to service_role;
commit;
