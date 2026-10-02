begin;
-- Members can insert/delete their favorites, but cannot choose a date to influence
-- the recent-popularity ranking. Existing addition dates remain unchanged.
create function public.set_favorite_created_at()
returns trigger language plpgsql set search_path='' as $$
begin
 new.created_at=now();
 return new;
end;
$$;
revoke all on function public.set_favorite_created_at() from public,anon,authenticated;
create trigger member_favorites_created_at before insert on public.member_favorites
 for each row execute function public.set_favorite_created_at();
commit;
