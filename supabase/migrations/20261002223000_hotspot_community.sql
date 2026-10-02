begin;

-- Hotspot contributions use stable catalog identities. Legacy zone reviews and
-- their immutable history remain intact; the admin API unifies both sources.
create table public.place_likes (
 place_id uuid not null references public.content_places(id),
 member_id uuid not null references public.member_profiles(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(member_id,place_id)
);
create index place_likes_place_idx on public.place_likes(place_id);
create table public.hotspot_reviews (
 id uuid primary key default gen_random_uuid(),
 place_id uuid not null references public.content_places(id),
 member_id uuid not null references public.member_profiles(id) on delete cascade,
 status text not null default 'pending' check(status in('pending','published','hidden','rejected','withdrawn')),
 needs_review boolean not null default true,
 version integer not null default 1,
 submitted_revision_id uuid, published_revision_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(member_id,place_id)
);
create table public.hotspot_review_versions (
 id uuid primary key default gen_random_uuid(),
 review_id uuid not null references public.hotspot_reviews(id) on delete cascade,
 rating integer not null check(rating between 1 and 5),
 public_name text not null check(char_length(trim(public_name)) between 1 and 50),
 comment text not null check(char_length(trim(comment)) between 20 and 1000),
 visit_month date check(visit_month is null or extract(day from visit_month)=1),
 source text not null check(source in('author','moderator')),
 created_at timestamptz not null default clock_timestamp()
);
alter table public.hotspot_reviews add constraint hotspot_review_submitted_fk foreign key(submitted_revision_id) references public.hotspot_review_versions(id) deferrable initially deferred;
alter table public.hotspot_reviews add constraint hotspot_review_published_fk foreign key(published_revision_id) references public.hotspot_review_versions(id) deferrable initially deferred;
create index hotspot_reviews_place_idx on public.hotspot_reviews(place_id,status);
create index hotspot_reviews_queue_idx on public.hotspot_reviews(created_at desc,id desc);
create table public.hotspot_review_actions (
 id uuid primary key default gen_random_uuid(), review_id uuid not null references public.hotspot_reviews(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 action text not null, from_status text not null,to_status text not null,reason text not null default '',note text not null default '',created_at timestamptz not null default now()
);
create table public.hotspot_review_flags (
 id uuid primary key default gen_random_uuid(),review_id uuid not null references public.hotspot_reviews(id) on delete cascade,
 reason text not null check(reason in('spam','privacy','abuse','off_topic','other')),
 fingerprint text not null,day date not null default(now()at time zone'Europe/Brussels')::date,
 resolved_at timestamptz,created_at timestamptz not null default now(),unique(review_id,day,fingerprint)
);
create index hotspot_review_flags_open_idx on public.hotspot_review_flags(review_id) where resolved_at is null;
create table public.community_limits (
 day date not null,bucket text not null,key text not null,count integer not null,primary key(day,bucket,key)
);
do $$declare t text;begin
 foreach t in array array['place_likes','hotspot_reviews','hotspot_review_versions','hotspot_review_actions','hotspot_review_flags','community_limits']loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end$$;
-- Updates to version content are forbidden. Deletion cascades intentionally
-- erase ALL new review content/history when the member deletes their account.
create function public.guard_hotspot_review_version() returns trigger language plpgsql set search_path='' as $$begin raise exception 'REVIEW_VERSION_IMMUTABLE';end$$;
create trigger hotspot_review_version_immutable before update on public.hotspot_review_versions for each row execute function public.guard_hotspot_review_version();

create function public.community_require_member(p_member uuid) returns void language plpgsql set search_path='' as $$begin
 if p_member is null or not exists(select 1 from public.member_profiles where id=p_member and status='active')then raise exception 'ACTIVE_MEMBER_REQUIRED';end if;
end$$;
create function public.community_limit(p_bucket text,p_key text,p_max integer) returns void language plpgsql set search_path='' as $$declare n integer;begin
 insert into public.community_limits(day,bucket,key,count)values((now()at time zone'Europe/Brussels')::date,p_bucket,p_key,1)
 on conflict(day,bucket,key)do update set count=community_limits.count+1 where community_limits.count<p_max returning count into n;
 if n is null then raise exception 'RATE_LIMIT';end if;
end$$;
create function public.community_place(p_city text,p_slug text) returns uuid language sql stable set search_path='' as $$
 select p.id from public.content_places p join public.content_place_revisions v on v.id=p.published_revision_id
 where p.kind='hotspot'and p.city_slug=p_city and p.slug=p_slug and p.archived_at is null;
$$;
create function public.public_hotspot_summaries(p_places jsonb) returns jsonb language plpgsql stable security definer set search_path='' as $$declare result jsonb;begin
 if jsonb_typeof(p_places)<>'array'or jsonb_array_length(p_places)>200 then raise exception 'INVALID_PLACES';end if;
 select coalesce(jsonb_object_agg(p.city_slug||'/'||p.slug,jsonb_build_object('place_id',p.id,'likes',
 (select count(*)from public.place_likes l join public.member_profiles m on m.id=l.member_id and m.status='active'where l.place_id=p.id),
 'count',s.n,'average',s.average)),'{}'::jsonb)into result
 from public.content_places p join public.content_place_revisions v on v.id=p.published_revision_id
 cross join lateral(select count(*)::integer n,round(avg(rv.rating)::numeric,1)average from public.hotspot_reviews r
 join public.member_profiles m on m.id=r.member_id and m.status='active'
 join public.hotspot_review_versions rv on rv.id=r.published_revision_id
 where r.place_id=p.id and r.status='published')s
 where p.kind='hotspot'and p.archived_at is null and exists(select 1 from jsonb_array_elements(p_places)e where e->>'city'=p.city_slug and e->>'slug'=p.slug);
 return result;
end$$;
create function public.public_hotspot_reviews(p_city text,p_slug text,p_before timestamptz default null,p_before_id uuid default null)returns jsonb language plpgsql stable security definer set search_path='' as $$
declare place uuid;rows jsonb;summary jsonb;begin
 if(p_before is null)<>(p_before_id is null)then raise exception 'INVALID_CURSOR';end if;
 place=public.community_place(p_city,p_slug);
 if place is null then return jsonb_build_object('available',false,'reviews','[]'::jsonb);end if;
 summary=public.public_hotspot_summaries(jsonb_build_array(jsonb_build_object('city',p_city,'slug',p_slug)))->(p_city||'/'||p_slug);
 select coalesce(jsonb_agg(to_jsonb(q)order by q.created_at desc,q.id desc),'[]'::jsonb)into rows from(
 select r.id,v.rating,v.public_name as user_name,v.comment,v.visit_month,r.created_at,v.created_at as updated_at,
 exists(select 1 from public.hotspot_review_versions old where old.review_id=r.id and old.source='author'and old.created_at<v.created_at)as edited
 from public.hotspot_reviews r join public.member_profiles m on m.id=r.member_id and m.status='active'
 join public.hotspot_review_versions v on v.id=r.published_revision_id
 where r.place_id=place and r.status='published'and(p_before is null or(r.created_at,r.id)<(p_before,p_before_id))order by r.created_at desc,r.id desc limit 21)q;
 return summary||jsonb_build_object('available',true,'reviews',rows,'distribution',(
 select coalesce(jsonb_object_agg(rating,n),'{}'::jsonb)from(select v.rating,count(*)n from public.hotspot_reviews r join public.member_profiles m on m.id=r.member_id and m.status='active'join public.hotspot_review_versions v on v.id=r.published_revision_id where r.place_id=place and r.status='published'group by v.rating)d));
end$$;
create function public.member_hotspot_state(p_member uuid,p_city text,p_slug text)returns jsonb language plpgsql stable set search_path='' as $$declare place uuid;own jsonb;begin
 perform public.community_require_member(p_member);place=public.community_place(p_city,p_slug);if place is null then raise exception 'PLACE_UNAVAILABLE';end if;
 select jsonb_build_object('id',r.id,'version',r.version,'status',r.status,'needs_review',r.needs_review,'has_published',r.published_revision_id is not null,'rating',v.rating,'comment',v.comment,'name',v.public_name,'visit_month',v.visit_month)into own
 from public.hotspot_reviews r join public.hotspot_review_versions v on v.id=r.submitted_revision_id where r.member_id=p_member and r.place_id=place;
 return jsonb_build_object('liked',exists(select 1 from public.place_likes where place_id=place and member_id=p_member),'review',own);
end$$;
create function public.set_hotspot_like(p_member uuid,p_city text,p_slug text,p_liked boolean)returns jsonb language plpgsql set search_path='' as $$declare place uuid;begin
 perform public.community_require_member(p_member);if p_liked is null then raise exception 'INVALID_LIKE';end if;
 place=public.community_place(p_city,p_slug);if place is null then raise exception 'PLACE_UNAVAILABLE';end if;
 perform public.community_limit('like',p_member::text,300);
 perform pg_advisory_xact_lock(hashtextextended(p_member::text||place::text,0));
 if p_liked then insert into public.place_likes(member_id,place_id)values(p_member,place)on conflict do nothing;
 else delete from public.place_likes where member_id=p_member and place_id=place;end if;
 return public.member_hotspot_state(p_member,p_city,p_slug)||jsonb_build_object('summary',public.public_hotspot_summaries(jsonb_build_array(jsonb_build_object('city',p_city,'slug',p_slug)))->(p_city||'/'||p_slug));
end$$;
create function public.submit_hotspot_review(p_member uuid,p_city text,p_slug text,p_rating integer,p_comment text,p_name text,p_visit_month date,p_version integer,p_fingerprint text)returns jsonb language plpgsql set search_path='' as $$
declare place uuid;r public.hotspot_reviews%rowtype;revision uuid;begin
 perform public.community_require_member(p_member);
 if p_rating is null or p_rating not between 1 and 5 or p_comment is null or char_length(trim(p_comment))not between 20 and 1000 or p_name is null or char_length(trim(p_name))not between 1 and 50
 or(p_visit_month is not null and(extract(day from p_visit_month)<>1 or p_visit_month>date_trunc('month',now()at time zone'Europe/Brussels')::date or p_visit_month<'2000-01-01'))or p_fingerprint is null or p_fingerprint!~'^[a-f0-9]{64}$'then raise exception 'INVALID_REVIEW';end if;
 place=public.community_place(p_city,p_slug);if place is null then raise exception 'PLACE_UNAVAILABLE';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_member::text||place::text,0));
 select * into r from public.hotspot_reviews where member_id=p_member and place_id=place for update;
 if(r.id is not null and p_version is distinct from r.version)or(r.id is null and p_version is not null)then raise exception 'VERSION_CONFLICT';end if;
 if r.status='hidden'then raise exception 'REVIEW_HIDDEN';end if;
 perform public.community_limit('review-member',p_member::text,10);perform public.community_limit('review-ip',p_fingerprint,30);perform public.community_limit('review-total','all',1000);
 if r.id is null then insert into public.hotspot_reviews(member_id,place_id)values(p_member,place)returning * into r;
 else update public.hotspot_reviews set status=case when status='published'then'published'else'pending'end,needs_review=true,version=version+1,updated_at=now()where id=r.id;end if;
 insert into public.hotspot_review_versions(review_id,rating,comment,public_name,visit_month,source)values(r.id,p_rating,trim(p_comment),trim(p_name),p_visit_month,'author')returning id into revision;
 update public.hotspot_reviews set submitted_revision_id=revision where id=r.id;
 return public.member_hotspot_state(p_member,p_city,p_slug);
