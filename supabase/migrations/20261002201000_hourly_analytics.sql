begin;
-- Hour buckets are keyed by UTC, so Brussels DST never merges repeated hours.
create table public.analytics_hourly (
 hour timestamptz not null,path text not null check(length(path)<=240),
 event text not null check(event in('pageview','website','route','telefoon','social')),
 referrer text not null check(referrer in('direct','google','bing','facebook','instagram','hondaanzee','other')),
 device text not null check(device in('mobile','tablet','desktop')),
 count bigint not null default 1 check(count>0),primary key(hour,path,event,referrer,device),
 check(hour=(date_trunc('hour',hour at time zone'UTC')at time zone'UTC'))
);
create table public.analytics_hourly_coverage(id boolean primary key default true check(id),started_at timestamptz not null default clock_timestamp());
insert into public.analytics_hourly_coverage(id)values(true);
alter table public.analytics_hourly enable row level security;
alter table public.analytics_hourly_coverage enable row level security;
revoke all on public.analytics_hourly,public.analytics_hourly_coverage from anon,authenticated;
grant all on public.analytics_hourly,public.analytics_hourly_coverage to service_role;
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
create or replace function public.cleanup_site_analytics()returns void language sql set search_path='' as $$
 delete from public.analytics_daily_budget where day<(now()at time zone'Europe/Brussels')::date;
 delete from public.analytics_rate_limits where day<(now()at time zone'Europe/Brussels')::date;
 delete from public.analytics_daily where day<(now()at time zone'Europe/Brussels')::date-397;
 delete from public.analytics_hourly where hour<now()-interval'8 days';
$$;
commit;
