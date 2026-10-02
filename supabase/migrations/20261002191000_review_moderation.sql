begin;
alter table public.reviews add column zone_id uuid references public.content_places(id),add column status text not null default 'published' check(status in ('pending','published','hidden','rejected')),add column needs_review boolean not null default true,add column version integer not null default 1 check(version>0),add column public_name text,add column public_comment text;
update public.reviews r set zone_id=p.id,public_name=coalesce(nullif(trim(r.user_name),''),'Hondenliefhebber'),public_comment=r.comment from public.content_places p where p.kind='offleash' and p.slug=r.area_slug;
do $$begin if exists(select 1 from public.reviews where zone_id is null)then raise exception 'UNMATCHED_REVIEW_ZONE';end if;end$$;
alter table public.reviews alter column zone_id set not null,alter column status set default 'pending';
create index reviews_moderation_idx on public.reviews(status,created_at desc,id desc);
create index reviews_zone_idx on public.reviews(zone_id,status,created_at desc,id desc);
create table public.review_revisions(id uuid primary key default gen_random_uuid(),review_id uuid not null references public.reviews(id),public_name text not null,public_comment text,rating integer not null check(rating between 1 and 5),created_by uuid references auth.users(id)on delete set null,created_at timestamptz not null default now());
insert into public.review_revisions(review_id,public_name,public_comment,rating)select id,public_name,public_comment,rating from public.reviews;
create trigger review_revisions_immutable before update or delete on public.review_revisions for each row execute function public.guard_content_history();
create table public.review_actions(id uuid primary key default gen_random_uuid(),review_id uuid not null references public.reviews(id),actor_id uuid references auth.users(id)on delete set null,action text not null,from_status text not null,to_status text not null,reason text not null default '',note text not null default '',created_at timestamptz not null default now());
create index review_actions_history_idx on public.review_actions(review_id,created_at desc);
create table public.review_flags(id uuid primary key default gen_random_uuid(),review_id uuid not null references public.reviews(id),reason text not null check(reason in ('spam','privacy','abuse','off_topic','other')),fingerprint text not null,day date not null default(now()at time zone'Europe/Brussels')::date,resolved_at timestamptz,created_at timestamptz not null default now(),unique(review_id,day,fingerprint));
create table public.review_intake_limits(day date not null,fingerprint text not null,count integer not null,primary key(day,fingerprint));
create table public.review_daily_budget(day date primary key,count integer not null);
alter table public.review_revisions enable row level security;alter table public.review_actions enable row level security;alter table public.review_flags enable row level security;alter table public.review_intake_limits enable row level security;alter table public.review_daily_budget enable row level security;
revoke all on public.review_revisions,public.review_actions,public.review_flags,public.review_intake_limits,public.review_daily_budget from anon,authenticated;
grant all on public.review_revisions,public.review_actions,public.review_flags,public.review_intake_limits,public.review_daily_budget to service_role;
create function public.guard_review_original()returns trigger language plpgsql set search_path='' as $$begin if(new.rating,new.comment,new.user_name,new.created_at,new.area_slug,new.user_id,new.zone_id)is distinct from(old.rating,old.comment,old.user_name,old.created_at,old.area_slug,old.user_id,old.zone_id)then raise exception'REVIEW_ORIGINAL_IMMUTABLE';end if;return new;end;$$;
create trigger review_original_immutable before update on public.reviews for each row execute function public.guard_review_original();
revoke all on function public.guard_review_original()from public,anon,authenticated;
create function public.public_zone_review_summaries()returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_object_agg(slug,jsonb_build_object('count',n,'average',average)),'{}'::jsonb)from(
 select p.slug,count(r.id)::integer n,round(avg(r.rating)::numeric,1) average from public.content_places p join public.content_place_revisions rev on rev.id=p.published_revision_id left join public.reviews r on r.zone_id=p.id and r.status='published' where p.kind='offleash'and p.archived_at is null and coalesce(rev.content->>'visibility','visible')<>'archived'group by p.slug)s;
$$;
create function public.public_zone_reviews(p_slug text,p_limit integer default 20,p_before timestamptz default null,p_before_id uuid default null)returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_zone uuid;v_rows jsonb;v_count integer;v_avg numeric;
begin
 if p_limit<1 or p_limit>50 or((p_before is null)<>(p_before_id is null))then raise exception'INVALID_CURSOR';end if;
 select p.id into v_zone from public.content_places p join public.content_place_revisions rev on rev.id=p.published_revision_id where p.kind='offleash'and p.slug=p_slug and p.archived_at is null and coalesce(rev.content->>'visibility','visible')<>'archived';
 if v_zone is null then return jsonb_build_object('reviews','[]'::jsonb,'count',0,'average',null);end if;
 select count(*)::integer,round(avg(rating)::numeric,1)into v_count,v_avg from public.reviews where zone_id=v_zone and status='published';
 select coalesce(jsonb_agg(to_jsonb(q)order by q.created_at desc,q.id desc),'[]'::jsonb)into v_rows from(select id,rating,public_name as user_name,public_comment as comment,created_at from public.reviews where zone_id=v_zone and status='published'and(p_before is null or(created_at,id)<(p_before,p_before_id))order by created_at desc,id desc limit p_limit)q;
 return jsonb_build_object('reviews',v_rows,'count',v_count,'average',v_avg);
