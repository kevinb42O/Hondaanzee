begin;
create extension if not exists pg_net with schema extensions;
create function public.poll_content_publication()returns void language plpgsql set search_path='' as $$
declare v_token text;
begin
 if not exists(select 1 from public.publication_jobs where status in ('requested','building'))then return;end if;
 select decrypted_secret into v_token from vault.decrypted_secrets where name='hondaanzee_publication_worker';
 if v_token is null then return;end if;
 perform net.http_post(url:='https://zpllibfxaizavcvztnut.supabase.co/functions/v1/admin-publication',headers:=jsonb_build_object('Content-Type','application/json','x-publication-worker-token',v_token),body:='{"action":"sync"}'::jsonb,timeout_milliseconds:=50000);
end;
$$;
revoke all on function public.poll_content_publication() from public,anon,authenticated;
grant execute on function public.poll_content_publication() to service_role;
select cron.schedule('hondaanzee-publication-status','* * * * *','select public.poll_content_publication();');
select cron.schedule('hondaanzee-dashboard-job-retention','25 0 * * *', $retention$
delete from cron.job_run_details where jobid in(select jobid from cron.job where jobname in('hondaanzee-publication-status','hondaanzee-analytics-retention','hondaanzee-dashboard-job-retention')) and end_time<now()-interval '7 days';
$retention$);
commit;
