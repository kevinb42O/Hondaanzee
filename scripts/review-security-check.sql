-- Run through a privileged SQL connection. All test data/actions roll back.
begin;
do $tests$
declare r public.reviews%rowtype; z public.content_places%rowtype; v_id uuid; job jsonb; n integer;
begin
 select * into r from public.reviews order by id limit 1;
 select * into z from public.content_places where id=r.zone_id;
 v_id=public.submit_zone_review(z.slug,2,'Transaction test','Original test text',null,repeat('b',64));
 if exists(select 1 from jsonb_array_elements(public.public_zone_reviews(z.slug)->'reviews')x where x->>'id'=v_id::text)then raise exception 'PENDING_EXPOSED';end if;
 perform public.moderate_zone_review(v_id,1,'publish','','',null,null,null);
 perform public.flag_zone_review(v_id,'privacy',repeat('c',64));
 if(public.admin_review_overview()->'zones'->z.id::text->>'attention')::int<1 then raise exception 'FLAG_ATTENTION_MISSING';end if;
 perform public.moderate_zone_review(v_id,2,'redact','Privacy test','','Redacted name','Redacted text',null);
 if(select comment from public.reviews where id=v_id)<>'Original test text'then raise exception 'ORIGINAL_CHANGED';end if;
 if not exists(select 1 from jsonb_array_elements(public.public_zone_reviews(z.slug)->'reviews')x where x->>'id'=v_id::text and x->>'comment'='Redacted text')then raise exception 'REDACTION_NOT_PUBLIC';end if;
 perform public.moderate_zone_review(v_id,3,'hide','Test reason','Internal test note',null,null,null);
 if exists(select 1 from jsonb_array_elements(public.public_zone_reviews(z.slug)->'reviews')x where x->>'id'=v_id::text)then raise exception 'HIDDEN_EXPOSED';end if;
 begin perform public.moderate_zone_review(v_id,3,'publish','','',null,null,null);raise exception 'EXPECTED_CONFLICT';exception when others then if sqlerrm<>'VERSION_CONFLICT'then raise;end if;end;
 perform public.moderate_zone_review(v_id,4,'restore','','',null,null,null);
 if(select status from public.reviews where id=v_id)<>'pending'then raise exception 'RESTORE_PUBLISHED';end if;
 begin update public.reviews set rating=5 where id=v_id;raise exception 'EXPECTED_IMMUTABLE';exception when others then if sqlerrm<>'REVIEW_ORIGINAL_IMMUTABLE'then raise;end if;end;
 -- Archive/restore is a production publication choice; never a destructive delete.
 perform public.save_content_place_draft(z.id,z.version,(select content from public.content_place_revisions where id=z.draft_revision_id)||'{"visibility":"archived"}'::jsonb,null);
 job=public.request_content_publication(jsonb_build_object(z.id,z.version+1),null);
 if exists(select 1 from public.content_releases c,jsonb_array_elements(c.snapshot->'offLeashAreas')x where c.id=(job->>'release_id')::uuid and x->>'slug'=z.slug)then raise exception 'ARCHIVE_IN_SNAPSHOT';end if;
 if(select archived_at from public.content_places where id=z.id)is not null then raise exception 'ARCHIVED_BEFORE_LIVE';end if;
 update public.publication_jobs set status='building',deployment_id='test_only'where id=(job->>'id')::uuid;
 perform public.complete_content_publication((job->>'id')::uuid,'test_only');
 if(public.public_zone_reviews(z.slug)->>'count')::int<>0 then raise exception 'ARCHIVED_REVIEWS_PUBLIC';end if;
 perform public.save_content_place_draft(z.id,z.version+1,(select content from public.content_place_revisions where id=z.draft_revision_id)||'{"visibility":"visible"}'::jsonb,null);
 job=public.request_content_publication(jsonb_build_object(z.id,z.version+2),null);
 update public.publication_jobs set status='building',deployment_id='test_restore'where id=(job->>'id')::uuid;
 perform public.complete_content_publication((job->>'id')::uuid,'test_restore');
 if(select archived_at from public.content_places where id=z.id)is not null then raise exception 'RESTORE_ARCHIVED';end if;
 if(select count(*)from public.reviews where id=r.id)<>1 then raise exception 'ORIGINAL_LOST';end if;
end;$tests$;
rollback;