end$$;
create function public.withdraw_hotspot_review(p_member uuid,p_city text,p_slug text,p_version integer)returns jsonb language plpgsql set search_path='' as $$declare place uuid;r public.hotspot_reviews%rowtype;begin
 perform public.community_require_member(p_member);place=public.community_place(p_city,p_slug);
 select * into r from public.hotspot_reviews where member_id=p_member and place_id=place for update;
 if r.id is null then raise exception 'REVIEW_NOT_FOUND';end if;if p_version is distinct from r.version then raise exception 'VERSION_CONFLICT';end if;
 update public.hotspot_reviews set status='withdrawn',needs_review=false,published_revision_id=null,version=version+1,updated_at=now()where id=r.id;
 update public.hotspot_review_flags set resolved_at=now()where review_id=r.id and resolved_at is null;
 insert into public.hotspot_review_actions(review_id,action,from_status,to_status)values(r.id,'withdraw',r.status,'withdrawn');
 return public.member_hotspot_state(p_member,p_city,p_slug);
end$$;
create function public.flag_hotspot_review(p_id uuid,p_reason text,p_fingerprint text)returns void language plpgsql set search_path='' as $$begin
 if p_reason not in('spam','privacy','abuse','off_topic','other')or p_fingerprint!~'^[a-f0-9]{64}$'then raise exception 'INVALID_FLAG';end if;
 if not exists(select 1 from public.hotspot_reviews r join public.content_places p on p.id=r.place_id and p.archived_at is null and p.published_revision_id is not null join public.member_profiles m on m.id=r.member_id and m.status='active'where r.id=p_id and r.status='published')then raise exception 'REVIEW_NOT_FOUND';end if;
 perform public.community_limit('flag',p_fingerprint,20);
 insert into public.hotspot_review_flags(review_id,reason,fingerprint)values(p_id,p_reason,p_fingerprint)on conflict do nothing;
