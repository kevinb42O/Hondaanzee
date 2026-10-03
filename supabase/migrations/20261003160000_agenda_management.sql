begin;
create table public.content_events (
 id uuid primary key default gen_random_uuid(), legacy_id bigint not null unique check(legacy_id>0),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), version integer not null default 1 check(version>0),
 draft_revision_id uuid, published_revision_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.content_event_revisions (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.content_events(id),
 revision_number integer not null check(revision_number>0), content jsonb not null check(jsonb_typeof(content)='object'),
 source text not null check(source in ('legacy_import','dashboard')), created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), unique(event_id,revision_number), unique(event_id,id)
);
alter table public.content_events add constraint content_events_draft_revision_fk foreign key(id,draft_revision_id) references public.content_event_revisions(event_id,id) deferrable initially deferred;
alter table public.content_events add constraint content_events_published_revision_fk foreign key(id,published_revision_id) references public.content_event_revisions(event_id,id) deferrable initially deferred;
create trigger content_event_revisions_immutable before update or delete on public.content_event_revisions for each row execute function public.guard_content_history();
alter table public.content_events enable row level security;
alter table public.content_event_revisions enable row level security;
revoke all on public.content_events,public.content_event_revisions from anon,authenticated;
grant all on public.content_events,public.content_event_revisions to service_role;
alter table public.admin_activity_log add column event_id uuid references public.content_events(id), add column event_revision_id uuid references public.content_event_revisions(id);
create function public.create_content_event_draft(p_slug text,p_content jsonb,p_actor_id uuid) returns jsonb language plpgsql set search_path='' as $$
declare v_id uuid;v_legacy bigint;v_revision uuid;
begin
 if jsonb_typeof(p_content) is distinct from 'object' then raise exception 'INVALID_CONTENT';end if;
 perform pg_advisory_xact_lock(hashtextextended('hondaanzee-event-identity',0));
 select coalesce(max(legacy_id),0)+1 into v_legacy from public.content_events;
 insert into public.content_events(legacy_id,slug)values(v_legacy,p_slug)returning id into v_id;
 insert into public.content_event_revisions(event_id,revision_number,content,source,created_by)values(v_id,1,p_content||jsonb_build_object('id',v_legacy,'slug',p_slug),'dashboard',p_actor_id)returning id into v_revision;
 update public.content_events set draft_revision_id=v_revision where id=v_id;
 insert into public.admin_activity_log(actor_id,action,event_id,event_revision_id)values(p_actor_id,'create_event_draft',v_id,v_revision);
 return jsonb_build_object('id',v_id,'version',1);
end;$$;
create function public.save_content_event_draft(p_event_id uuid,p_expected_version integer,p_content jsonb,p_actor_id uuid)returns jsonb language plpgsql set search_path='' as $$
declare v_event public.content_events%rowtype;v_revision uuid;
begin
 select * into v_event from public.content_events where id=p_event_id for update;
 if not found then raise exception 'EVENT_NOT_FOUND';end if;
 if v_event.version<>p_expected_version then raise exception 'VERSION_CONFLICT';end if;
 if jsonb_typeof(p_content) is distinct from 'object' or p_content->>'id' is distinct from v_event.legacy_id::text or p_content->>'slug' is distinct from v_event.slug then raise exception 'EVENT_IDENTITY_CHANGE';end if;
 insert into public.content_event_revisions(event_id,revision_number,content,source,created_by)values(p_event_id,v_event.version+1,p_content,'dashboard',p_actor_id)returning id into v_revision;
 update public.content_events set version=version+1,draft_revision_id=v_revision,updated_at=now()where id=p_event_id;
 insert into public.admin_activity_log(actor_id,action,event_id,event_revision_id)values(p_actor_id,'save_event_draft',p_event_id,v_revision);
 return jsonb_build_object('revision_id',v_revision,'version',v_event.version+1);