end;$$;
revoke all on function public.public_zone_review_summaries(),public.public_zone_reviews(text,integer,timestamptz,uuid)from public;
grant execute on function public.public_zone_review_summaries(),public.public_zone_reviews(text,integer,timestamptz,uuid)to anon,authenticated,service_role;
create function public.submit_zone_review(p_slug text,p_rating integer,p_name text,p_comment text,p_user_id uuid,p_fingerprint text)returns uuid language plpgsql set search_path='' as $$
declare v_zone uuid;v_id uuid;v_day date=(now()at time zone'Europe/Brussels')::date;v_count integer;
begin
 if p_rating not between 1 and 5 or char_length(trim(p_name))not between 1 and 50 or char_length(p_comment)>500 or p_fingerprint!~'^[a-f0-9]{64}$'then raise exception'INVALID_REVIEW';end if;
 select p.id into v_zone from public.content_places p join public.content_place_revisions rev on rev.id=p.published_revision_id where p.kind='offleash'and p.slug=p_slug and p.archived_at is null and coalesce(rev.content->>'visibility','visible')<>'archived';if v_zone is null then raise exception'INVALID_ZONE';end if;
 insert into public.review_daily_budget values(v_day,1)on conflict(day)do update set count=review_daily_budget.count+1 where review_daily_budget.count<200 returning count into v_count;if v_count is null then raise exception'RATE_LIMIT';end if;
 insert into public.review_intake_limits values(v_day,p_fingerprint,1)on conflict(day,fingerprint)do update set count=review_intake_limits.count+1 where review_intake_limits.count<10 returning count into v_count;if v_count is null then raise exception'RATE_LIMIT';end if;
 if exists(select 1 from public.reviews where zone_id=v_zone and rating=p_rating and lower(trim(user_name))=lower(trim(p_name))and coalesce(comment,'')=p_comment and created_at>now()-interval'24 hours')then raise exception'DUPLICATE_REVIEW';end if;
 insert into public.reviews(zone_id,area_slug,rating,user_name,comment,user_id,status,public_name,public_comment)values(v_zone,p_slug,p_rating,trim(p_name),p_comment,p_user_id,'pending',trim(p_name),p_comment)returning id into v_id;
 insert into public.review_revisions(review_id,public_name,public_comment,rating)values(v_id,trim(p_name),p_comment,p_rating);return v_id;
end;$$;
create function public.moderate_zone_review(p_id uuid,p_version integer,p_action text,p_reason text,p_note text,p_public_name text,p_public_comment text,p_actor uuid)returns jsonb language plpgsql set search_path='' as $$
declare v_review public.reviews%rowtype;v_status text;
begin
 select * into v_review from public.reviews where id=p_id for update;if not found then raise exception'REVIEW_NOT_FOUND';end if;if v_review.version<>p_version then raise exception'VERSION_CONFLICT';end if;
 if p_action not in('publish','hide','reject','restore','redact','note','resolve')or char_length(p_reason)>500 or char_length(p_note)>2000 then raise exception'INVALID_ACTION';end if;
 if p_action in('hide','reject','redact')and char_length(trim(p_reason))=0 then raise exception'REASON_REQUIRED';end if;
 v_status=case p_action when'publish'then'published'when'hide'then'hidden'when'reject'then'rejected'when'restore'then'pending'else v_review.status end;
 if p_action='redact'then
 if char_length(trim(p_public_name))not between 1 and 50 or char_length(p_public_comment)>500 then raise exception'INVALID_REVIEW';end if;
 insert into public.review_revisions(review_id,public_name,public_comment,rating,created_by)values(p_id,trim(p_public_name),p_public_comment,v_review.rating,p_actor);
 end if;
 update public.reviews set status=v_status,needs_review=case when p_action='restore'then true when p_action='note'then needs_review else false end,version=version+1,public_name=case when p_action='redact'then trim(p_public_name)else public_name end,public_comment=case when p_action='redact'then p_public_comment else public_comment end where id=p_id;
 if p_action not in('note','redact')then update public.review_flags set resolved_at=now()where review_id=p_id and resolved_at is null;end if;
 insert into public.review_actions(review_id,actor_id,action,from_status,to_status,reason,note)values(p_id,p_actor,p_action,v_review.status,v_status,p_reason,p_note);
 return jsonb_build_object('version',v_review.version+1,'status',v_status);