end$$;
create function public.moderate_hotspot_review(p_id uuid,p_version integer,p_action text,p_reason text,p_note text,p_public_name text,p_public_comment text,p_actor uuid)returns jsonb language plpgsql set search_path='' as $$
declare r public.hotspot_reviews%rowtype;v public.hotspot_review_versions%rowtype;revision uuid;newstatus text;begin
 select * into r from public.hotspot_reviews where id=p_id for update;if not found then raise exception 'REVIEW_NOT_FOUND';end if;
 if p_version is distinct from r.version then raise exception 'VERSION_CONFLICT';end if;
 if p_action not in('publish','hide','reject','restore','redact','note','resolve')or char_length(p_reason)>500 or char_length(p_note)>2000 then raise exception 'INVALID_ACTION';end if;
 if p_action in('hide','reject','redact')and coalesce(char_length(trim(p_reason)),0)=0 then raise exception 'REASON_REQUIRED';end if;
 if r.status='withdrawn'then raise exception 'REVIEW_WITHDRAWN';end if;
 newstatus=r.status;
 if p_action='publish'then
 perform public.community_require_member(r.member_id);newstatus='published';revision=r.submitted_revision_id;
 elsif p_action='hide'then newstatus='hidden';
 elsif p_action='reject'then newstatus=case when r.status='published'and r.published_revision_id is not null then'published'else'rejected'end;
 elsif p_action='restore'then newstatus='pending';
 elsif p_action='redact'then
 if r.status<>'published'or r.published_revision_id is null then raise exception 'REVIEW_NOT_PUBLISHED';end if;
 select * into v from public.hotspot_review_versions where id=r.published_revision_id;
 if p_public_name is null or char_length(trim(p_public_name))not between 1 and 50 or p_public_comment is null or char_length(trim(p_public_comment))not between 20 and 1000 then raise exception 'INVALID_REVIEW';end if;
 insert into public.hotspot_review_versions(review_id,rating,comment,public_name,visit_month,source)values(r.id,v.rating,trim(p_public_comment),trim(p_public_name),v.visit_month,'moderator')returning id into revision;
 end if;
 update public.hotspot_reviews set status=newstatus,version=version+1,updated_at=now(),
 published_revision_id=case when p_action in('publish','redact')then revision else published_revision_id end,
 -- An approved moderator redaction also becomes the author-visible base only
 -- when no new author revision is awaiting approval.
 submitted_revision_id=case when p_action='redact'and not needs_review then revision else submitted_revision_id end,
 needs_review=case when p_action='restore'then true when p_action in('note','resolve','redact')then needs_review else false end where id=r.id;
 if p_action not in('note','redact')then update public.hotspot_review_flags set resolved_at=now()where review_id=r.id and resolved_at is null;end if;
 insert into public.hotspot_review_actions(review_id,actor_id,action,from_status,to_status,reason,note)values(r.id,p_actor,p_action,r.status,newstatus,p_reason,p_note);
 return jsonb_build_object('version',r.version+1,'status',newstatus);
