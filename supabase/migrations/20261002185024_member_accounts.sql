-- Member data is private. Admin endpoints use the existing server-side admin check.
begin;

create table public.member_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  email_confirmed_at timestamptz,
  display_name text not null default '' check (char_length(display_name) <= 80),
  home_city text check (home_city in ('knokke-heist','zeebrugge','blankenberge','wenduine','de-haan','bredene','oostende','middelkerke','nieuwpoort','koksijde','de-panne')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  last_active_at timestamptz
);
create index member_profiles_created_idx on public.member_profiles(created_at desc, id);

create function public.sync_member_identity() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.member_profiles(id,email,email_confirmed_at,created_at)
  values(new.id,coalesce(new.email,''),new.email_confirmed_at,new.created_at)
  on conflict(id) do update set email=excluded.email,email_confirmed_at=excluded.email_confirmed_at;
  return new;
end;
$$;
revoke all on function public.sync_member_identity() from public,anon,authenticated;
create trigger sync_member_identity after insert or update of email,email_confirmed_at on auth.users
for each row execute function public.sync_member_identity();
insert into public.member_profiles(id,email,email_confirmed_at,created_at)
select id,coalesce(email,''),email_confirmed_at,created_at from auth.users;

create function public.is_active_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.member_profiles where id=(select auth.uid()) and status='active' and email_confirmed_at is not null);
$$;
revoke all on function public.is_active_member() from public,anon;
grant execute on function public.is_active_member() to authenticated;

create table public.member_favorites (
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  kind text not null check (kind in ('hotspot','service','offleash')),
  city_slug text not null check (city_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(city_slug)<=80),
  place_slug text not null check (place_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(place_slug)<=150),
  created_at timestamptz not null default now(),
  primary key(member_id,kind,city_slug,place_slug)
);
create table public.member_towns (
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  city_slug text not null check (city_slug in ('knokke-heist','zeebrugge','blankenberge','wenduine','de-haan','bredene','oostende','middelkerke','nieuwpoort','koksijde','de-panne')),
  created_at timestamptz not null default now(),
  primary key(member_id,city_slug)
);
create table public.member_dogs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  breed text not null default '' check (char_length(breed)<=80),
  avatar text not null default 'sand' check (avatar in ('sand','sea','sun','rose')),
  created_at timestamptz not null default now()
);
create table public.member_trips (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  trip_date date,
  note text not null default '' check (char_length(note)<=2000),
  share_token uuid unique,
  created_at timestamptz not null default now()
);
create index member_trips_owner_idx on public.member_trips(member_id);
create table public.member_trip_places (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.member_trips(id) on delete cascade,
  kind text not null check (kind in ('hotspot','service','offleash')),
  city_slug text not null check (city_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(city_slug)<=80),
  place_slug text not null check (place_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(place_slug)<=150),
  created_at timestamptz not null default now(),
  unique(trip_id,kind,city_slug,place_slug)
);

alter table public.member_profiles enable row level security;
alter table public.member_favorites enable row level security;
alter table public.member_towns enable row level security;
alter table public.member_dogs enable row level security;
alter table public.member_trips enable row level security;
alter table public.member_trip_places enable row level security;
revoke all on public.member_profiles,public.member_favorites,public.member_towns,public.member_dogs,public.member_trips,public.member_trip_places from anon,authenticated;
grant select on public.member_profiles to authenticated;
grant update(display_name,home_city) on public.member_profiles to authenticated;
grant select,insert,delete on public.member_favorites,public.member_towns to authenticated;
grant select,insert,delete on public.member_dogs,public.member_trips to authenticated;
grant update(name,breed,avatar) on public.member_dogs to authenticated;
grant update(title,trip_date,note,share_token) on public.member_trips to authenticated;
grant select,insert,delete on public.member_trip_places to authenticated;
grant all on public.member_profiles,public.member_favorites,public.member_towns,public.member_dogs,public.member_trips,public.member_trip_places to service_role;