end;$$;
revoke all on function public.create_content_event_draft(text,jsonb,uuid),public.save_content_event_draft(uuid,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.create_content_event_draft(text,jsonb,uuid),public.save_content_event_draft(uuid,integer,jsonb,uuid) to service_role;
create or replace function public.request_full_content_publication(p_places jsonb,p_events jsonb,p_actor_id uuid) returns jsonb
language plpgsql set search_path='' as $$
declare v_snapshot jsonb; v_release uuid; v_job uuid; v_sha text; v_selected_count integer;
begin
 perform pg_advisory_xact_lock(hashtextextended('hondaanzee-publication',0));
 if exists(select 1 from public.publication_jobs where status in ('requested','building')) then raise exception 'PUBLICATION_BUSY';end if;
 if jsonb_typeof(p_places) is distinct from 'object' or jsonb_typeof(p_events) is distinct from 'object' or ((select count(*) from jsonb_object_keys(p_places))+(select count(*) from jsonb_object_keys(p_events)))=0 then raise exception 'NO_CHANGES_SELECTED';end if;
 -- Lock selected places before checking version and freezing revisions.
 perform 1 from public.content_places where id::text in(select jsonb_object_keys(p_places)) order by id for update;
 select count(*) into v_selected_count from public.content_places where p_places ? id::text and version=(p_places->>id::text)::integer and (archived_at is null or kind='offleash');
 if v_selected_count <> (select count(*) from jsonb_object_keys(p_places)) then raise exception 'VERSION_CONFLICT';end if;
 perform 1 from public.content_events where id::text in(select jsonb_object_keys(p_events)) order by id for update;
 select count(*) into v_selected_count from public.content_events where p_events ? id::text and version=(p_events->>id::text)::integer;
 if v_selected_count <> (select count(*) from jsonb_object_keys(p_events)) then raise exception 'VERSION_CONFLICT';end if;
 with selected as (
  select p.*,r.content,r.id as revision_id from public.content_places p
  join public.content_place_revisions r on r.id=case when p_places ? p.id::text then p.draft_revision_id else p.published_revision_id end
  where p.archived_at is null or p.kind='offleash'
 )select jsonb_build_object(
 'hotspots',coalesce(jsonb_agg(content order by legacy_id)filter(where kind='hotspot'),'[]'::jsonb),
 'offLeashAreas',coalesce(jsonb_agg(content order by legacy_id)filter(where kind='offleash' and coalesce(content->>'visibility','visible')<>'archived'),'[]'::jsonb),
 'services',coalesce(jsonb_agg(content order by legacy_id)filter(where kind='service'),'[]'::jsonb),
 'revisions',coalesce(jsonb_object_agg(id::text,revision_id::text),'{}'::jsonb)
 )into v_snapshot from selected;
 v_snapshot=v_snapshot || (select jsonb_build_object(
 'events',coalesce(jsonb_agg(r.content order by e.legacy_id) filter(where coalesce(r.content->>'visibility','visible')<>'withdrawn'),'[]'::jsonb),
 'eventRevisions',coalesce(jsonb_object_agg(e.id::text,r.id::text),'{}'::jsonb))
 from public.content_events e join public.content_event_revisions r on r.id=case when p_events ? e.id::text then e.draft_revision_id else e.published_revision_id end);
 if exists(select 1 from jsonb_array_elements(v_snapshot->'events') c where coalesce(c->>'title','')='' or coalesce(c->>'description','')='' or coalesce(c->>'location','')='' or coalesce(c->>'date','')='' or coalesce(c->>'cityName','')='')then raise exception 'INCOMPLETE_EVENT';end if;
 -- Never publish a new incomplete listing without a real image.
 if exists(select 1 from jsonb_array_elements((v_snapshot->'hotspots')||(v_snapshot->'services')) c where coalesce(c->>'name','')='' or coalesce(c->>'description','')='' or coalesce(c->>'address','')='' or coalesce(c->>'image','')='')then raise exception 'INCOMPLETE_PLACE';end if;
 if exists(select 1 from jsonb_array_elements(v_snapshot->'offLeashAreas') c where coalesce(c->>'name','')='' or coalesce(c->>'description','')='' or coalesce(c->>'address','')='' or not(c ? 'lat' and c ? 'lng'))then raise exception 'INCOMPLETE_PLACE';end if;
 v_sha=encode(extensions.digest(convert_to(v_snapshot::text,'UTF8'),'sha256'),'hex');
 insert into public.content_releases(snapshot,snapshot_sha256,created_by) values(v_snapshot,v_sha,p_actor_id) returning id into v_release;
 insert into public.publication_jobs(release_id)values(v_release)returning id into v_job;
 insert into public.admin_activity_log(actor_id,action,release_id,details)values(p_actor_id,'request_publication',v_release,jsonb_build_object('selected',p_places,'events',p_events));
 return jsonb_build_object('id',v_job,'release_id',v_release,'sha256',v_sha);
end;
$$;

create or replace function public.request_content_publication(p_places jsonb,p_actor_id uuid)returns jsonb language sql set search_path='' as $$ select public.request_full_content_publication(p_places,'{}'::jsonb,p_actor_id); $$;
revoke all on function public.request_full_content_publication(jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.request_full_content_publication(jsonb,jsonb,uuid) to service_role;
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
 update public.publication_jobs set status='live',live_at=now(),updated_at=now()where id=p_job_id;
 insert into public.admin_activity_log(action,release_id,details) values('publication_live',v_job.release_id,jsonb_build_object('deployment_id',p_deployment_id));
end;
$$;

alter table public.analytics_daily drop constraint analytics_daily_event_check;
alter table public.analytics_daily add constraint analytics_daily_event_check check(event in('pageview','website','route','telefoon','social','ticket','email'));
alter table public.analytics_hourly drop constraint analytics_hourly_event_check;
alter table public.analytics_hourly add constraint analytics_hourly_event_check check(event in('pageview','website','route','telefoon','social','ticket','email'));
create table public.analytics_event_coverage(event_slug text primary key,started_at timestamptz not null default now(),actions_started_at timestamptz);
alter table public.analytics_event_coverage enable row level security;
revoke all on public.analytics_event_coverage from anon,authenticated;
grant all on public.analytics_event_coverage to service_role;
create or replace function public.record_site_analytics(p_path text,p_event text,p_referrer text,p_device text,p_fingerprint text)
returns boolean language plpgsql set search_path='' as $$
declare v_day date=(now()at time zone'Europe/Brussels')::date;v_count integer;v_hour timestamptz=date_trunc('hour',now()at time zone'UTC')at time zone'UTC';
begin
 insert into public.analytics_daily_budget(day,count)values(v_day,1)on conflict(day)do update set count=analytics_daily_budget.count+1 where analytics_daily_budget.count<100000 returning count into v_count;
 if v_count is null then return false;end if;
 insert into public.analytics_rate_limits(day,fingerprint,count)values(v_day,p_fingerprint,1)on conflict(day,fingerprint)do update set count=analytics_rate_limits.count+1 where analytics_rate_limits.count<600 returning count into v_count;
 if v_count is null then return false;end if;
 insert into public.analytics_daily(day,path,event,referrer,device,count)values(v_day,p_path,p_event,p_referrer,p_device,1)on conflict(day,path,event,referrer,device)do update set count=analytics_daily.count+1;
 insert into public.analytics_hourly(hour,path,event,referrer,device,count)values(v_hour,p_path,p_event,p_referrer,p_device,1)on conflict(hour,path,event,referrer,device)do update set count=analytics_hourly.count+1;
 return true;
end;$$;
commit;
