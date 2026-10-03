begin;
-- Daily deduplication is transient. Reports contain counters, never identifiers.
create table public.analytics_visitor_seen (
 day date not null, fingerprint text not null check(fingerprint ~ '^[a-f0-9]{64}$'),
 path text not null check(length(path)<=240), primary key(day,fingerprint,path)
);
create table public.analytics_visitors_daily (
 day date not null, path text not null check(length(path)<=240),
 referrer text not null check(referrer in('direct','google','bing','facebook','instagram','hondaanzee','other')),
 device text not null check(device in('mobile','tablet','desktop')),
 count bigint not null check(count>0), primary key(day,path,referrer,device)
);
create table public.analytics_visitors_hourly (
 hour timestamptz not null, path text not null check(length(path)<=240),
 referrer text not null check(referrer in('direct','google','bing','facebook','instagram','hondaanzee','other')),
 device text not null check(device in('mobile','tablet','desktop')),
 count bigint not null check(count>0), primary key(hour,path,referrer,device),
 check(hour=(date_trunc('hour',hour at time zone'UTC')at time zone'UTC'))
);
-- Starts with the first accepted visitor, not with historical pageview collection.
create table public.analytics_visitors_coverage (
 id boolean primary key default true check(id), started_at timestamptz not null
);
alter table public.analytics_visitor_seen enable row level security;
alter table public.analytics_visitors_daily enable row level security;
alter table public.analytics_visitors_hourly enable row level security;
alter table public.analytics_visitors_coverage enable row level security;
revoke all on public.analytics_visitor_seen,public.analytics_visitors_daily,public.analytics_visitors_hourly,public.analytics_visitors_coverage from public,anon,authenticated;
grant all on public.analytics_visitor_seen,public.analytics_visitors_daily,public.analytics_visitors_hourly,public.analytics_visitors_coverage to service_role;
create function public.record_site_analytics_with_visitors(p_path text,p_event text,p_referrer text,p_device text,p_fingerprint text,p_visitor_fingerprint text)
returns boolean language plpgsql set search_path='' as $$
declare v_day date=(now()at time zone'Europe/Brussels')::date;
 v_hour timestamptz=date_trunc('hour',now()at time zone'UTC')at time zone'UTC';v_path text;v_inserted integer;
begin
 if p_visitor_fingerprint is null or p_visitor_fingerprint !~ '^[a-f0-9]{64}$' or p_path='@site' then raise exception 'Invalid visitor input';end if;
 if not public.record_site_analytics(p_path,p_event,p_referrer,p_device,p_fingerprint) then return false;end if;
 if p_event<>'pageview' then return true;end if;
 insert into public.analytics_visitors_coverage(id,started_at)values(true,clock_timestamp())on conflict(id)do nothing;
 -- Site-wide unique first; never sum page-level uniques into the site total.
 foreach v_path in array array['@site',p_path] loop
  insert into public.analytics_visitor_seen(day,fingerprint,path)values(v_day,p_visitor_fingerprint,v_path)on conflict do nothing;
  get diagnostics v_inserted=row_count;
  if v_inserted>0 then
   insert into public.analytics_visitors_daily(day,path,referrer,device,count)values(v_day,v_path,p_referrer,p_device,1)
   on conflict(day,path,referrer,device)do update set count=analytics_visitors_daily.count+1;
   -- Hourly counts attribute each daily visitor to their first seen hour.
   insert into public.analytics_visitors_hourly(hour,path,referrer,device,count)values(v_hour,v_path,p_referrer,p_device,1)
   on conflict(hour,path,referrer,device)do update set count=analytics_visitors_hourly.count+1;
  end if;
 end loop;
 return true;
end;$$;
revoke all on function public.record_site_analytics_with_visitors(text,text,text,text,text,text)from public,anon,authenticated;
grant execute on function public.record_site_analytics_with_visitors(text,text,text,text,text,text)to service_role;
create or replace function public.cleanup_site_analytics()returns void language sql set search_path='' as $$
 delete from public.analytics_daily_budget where day<(now()at time zone'Europe/Brussels')::date;
 delete from public.analytics_rate_limits where day<(now()at time zone'Europe/Brussels')::date;
 delete from public.analytics_visitor_seen where day<(now()at time zone'Europe/Brussels')::date;
 delete from public.analytics_daily where day<(now()at time zone'Europe/Brussels')::date-397;
 delete from public.analytics_visitors_daily where day<(now()at time zone'Europe/Brussels')::date-397;
 delete from public.analytics_hourly where hour<now()-interval'8 days';
 delete from public.analytics_visitors_hourly where hour<now()-interval'8 days';
$$;
commit;
