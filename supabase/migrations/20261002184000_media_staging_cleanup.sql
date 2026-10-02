begin;
alter table public.media_assets add column staging_cleaned_at timestamptz;
-- Deletes only our temporary UUID staging objects, never public or legacy media.
create function public.cleanup_media_staging() returns void
language plpgsql security definer set search_path='' as $$
declare v_token text;
begin
 if not exists(select 1 from public.media_assets where storage_provider='r2' and staging_cleaned_at is null and created_at<now()-interval '24 hours')then return;end if;
 select decrypted_secret into v_token from vault.decrypted_secrets where name='hondaanzee_publication_worker' limit 1;
 if v_token is null then return;end if;
 perform net.http_post(url:='https://zpllibfxaizavcvztnut.supabase.co/functions/v1/admin-media',headers:=jsonb_build_object('Content-Type','application/json','x-publication-worker-token',v_token),body:='{"action":"cleanup"}'::jsonb,timeout_milliseconds:=30000);
end;
$$;
revoke all on function public.cleanup_media_staging() from public,anon,authenticated;
grant execute on function public.cleanup_media_staging() to service_role;
select cron.schedule('hondaanzee-media-staging-cleanup','35 0 * * *','select public.cleanup_media_staging()');
commit;
