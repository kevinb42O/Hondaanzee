-- Activate after the new public review UI is deployed. Public reads use only
-- whitelisted approved fields from SECURITY DEFINER RPCs. Guest submissions
-- use the validated Edge Function; direct table requests cannot bypass it.
begin;
drop policy if exists "Reviews are viewable by everyone."on public.reviews;
drop policy if exists "Anyone can insert reviews."on public.reviews;
drop policy if exists "Users can update own reviews."on public.reviews;
revoke all on public.reviews from anon,authenticated;
grant all on public.reviews to service_role;
commit;
