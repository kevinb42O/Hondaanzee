begin;
-- Deleting a member account keeps its moderated review and removes its account
-- link. All original content remains immutable; an active author's link cannot
-- be edited by moderation.
alter table public.reviews drop constraint reviews_user_id_fkey;
alter table public.reviews add constraint reviews_user_id_fkey foreign key(user_id)references auth.users(id)on delete set null;
create or replace function public.guard_review_original()returns trigger language plpgsql set search_path='' as $$
begin
 if(new.rating,new.comment,new.user_name,new.created_at,new.area_slug,new.zone_id)is distinct from(old.rating,old.comment,old.user_name,old.created_at,old.area_slug,old.zone_id)then raise exception'REVIEW_ORIGINAL_IMMUTABLE';end if;
 if new.user_id is distinct from old.user_id and not(new.user_id is null and old.user_id is not null and not exists(select 1 from auth.users where id=old.user_id))then raise exception'REVIEW_ORIGINAL_IMMUTABLE';end if;
 return new;
end;$$;
commit;