end;$$;
create function public.flag_zone_review(p_id uuid,p_reason text,p_fingerprint text)returns void language plpgsql set search_path='' as $$
declare v_count integer;v_day date=(now()at time zone'Europe/Brussels')::date;
begin
 if p_reason not in('spam','privacy','abuse','off_topic','other')or p_fingerprint!~'^[a-f0-9]{64}$'then raise exception'INVALID_FLAG';end if;
 if not exists(select 1 from public.reviews r join public.content_places p on p.id=r.zone_id where r.id=p_id and r.status='published'and p.archived_at is null)then raise exception'REVIEW_NOT_FOUND';end if;
 insert into public.review_daily_budget values(v_day,1)on conflict(day)do update set count=review_daily_budget.count+1 where review_daily_budget.count<200 returning count into v_count;if v_count is null then raise exception'RATE_LIMIT';end if;
 insert into public.review_intake_limits values(v_day,p_fingerprint,1)on conflict(day,fingerprint)do update set count=review_intake_limits.count+1 where review_intake_limits.count<10 returning count into v_count;if v_count is null then raise exception'RATE_LIMIT';end if;
 insert into public.review_flags(review_id,reason,fingerprint)values(p_id,p_reason,p_fingerprint)on conflict(review_id,day,fingerprint)do nothing;
end;$$;
revoke all on function public.submit_zone_review(text,integer,text,text,uuid,text),public.moderate_zone_review(uuid,integer,text,text,text,text,text,uuid),public.flag_zone_review(uuid,text,text)from public,anon,authenticated;
grant execute on function public.submit_zone_review(text,integer,text,text,uuid,text),public.moderate_zone_review(uuid,integer,text,text,text,text,text,uuid),public.flag_zone_review(uuid,text,text)to service_role;
create function public.cleanup_review_limits()returns void language sql security definer set search_path='' as $$delete from public.review_intake_limits where day<(now()at time zone'Europe/Brussels')::date;delete from public.review_daily_budget where day<(now()at time zone'Europe/Brussels')::date;$$;
revoke all on function public.cleanup_review_limits()from public,anon,authenticated;grant execute on function public.cleanup_review_limits()to service_role;
select cron.schedule('hondaanzee-review-limits-cleanup','45 0 * * *','select public.cleanup_review_limits()');
create function public.admin_review_overview()returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('counts',jsonb_build_object('all',(select count(*)from public.reviews),'pending',(select count(*)from public.reviews where status='pending'),'published',(select count(*)from public.reviews where status='published'),'hidden',(select count(*)from public.reviews where status='hidden'),'rejected',(select count(*)from public.reviews where status='rejected'),'attention',(select count(*)from public.reviews r where needs_review or exists(select 1 from public.review_flags f where f.review_id=r.id and f.resolved_at is null)),'flagged',(select count(distinct review_id)from public.review_flags where resolved_at is null)),
 'zones',coalesce((select jsonb_object_agg(zone_id::text,jsonb_build_object('published',published,'pending',pending,'attention',attention,'average',average))from(select zone_id,count(*)filter(where status='published')published,count(*)filter(where status='pending')pending,count(*)filter(where needs_review)attention,round(avg(rating)filter(where status='published')::numeric,1)average from public.reviews group by zone_id)s),'{}'::jsonb));
$$;
create function public.admin_review_list(p_filter text default'attention',p_zone uuid default null,p_rating integer default null,p_search text default'',p_before timestamptz default null,p_before_id uuid default null)returns jsonb language plpgsql stable set search_path='' as $$
declare v_rows jsonb;
begin
 if p_filter not in('all','attention','pending','published','hidden','rejected','flagged')or char_length(p_search)>200 or((p_before is null)<>(p_before_id is null))then raise exception'INVALID_FILTER';end if;
 select coalesce(jsonb_agg(to_jsonb(q)order by q.created_at desc,q.id desc),'[]'::jsonb)into v_rows from(
 select r.id,r.zone_id,r.area_slug,r.rating,r.user_name,r.comment,r.public_name,r.public_comment,r.status,r.needs_review,r.version,r.created_at,(r.user_id is not null)as with_account,p.city_slug,rev.content->>'name'as zone_name,(select count(*)from public.review_flags f where f.review_id=r.id and f.resolved_at is null)as flags
 from public.reviews r join public.content_places p on p.id=r.zone_id join public.content_place_revisions rev on rev.id=p.draft_revision_id
 where(p_zone is null or r.zone_id=p_zone)and(p_rating is null or r.rating=p_rating)and(p_search=''or concat_ws(' ',r.user_name,r.comment,rev.content->>'name')ilike'%'||p_search||'%')
 and(p_filter='all'or r.status=p_filter or(p_filter='attention'and(r.needs_review or exists(select 1 from public.review_flags f where f.review_id=r.id and f.resolved_at is null)))or(p_filter='flagged'and exists(select 1 from public.review_flags f where f.review_id=r.id and f.resolved_at is null)))
 and(p_before is null or(r.created_at,r.id)<(p_before,p_before_id))order by r.created_at desc,r.id desc limit 50)q;
 return v_rows;
end;$$;
revoke all on function public.admin_review_overview(),public.admin_review_list(text,uuid,integer,text,timestamptz,uuid)from public,anon,authenticated;
grant execute on function public.admin_review_overview(),public.admin_review_list(text,uuid,integer,text,timestamptz,uuid)to service_role;
commit;
