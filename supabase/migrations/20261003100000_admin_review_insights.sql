begin;

-- Aggregate each source separately: joining likes and reviews directly would
-- multiply both counts. Only this service-role RPC returns the private snapshot.
create function public.admin_review_insights()
returns jsonb language sql stable set search_path='' as $$
with likes as (
 select l.place_id,
 count(*) filter(where m.status='active') like_count,
 count(*) filter(where m.status<>'active') excluded_like_count,
 count(*) filter(where m.status='active' and l.created_at>=now()-interval '7 days') recent7_like_count,
 count(*) filter(where m.status='active' and l.created_at>=now()-interval '30 days') recent30_like_count,
 max(l.created_at) filter(where m.status='active') last_like_at
 from public.place_likes l join public.member_profiles m on m.id=l.member_id group by l.place_id
), author_dates as (
 select review_id,max(created_at) last_review_at from public.hotspot_review_versions where source='author' group by review_id
), review_rows as (
 select r.place_id,r.needs_review,
 r.needs_review or exists(select 1 from public.hotspot_review_flags f where f.review_id=r.id and f.resolved_at is null) attention,
 r.status='published' and m.status='active' and v.id is not null approved,
 v.rating,d.last_review_at
 from public.hotspot_reviews r join public.member_profiles m on m.id=r.member_id
 left join public.hotspot_review_versions v on v.id=r.published_revision_id
 left join author_dates d on d.review_id=r.id
 union all
 select r.zone_id,r.status='pending',
 r.needs_review or exists(select 1 from public.review_flags f where f.review_id=r.id and f.resolved_at is null),
 r.status='published',r.rating,r.created_at
 from public.reviews r
), reviews as (
 select place_id,count(*) review_count,count(*) filter(where approved) published_count,
 count(*) filter(where needs_review) pending_count,count(*) filter(where attention) attention_count,
 round(avg(rating) filter(where approved)::numeric,1) average,max(last_review_at) last_review_at
 from review_rows group by place_id
), places as (
 select p.id place_id,p.kind,p.city_slug,p.slug place_slug,
 coalesce(c.content->>'name',p.slug) name,coalesce(c.content->>'image','') image,
 case when p.archived_at is not null or c.content->>'visibility'='archived' then 'archived'
 when p.published_revision_id is null then 'draft' else 'published' end status,
 coalesce(l.like_count,0) like_count,coalesce(l.excluded_like_count,0) excluded_like_count,
 coalesce(l.recent7_like_count,0) recent7_like_count,coalesce(l.recent30_like_count,0) recent30_like_count,l.last_like_at,
 coalesce(r.review_count,0) review_count,coalesce(r.published_count,0) published_count,
 coalesce(r.pending_count,0) pending_count,coalesce(r.attention_count,0) attention_count,
 r.average,r.last_review_at,greatest(l.last_like_at,r.last_review_at) last_activity_at
 from public.content_places p
 left join public.content_place_revisions c on c.id=coalesce(p.published_revision_id,p.draft_revision_id)
 left join likes l on l.place_id=p.id left join reviews r on r.place_id=p.id
 where p.kind in('hotspot','offleash')
)
select jsonb_build_object('generated_at',now(),'summary',jsonb_build_object(
 'like_count',coalesce(sum(like_count),0),'excluded_like_count',coalesce(sum(excluded_like_count),0),
 'recent7_like_count',coalesce(sum(recent7_like_count),0),'recent30_like_count',coalesce(sum(recent30_like_count),0),
 'review_count',coalesce(sum(review_count),0),'published_count',coalesce(sum(published_count),0),
 'attention_count',coalesce(sum(attention_count),0)),
 'places',coalesce(jsonb_agg(to_jsonb(places) order by like_count desc,review_count desc,name,place_id),'[]'::jsonb))
from places;
$$;
revoke all on function public.admin_review_insights() from public,anon,authenticated;
grant execute on function public.admin_review_insights() to service_role;
commit;
