begin;
-- Cookie-free counters only: no raw event, IP, query string or visitor identity.
create table public.analytics_daily (
 day date not null, path text not null check(length(path) <= 240),
 event text not null check(event in ('pageview','website','route','telefoon','social')),
 referrer text not null check(referrer in ('direct','google','bing','facebook','instagram','hondaanzee','other')),
 device text not null check(device in ('mobile','tablet','desktop')),
 count bigint not null default 1 check(count > 0),
 primary key(day,path,event,referrer,device)
);
create table public.analytics_daily_budget (day date primary key, count integer not null);
create table public.analytics_rate_limits (
 day date not null, fingerprint text not null check(length(fingerprint)=64), count integer not null,
 primary key(day,fingerprint)
);
alter table public.analytics_daily enable row level security;
alter table public.analytics_daily_budget enable row level security;
alter table public.analytics_rate_limits enable row level security;
revoke all on public.analytics_daily,public.analytics_rate_limits,public.analytics_daily_budget from anon,authenticated;
grant all on public.analytics_daily,public.analytics_rate_limits,public.analytics_daily_budget to service_role;
create function public.record_site_analytics(p_path text,p_event text,p_referrer text,p_device text,p_fingerprint text)
returns boolean language plpgsql set search_path='' as $$
declare v_day date := (now() at time zone 'Europe/Brussels')::date; v_count integer;
begin
 insert into public.analytics_daily_budget(day,count) values(v_day,1)
 on conflict(day) do update set count=public.analytics_daily_budget.count+1
 where public.analytics_daily_budget.count<100000 returning count into v_count;
 if v_count is null then return false; end if;
 insert into public.analytics_rate_limits(day,fingerprint,count) values(v_day,p_fingerprint,1)
 on conflict(day,fingerprint) do update set count=public.analytics_rate_limits.count+1
 where public.analytics_rate_limits.count<600 returning count into v_count;
 if v_count is null then return false; end if;
 insert into public.analytics_daily(day,path,event,referrer,device,count) values(v_day,p_path,p_event,p_referrer,p_device,1)
 on conflict(day,path,event,referrer,device) do update set count=public.analytics_daily.count+1;
 return true;
end;
$$;
create function public.cleanup_site_analytics() returns void language sql set search_path='' as $$
 delete from public.analytics_daily_budget where day < (now() at time zone 'Europe/Brussels')::date;
 delete from public.analytics_rate_limits where day < (now() at time zone 'Europe/Brussels')::date;
 delete from public.analytics_daily where day < (now() at time zone 'Europe/Brussels')::date - 397;
$$;
revoke all on function public.record_site_analytics(text,text,text,text,text), public.cleanup_site_analytics() from public,anon,authenticated;
grant execute on function public.record_site_analytics(text,text,text,text,text), public.cleanup_site_analytics() to service_role;
create extension if not exists pg_cron;
select cron.schedule('hondaanzee-analytics-retention','15 0 * * *','select public.cleanup_site_analytics();');
commit;
