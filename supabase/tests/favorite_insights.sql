-- Run as a database administrator after the favorites migrations.
-- Fixtures, archive changes and simulated member actions are always rolled back.
begin isolation level repeatable read;

do $$
declare u1 uuid=gen_random_uuid();u2 uuid=gen_random_uuid();p record;s record;z record;j jsonb;b jsonb;row1 jsonb;slug text='rollback-'||replace(gen_random_uuid()::text,'-','');n bigint;n7 bigint;n30 bigint;
begin
 select * into p from public.content_places where kind='hotspot'and published_revision_id is not null limit 1;
 select * into s from public.content_places where kind='service'and published_revision_id is not null limit 1;
 select * into z from public.content_places where kind='offleash'and published_revision_id is not null limit 1;
 b=public.admin_favorite_insights();
 select value into row1 from jsonb_array_elements(b->'places') where value->>'place_id'=p.id::text;
 n=(row1->>'saved_count')::bigint;n7=(row1->>'recent7_count')::bigint;n30=(row1->>'recent30_count')::bigint;
 insert into auth.users(id,aud,role,email,created_at,updated_at)values(u1,'authenticated','authenticated',u1||'@invalid.example',now(),now()),(u2,'authenticated','authenticated',u2||'@invalid.example',now(),now());
 insert into public.member_favorites(member_id,kind,city_slug,place_slug,created_at)values
 (u1,p.kind,p.city_slug,p.slug,now()-interval'40 days'),(u2,p.kind,p.city_slug,p.slug,now()-interval'1 day'),
 (u1,s.kind,s.city_slug,s.slug,now()-interval'8 days'),(u1,z.kind,z.city_slug,z.slug,now()),(u2,'hotspot','oostende',slug,now());
 update public.member_favorites set created_at=now()-interval'40 days' where member_id=u1 and kind=p.kind and city_slug=p.city_slug and place_slug=p.slug;
 update public.member_favorites set created_at=now()-interval'1 day' where member_id=u2 and kind=p.kind and city_slug=p.city_slug and place_slug=p.slug;
 update public.member_favorites set created_at=now()-interval'8 days' where member_id=u1 and kind=s.kind and city_slug=s.city_slug and place_slug=s.slug;
 begin insert into public.member_favorites(member_id,kind,city_slug,place_slug)values(u1,p.kind,p.city_slug,p.slug);raise exception'DUPLICATE_ALLOWED';exception when unique_violation then null;end;
 j=public.admin_favorite_insights();
 if(j->'summary'->>'saved_count')::bigint<>(b->'summary'->>'saved_count')::bigint+5 then raise exception'TOTAL_MISMATCH';end if;
 if(j->'summary'->>'member_count')::bigint<>(b->'summary'->>'member_count')::bigint+2 then raise exception'UNIQUE_MEMBERS_MISMATCH';end if;
 if(select sum((value->>'saved_count')::bigint)from jsonb_array_elements(j->'places'))<>(j->'summary'->>'saved_count')::bigint then raise exception'RECONCILIATION_FAILED';end if;
 select value into row1 from jsonb_array_elements(j->'places')where value->>'place_id'=p.id::text;
 if(row1->>'saved_count')::bigint<>n+2 or(row1->>'recent7_count')::bigint<>n7+1 or(row1->>'recent30_count')::bigint<>n30+1 then raise exception'COHORT_FAILED';end if;
 if not exists(select 1 from jsonb_array_elements(j->'places')where value->>'place_slug'=slug and value->>'status'='unlinked'and(value->>'saved_count')::bigint=1)then raise exception'ORPHAN_DROPPED';end if;
 if position(u1::text in j::text)>0 or position(u2::text in j::text)>0 then raise exception'MEMBER_ID_LEAK';end if;
 update public.content_places set archived_at=now()where id=z.id;
 j=public.admin_favorite_insights();if not exists(select 1 from jsonb_array_elements(j->'places')where value->>'place_id'=z.id::text and value->>'status'='archived')then raise exception'ARCHIVE_FAILED';end if;
 delete from public.member_favorites where member_id=u1 and kind=p.kind and city_slug=p.city_slug and place_slug=p.slug;
 delete from auth.users where id=u2;
 j=public.admin_favorite_insights();if(j->'summary'->>'saved_count')::bigint<>(b->'summary'->>'saved_count')::bigint+2 then raise exception'UNSAVE_ACCOUNT_DELETE_FAILED';end if;
 if has_function_privilege('anon','public.admin_favorite_insights()','EXECUTE')or has_function_privilege('authenticated','public.admin_favorite_insights()','EXECUTE')then raise exception'RPC_ACCESS_LEAK';end if;
end $$;
do $$declare u uuid=gen_random_uuid();begin
 insert into auth.users(id,aud,role,email,created_at,updated_at)values(u,'authenticated','authenticated',u||'@invalid.example',now(),now());
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 insert into public.member_favorites(member_id,kind,city_slug,place_slug,created_at)values(u,'hotspot','oostende','rollback-real-member-permission',now()-interval'100 days');
 if not exists(select 1 from public.member_favorites where member_id=u and created_at=now())then raise exception'REAL_MEMBER_SAVE_FAILED';end if;
 delete from public.member_favorites where member_id=u and place_slug='rollback-real-member-permission';
 if exists(select 1 from public.member_favorites where member_id=u)then raise exception'REAL_MEMBER_UNSAVE_FAILED';end if;
 execute 'reset role';
end$$;
rollback;