end$$;
create function public.admin_hotspot_review_list(p_filter text default 'attention',p_place uuid default null,p_rating integer default null,p_search text default '',p_before timestamptz default null,p_before_id uuid default null)returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(q)order by q.created_at desc,q.id desc),'[]'::jsonb)from(
 select r.id,r.place_id as zone_id,r.place_id,'hotspot'::text as kind,p.slug as area_slug,v.rating,v.public_name as user_name,v.comment,v.public_name,v.comment as public_comment,r.status,r.needs_review,r.version,r.created_at,true as with_account,p.city_slug,c.content->>'name'as zone_name,
 (select count(*)from public.hotspot_review_flags f where f.review_id=r.id and f.resolved_at is null)as flags
 from public.hotspot_reviews r join public.hotspot_review_versions v on v.id=r.submitted_revision_id join public.content_places p on p.id=r.place_id join public.content_place_revisions c on c.id=p.draft_revision_id
 where(p_place is null or r.place_id=p_place)and(p_rating is null or v.rating=p_rating)
 and(p_search=''or concat_ws(' ',v.public_name,v.comment,c.content->>'name')ilike'%'||p_search||'%')
 and(p_filter='all'or r.status=p_filter or(p_filter='pending'and r.needs_review)or(p_filter='attention'and(r.needs_review or exists(select 1 from public.hotspot_review_flags f where f.review_id=r.id and f.resolved_at is null)))or(p_filter='flagged'and exists(select 1 from public.hotspot_review_flags f where f.review_id=r.id and f.resolved_at is null)))
 and(p_before is null or(r.created_at,r.id)<(p_before,p_before_id))order by r.created_at desc,r.id desc limit 50)q;
