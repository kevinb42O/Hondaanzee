-- Run inside a transaction and roll back all test content, releases and counters.
do $$
declare e public.content_events%rowtype;actor uuid;changed jsonb;job jsonb;snapshot jsonb;before_count bigint;
begin
 select id into actor from auth.users where email='admin@hondaanzee.be';
 select * into e from public.content_events order by legacy_id limit 1;
 select content||jsonb_build_object('subtitle','Rollback-only draft')into changed from public.content_event_revisions where id=e.draft_revision_id;
 perform public.save_content_event_draft(e.id,e.version,changed,actor);
 if(select published_revision_id from public.content_events where id=e.id)<>e.published_revision_id then raise exception 'DRAFT_LEAK';end if;
 begin perform public.save_content_event_draft(e.id,e.version,changed,actor);raise exception 'CONFLICT_NOT_CAUGHT';exception when others then if sqlerrm<>'VERSION_CONFLICT' then raise;end if;end;
 begin update public.content_event_revisions set content=changed where id=e.published_revision_id;raise exception 'HISTORY_MUTATED';exception when others then if sqlerrm<>'CONTENT_HISTORY_IMMUTABLE' then raise;end if;end;
 job=public.request_full_content_publication('{}',jsonb_build_object(e.id::text,e.version+1),actor);
 if public.admin_event_publication_states()->>e.id::text<>'requested' then raise exception 'EVENT_PUBLICATION_STATE';end if;
 select r.snapshot into snapshot from public.content_releases r where id=(job->>'release_id')::uuid;
 if jsonb_array_length(snapshot->'events')<>21 or jsonb_array_length(snapshot->'hotspots')<>133 or jsonb_array_length(snapshot->'services')<>24 or jsonb_array_length(snapshot->'offLeashAreas')<>27 then raise exception 'CATALOG_LOSS';end if;
 if not exists(select 1 from jsonb_array_elements(snapshot->'events')c where c->>'subtitle'='Rollback-only draft')then raise exception 'SELECTION_LOST';end if;
 update public.publication_jobs set status='building',deployment_id='rollback-test' where id=(job->>'id')::uuid;
 perform public.complete_content_publication((job->>'id')::uuid,'rollback-test');
 if(select published_revision_id=draft_revision_id from public.content_events where id=e.id)is not true then raise exception 'COMPLETION_LOST';end if;
 changed=changed||jsonb_build_object('visibility','withdrawn','withdrawalReason','Rollback-only test');
 perform public.save_content_event_draft(e.id,e.version+1,changed,actor);
 job=public.request_full_content_publication('{}',jsonb_build_object(e.id::text,e.version+2),actor);
 select r.snapshot into snapshot from public.content_releases r where id=(job->>'release_id')::uuid;
 if jsonb_array_length(snapshot->'events')<>20 or not(snapshot->'eventRevisions' ? e.id::text)then raise exception 'WITHDRAWAL_LOST';end if;
 if has_table_privilege('anon','public.content_events','SELECT')or has_table_privilege('authenticated','public.content_event_revisions','SELECT')or has_function_privilege('authenticated','public.save_content_event_draft(uuid,integer,jsonb,uuid)','EXECUTE')then raise exception 'DRAFT_ACCESS_LEAK';end if;
 select coalesce(sum(count),0)into before_count from public.analytics_daily where path='/agenda/rollback-only';
 perform public.record_site_analytics('/agenda/rollback-only','ticket','direct','desktop',repeat('e',64));
 if(select coalesce(sum(count),0)from public.analytics_daily where path='/agenda/rollback-only')<>before_count+1 then raise exception 'TICKET_COUNT_FAILED';end if;
end$$;
