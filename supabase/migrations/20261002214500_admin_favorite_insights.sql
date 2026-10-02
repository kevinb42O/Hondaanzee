begin;
-- Aggregate on the server. No member identities or individual lists are returned.
create index member_favorites_place_insights_idx on public.member_favorites(kind,city_slug,place_slug,created_at);
create function public.admin_favorite_insights()
returns jsonb language sql stable set search_path='' as $$
with favorites as (
 select kind,city_slug,place_slug,count(*) saved_count,
 count(*) filter(where created_at>=now()-interval '7 days') recent7_count,
 count(*) filter(where created_at>=now()-interval '30 days') recent30_count,
 max(created_at) last_saved_at
 from public.member_favorites group by kind,city_slug,place_slug
), catalog as (
 select p.id place_id,p.kind,p.city_slug,p.slug place_slug,
 coalesce(r.content->>'name',p.slug) name,coalesce(r.content->>'type','') type,
 coalesce(r.content->>'image','') image,
 case when p.archived_at is not null or r.content->>'visibility'='archived' then 'archived'
 when p.published_revision_id is null then 'draft' else 'published' end status,
 coalesce(r.content->>'operationalStatus'='temporarily_closed',false) temporarily_closed
 from public.content_places p
 left join public.content_place_revisions r on r.id=coalesce(p.published_revision_id,p.draft_revision_id)
), places as (
 select c.*,coalesce(f.saved_count,0) saved_count,coalesce(f.recent7_count,0) recent7_count,
 coalesce(f.recent30_count,0) recent30_count,f.last_saved_at
 from catalog c left join favorites f using(kind,city_slug,place_slug)
 union all
 select null::uuid,f.kind,f.city_slug,f.place_slug,f.place_slug,'','', 'unlinked',false,
 f.saved_count,f.recent7_count,f.recent30_count,f.last_saved_at
 from favorites f where not exists(select 1 from catalog c where(c.kind,c.city_slug,c.place_slug)=(f.kind,f.city_slug,f.place_slug))
), cities as (
 select city_slug,count(*) saved_count,count(distinct member_id) member_count
 from public.member_favorites group by city_slug
)
select jsonb_build_object(
 'generated_at',now(),
 'summary',jsonb_build_object(
  'saved_count',(select count(*) from public.member_favorites),
  'member_count',(select count(distinct member_id) from public.member_favorites),
  'account_count',(select count(*) from public.member_profiles),
  'place_count',(select count(*) from favorites),
  'recent7_count',(select coalesce(sum(recent7_count),0) from favorites),
  'recent30_count',(select coalesce(sum(recent30_count),0) from favorites),
  'unavailable_count',(select coalesce(sum(saved_count),0) from places where status<>'published')
 ),
 'places',coalesce((select jsonb_agg(to_jsonb(p) order by saved_count desc,kind,city_slug,place_slug) from places p),'[]'::jsonb),
 'cities',coalesce((select jsonb_agg(to_jsonb(c) order by saved_count desc,city_slug) from cities c),'[]'::jsonb)
);
$$;
revoke all on function public.admin_favorite_insights() from public,anon,authenticated;
grant execute on function public.admin_favorite_insights() to service_role;
commit;