$$;
create function public.admin_hotspot_review_overview()returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('counts',jsonb_build_object('all',(select count(*)from public.hotspot_reviews),'pending',(select count(*)from public.hotspot_reviews where needs_review),'published',(select count(*)from public.hotspot_reviews where status='published'),'hidden',(select count(*)from public.hotspot_reviews where status='hidden'),'rejected',(select count(*)from public.hotspot_reviews where status='rejected'),'withdrawn',(select count(*)from public.hotspot_reviews where status='withdrawn'),'attention',(select count(*)from public.hotspot_reviews r where needs_review or exists(select 1 from public.hotspot_review_flags f where f.review_id=r.id and f.resolved_at is null)),'flagged',(select count(distinct review_id)from public.hotspot_review_flags where resolved_at is null)),
 'places',coalesce((select jsonb_object_agg(place_id::text,jsonb_build_object('published',published,'pending',pending,'attention',attention,'average',average,'likes',likes))from(
 select p.id place_id,(select count(*)from public.place_likes l join public.member_profiles m on m.id=l.member_id and m.status='active'where l.place_id=p.id)likes,
 count(r.id)filter(where r.status='published'and m.status='active')published,count(r.id)filter(where r.needs_review)pending,count(r.id)filter(where r.needs_review or exists(select 1 from public.hotspot_review_flags f where f.review_id=r.id and f.resolved_at is null))attention,
 round(avg(v.rating)filter(where r.status='published'and m.status='active')::numeric,1)average
 from public.content_places p left join public.hotspot_reviews r on r.place_id=p.id left join public.member_profiles m on m.id=r.member_id left join public.hotspot_review_versions v on v.id=r.published_revision_id where p.kind='hotspot'group by p.id)s),'{}'::jsonb));
