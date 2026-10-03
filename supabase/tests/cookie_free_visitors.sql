-- Always self-contained: no test counters or identifiers survive this test.
begin;
do $$
declare v_day date=(now()at time zone'Europe/Brussels')::date;v_base bigint;v_hour_base bigint;v_count bigint;v_coverage timestamptz;
 v_one text=repeat('d',64);v_two text=repeat('c',64);v_rate text=repeat('b',64);v_denied text=repeat('a',64);
begin
 if has_table_privilege('anon','public.analytics_visitor_seen','select') or has_table_privilege('authenticated','public.analytics_visitors_daily','select') or has_function_privilege('anon','public.record_site_analytics_with_visitors(text,text,text,text,text,text)','execute') or has_function_privilege('authenticated','public.record_site_analytics_with_visitors(text,text,text,text,text,text)','execute') then raise exception 'Visitors must remain service-only';end if;
 if exists(select 1 from public.analytics_visitor_seen where day=v_day and fingerprint in(v_one,v_two)) then raise exception 'Test fingerprints in use';end if;
 select coalesce(sum(count),0)into v_base from public.analytics_visitors_daily where day=v_day and path='@site';
 select coalesce(sum(count),0)into v_hour_base from public.analytics_visitors_hourly where hour=(date_trunc('hour',now()at time zone'UTC')at time zone'UTC')and path='@site';
 if not public.record_site_analytics_with_visitors('/visitor-test-one','pageview','google','mobile',v_rate,v_one)then raise exception 'First view rejected';end if;
 perform public.record_site_analytics_with_visitors('/visitor-test-one','pageview','direct','mobile',v_rate,v_one);
 perform public.record_site_analytics_with_visitors('/visitor-test-two','pageview','direct','mobile',v_rate,v_one);
 perform public.record_site_analytics_with_visitors('/visitor-test-one','pageview','direct','desktop',v_rate,v_two);
 perform public.record_site_analytics_with_visitors('/visitor-test-two','website','direct','desktop',v_rate,v_two);
 select coalesce(sum(count),0)into v_count from public.analytics_visitors_daily where day=v_day and path='@site';
 if v_count<>v_base+2 then raise exception 'Site total double-counts pages or actions';end if;
 select sum(count)into v_count from public.analytics_visitors_daily where day=v_day and path='/visitor-test-one';if v_count<>2 then raise exception 'Repeated view counted as visitor';end if;
 select sum(count)into v_count from public.analytics_visitors_daily where day=v_day and path='/visitor-test-two';if v_count<>1 then raise exception 'Action counted as visitor';end if;
 if exists(select 1 from public.analytics_visitors_daily where path='/visitor-test-one'and referrer='direct'and device='mobile')then raise exception 'Repeat changed first attribution';end if;
 select sum(count)into v_count from public.analytics_daily where day=v_day and path='/visitor-test-one'and event='pageview';if v_count<>3 then raise exception 'Visitor dedup lost pageviews';end if;
 select sum(count)into v_count from public.analytics_visitors_hourly where hour=(date_trunc('hour',now()at time zone'UTC')at time zone'UTC')and path='@site';if v_count<>v_hour_base+2 then raise exception 'Hourly visitor total diverges';end if;
 select started_at into v_coverage from public.analytics_visitors_coverage where id=true;if v_coverage is null then raise exception 'Missing collection coverage';end if;
 insert into public.analytics_rate_limits(day,fingerprint,count)values(v_day,v_denied,600)on conflict(day,fingerprint)do update set count=600;
 if public.record_site_analytics_with_visitors('/visitor-test-denied','pageview','direct','desktop',v_denied,v_denied)then raise exception 'Rate-limited view accepted';end if;
 if exists(select 1 from public.analytics_visitor_seen where day=v_day and fingerprint=v_denied)then raise exception 'Denied view counted';end if;
 insert into public.analytics_visitor_seen(day,fingerprint,path)values(v_day-1,v_one,'/old-visitor');
 perform public.cleanup_site_analytics();if exists(select 1 from public.analytics_visitor_seen where day<v_day)then raise exception 'Old visitor identifiers retained';end if;
end;$$;
rollback;
