-- Password accounts become active immediately; email ownership is not asserted.
begin;

create or replace function public.is_active_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.member_profiles where id=(select auth.uid()) and status='active');
$$;
revoke all on function public.is_active_member() from public,anon;
grant execute on function public.is_active_member() to authenticated;


create or replace function public.read_shared_trip(p_token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('title',t.title,'trip_date',t.trip_date,'places',coalesce((
    select jsonb_agg(jsonb_build_object('kind',p.kind,'city_slug',p.city_slug,'place_slug',p.place_slug) order by p.created_at,p.id)
    from public.member_trip_places p where p.trip_id=t.id),'[]'::jsonb))
  from public.member_trips t join public.member_profiles m on m.id=t.member_id
  where t.share_token=p_token and m.status='active';
$$;
revoke all on function public.read_shared_trip(uuid) from public;
grant execute on function public.read_shared_trip(uuid) to anon,authenticated;


create or replace function public.admin_list_members(p_search text default '',p_status text default '',p_page integer default 1) returns jsonb
language sql stable security definer set search_path = '' as $$
  with filtered as (
    select m.*,(select count(*) from public.member_favorites f where f.member_id=m.id) as favorites_count,
      (select count(*) from public.member_trips t where t.member_id=m.id) as trips_count
    from public.member_profiles m
    where (p_search='' or strpos(lower(m.email),lower(p_search))>0 or strpos(lower(m.display_name),lower(p_search))>0)
      and (p_status='' or m.status=p_status)
  ), paged as (select * from filtered order by created_at desc,id limit 25 offset (greatest(1,least(p_page,10000))-1)*25)
  select jsonb_build_object('members',coalesce((select jsonb_agg(to_jsonb(p)) from paged p),'[]'::jsonb),
    'total',(select count(*) from filtered),'stats',(select jsonb_build_object(
      'total',count(*),'new30',count(*) filter(where created_at>=now()-interval '30 days'),
      'active30',count(*) filter(where last_active_at>=now()-interval '30 days'),
      'saved',count(*) filter(where exists(select 1 from public.member_favorites f where f.member_id=m.id))) from public.member_profiles m));
$$;
revoke all on function public.admin_list_members(text,text,integer) from public,anon,authenticated;
grant execute on function public.admin_list_members(text,text,integer) to service_role;

commit;