$$;
create function public.admin_community_review_list(p_filter text,p_kind text,p_city text,p_place uuid,p_rating integer,p_search text,p_before timestamptz,p_before_id uuid)returns jsonb language sql stable set search_path='' as $$
 with candidates as (
 select r.id,r.place_id as zone_id,r.place_id,'hotspot'::text as kind,p.slug as area_slug,v.rating,v.public_name as user_name,v.comment,v.public_name,v.comment as public_comment,r.status,r.needs_review,r.version,r.created_at,true as with_account,p.city_slug,c.content->>'name'as zone_name,
 (select count(*)from public.hotspot_review_flags f where f.review_id=r.id and f.resolved_at is null)as flags
 from public.hotspot_reviews r join public.hotspot_review_versions v on v.id=r.submitted_revision_id join public.content_places p on p.id=r.place_id join public.content_place_revisions c on c.id=p.draft_revision_id
 union all
 select r.id,r.zone_id,r.zone_id,'offleash'::text,r.area_slug,r.rating,r.user_name,r.comment,r.public_name,r.public_comment,r.status,r.needs_review,r.version,r.created_at,r.user_id is not null,p.city_slug,c.content->>'name',
 (select count(*)from public.review_flags f where f.review_id=r.id and f.resolved_at is null)
 from public.reviews r join public.content_places p on p.id=r.zone_id join public.content_place_revisions c on c.id=p.draft_revision_id
 )select coalesce(jsonb_agg(to_jsonb(q)order by q.created_at desc,q.id desc),'[]'::jsonb)from(
 select * from candidates r where(p_kind='all'or r.kind=p_kind)and(p_city=''or r.city_slug=p_city)and(p_place is null or r.place_id=p_place)and(p_rating is null or r.rating=p_rating)
 and(p_search=''or concat_ws(' ',r.public_name,r.public_comment,r.zone_name)ilike'%'||p_search||'%')
 and(p_filter='all'or r.status=p_filter or(p_filter='pending'and r.needs_review)or(p_filter='attention'and(r.needs_review or r.flags>0))or(p_filter='flagged'and r.flags>0))
 and(p_before is null or(r.created_at,r.id)<(p_before,p_before_id))order by r.created_at desc,r.id desc limit 50)q;
$$;
create function public.cleanup_community_limits()returns void language sql security definer set search_path='' as $$delete from public.community_limits where day<(now()at time zone'Europe/Brussels')::date;$$;
create function public.member_hotspot_export(p_member uuid)returns jsonb language plpgsql stable set search_path='' as $$begin
 perform public.community_require_member(p_member);
 return jsonb_build_object('likes',coalesce((select jsonb_agg(jsonb_build_object('city',p.city_slug,'slug',p.slug,'created_at',l.created_at)order by l.created_at)from public.place_likes l join public.content_places p on p.id=l.place_id where l.member_id=p_member),'[]'::jsonb),
 'reviews',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'city',p.city_slug,'slug',p.slug,'status',r.status,'needs_review',r.needs_review,'created_at',r.created_at,'versions',(
 select jsonb_agg(jsonb_build_object('name',v.public_name,'rating',v.rating,'comment',v.comment,'visit_month',v.visit_month,'created_at',v.created_at,'source',v.source)order by v.created_at)from public.hotspot_review_versions v where v.review_id=r.id))order by r.created_at)from public.hotspot_reviews r join public.content_places p on p.id=r.place_id where r.member_id=p_member),'[]'::jsonb));
end$$;
select cron.schedule('hondaanzee-community-limits-cleanup','50 0 * * *','select public.cleanup_community_limits()');

-- Functions are private by default; only the two public projections are exposed.
do $$declare f record;begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'and p.proname in('guard_hotspot_review_version','community_require_member','community_limit','community_place','public_hotspot_summaries','public_hotspot_reviews','member_hotspot_state','set_hotspot_like','submit_hotspot_review','withdraw_hotspot_review','flag_hotspot_review','moderate_hotspot_review','admin_hotspot_review_list','admin_hotspot_review_overview','admin_community_review_list','cleanup_community_limits','member_hotspot_export')loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end$$;
grant execute on function public.public_hotspot_summaries(jsonb),public.public_hotspot_reviews(text,text,timestamptz,uuid)to anon,authenticated;

-- Keep the legacy implementation and history, but require membership for all
-- future zone submissions and serialize duplicate checks per member/zone.
alter function public.submit_zone_review(text,integer,text,text,uuid,text)rename to legacy_submit_zone_review;
create function public.submit_zone_review(p_slug text,p_rating integer,p_name text,p_comment text,p_user_id uuid,p_fingerprint text)returns uuid language plpgsql set search_path='' as $$begin
 perform public.community_require_member(p_user_id);
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text||p_slug,0));
 if exists(select 1 from public.reviews where user_id=p_user_id and area_slug=p_slug)then raise exception 'DUPLICATE_REVIEW';end if;
 perform public.community_limit('zone-review-member',p_user_id::text,10);
 return public.legacy_submit_zone_review(p_slug,p_rating,p_name,p_comment,p_user_id,p_fingerprint);
end$$;
revoke all on function public.submit_zone_review(text,integer,text,text,uuid,text)from public,anon,authenticated;
grant execute on function public.submit_zone_review(text,integer,text,text,uuid,text)to service_role;

commit;