create policy own_profile_read on public.member_profiles for select to authenticated using(id=(select auth.uid()));
create policy own_profile_update on public.member_profiles for update to authenticated using(id=(select auth.uid()) and public.is_active_member()) with check(id=(select auth.uid()));
create policy own_favorites on public.member_favorites for all to authenticated using(member_id=(select auth.uid()) and public.is_active_member()) with check(member_id=(select auth.uid()) and public.is_active_member());
create policy own_towns on public.member_towns for all to authenticated using(member_id=(select auth.uid()) and public.is_active_member()) with check(member_id=(select auth.uid()) and public.is_active_member());
create policy own_dogs on public.member_dogs for all to authenticated using(member_id=(select auth.uid()) and public.is_active_member()) with check(member_id=(select auth.uid()) and public.is_active_member());
create policy own_trips on public.member_trips for all to authenticated using(member_id=(select auth.uid()) and public.is_active_member()) with check(member_id=(select auth.uid()) and public.is_active_member());
create policy own_trip_places on public.member_trip_places for all to authenticated
using(public.is_active_member() and exists(select 1 from public.member_trips t where t.id=trip_id and t.member_id=(select auth.uid())))
with check(public.is_active_member() and exists(select 1 from public.member_trips t where t.id=trip_id and t.member_id=(select auth.uid())));

-- Serialize per-owner inserts to bound storage even under concurrent requests.
create function public.limit_member_records() returns trigger
language plpgsql security definer set search_path = '' as $$
declare owner_id uuid; total integer; maximum integer;
begin
  if tg_table_name='member_trip_places' then
    select member_id into owner_id from public.member_trips where id=new.trip_id;
  else owner_id:=new.member_id; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
  case tg_table_name
    when 'member_favorites' then select count(*) into total from public.member_favorites where member_id=owner_id; maximum:=500;
    when 'member_dogs' then select count(*) into total from public.member_dogs where member_id=owner_id; maximum:=10;
    when 'member_trips' then select count(*) into total from public.member_trips where member_id=owner_id; maximum:=100;
    when 'member_trip_places' then select count(*) into total from public.member_trip_places where trip_id=new.trip_id; maximum:=100;
  end case;
  if total>=maximum then raise exception 'Je hebt het maximum aantal bereikt.'; end if;
  return new;
end;
$$;
revoke all on function public.limit_member_records() from public,anon,authenticated;
create trigger member_favorites_limit before insert on public.member_favorites for each row execute function public.limit_member_records();
create trigger member_dogs_limit before insert on public.member_dogs for each row execute function public.limit_member_records();
create trigger member_trips_limit before insert on public.member_trips for each row execute function public.limit_member_records();
create trigger member_trip_places_limit before insert on public.member_trip_places for each row execute function public.limit_member_records();

create function public.record_member_visit() returns void
language sql security definer set search_path = '' as $$
  update public.member_profiles set last_active_at=now()
  where id=(select auth.uid()) and public.is_active_member() and (last_active_at is null or last_active_at<now()-interval '1 hour');
$$;
revoke all on function public.record_member_visit() from public,anon;
grant execute on function public.record_member_visit() to authenticated;

-- Share only the title, chosen date and places. Never notes, email or owner ID.
create function public.read_shared_trip(p_token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('title',t.title,'trip_date',t.trip_date,'places',coalesce((
    select jsonb_agg(jsonb_build_object('kind',p.kind,'city_slug',p.city_slug,'place_slug',p.place_slug) order by p.created_at,p.id)
    from public.member_trip_places p where p.trip_id=t.id),'[]'::jsonb))
  from public.member_trips t join public.member_profiles m on m.id=t.member_id
  where t.share_token=p_token and m.status='active' and m.email_confirmed_at is not null;
$$;
revoke all on function public.read_shared_trip(uuid) from public;
grant execute on function public.read_shared_trip(uuid) to anon,authenticated;

create function public.admin_list_members(p_search text default '',p_status text default '',p_page integer default 1) returns jsonb
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
      'total',count(*),'verified',count(*) filter(where email_confirmed_at is not null),
      'active30',count(*) filter(where last_active_at>=now()-interval '30 days'),
      'saved',count(*) filter(where exists(select 1 from public.member_favorites f where f.member_id=m.id))) from public.member_profiles m));
$$;
revoke all on function public.admin_list_members(text,text,integer) from public,anon,authenticated;
grant execute on function public.admin_list_members(text,text,integer) to service_role;

create function public.admin_set_member_status(p_id uuid,p_status text,p_actor uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.member_profiles set status=p_status where id=p_id;
  if not found then raise exception 'Member not found'; end if;
  insert into public.admin_activity_log(actor_id,action,details)
    values(p_actor,'member_status',jsonb_build_object('member_id',p_id,'status',p_status));
end;
$$;
revoke all on function public.admin_set_member_status(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.admin_set_member_status(uuid,text,uuid) to service_role;
commit;
