begin;
-- Original zones lack a numeric content id; preserve that original identity.
create or replace function public.save_content_place_draft(
  p_place_id uuid, p_expected_version integer, p_content jsonb, p_actor_id uuid
) returns jsonb language plpgsql set search_path = '' as $$
declare
  v_place public.content_places%rowtype;
  v_revision_id uuid;
begin
  select * into v_place from public.content_places where id = p_place_id for update;
  if not found then raise exception 'PLACE_NOT_FOUND'; end if;
  if v_place.version <> p_expected_version then raise exception 'VERSION_CONFLICT'; end if;
  if v_place.archived_at is not null and v_place.kind<>'offleash' then raise exception 'PLACE_ARCHIVED'; end if;
  if jsonb_typeof(p_content) is distinct from 'object'
    or p_content->>'id' is distinct from (case when v_place.kind='offleash' then (select content->>'id' from public.content_place_revisions where id=v_place.draft_revision_id) else v_place.legacy_id::text end)
    or p_content->>'slug' is distinct from v_place.slug
    or p_content->>'city' is distinct from v_place.city_slug then
    raise exception 'PLACE_IDENTITY_CHANGE';
  end if;
  insert into public.content_place_revisions
    (place_id, revision_number, content, source, created_by)
    values (p_place_id, v_place.version + 1, p_content, 'dashboard', p_actor_id)
    returning id into v_revision_id;
  update public.content_places set draft_revision_id = v_revision_id,
    version = version + 1, updated_at = now() where id = p_place_id;
  insert into public.admin_activity_log(actor_id, action, place_id, revision_id)
    values (p_actor_id, 'save_place_draft', p_place_id, v_revision_id);
  return jsonb_build_object('revision_id', v_revision_id, 'version', v_place.version + 1);
end;
$$;
create or replace function public.public_zone_reviews(p_slug text,p_limit integer default 20,p_before timestamptz default null,p_before_id uuid default null)returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_zone uuid;v_rows jsonb;v_count integer;v_avg numeric;
begin
 if p_limit is null or p_limit<1 or p_limit>50 or((p_before is null)<>(p_before_id is null))then raise exception'INVALID_CURSOR';end if;
 select p.id into v_zone from public.content_places p join public.content_place_revisions rev on rev.id=p.published_revision_id where p.kind='offleash'and p.slug=p_slug and p.archived_at is null and coalesce(rev.content->>'visibility','visible')<>'archived';
 if v_zone is null then return jsonb_build_object('reviews','[]'::jsonb,'count',0,'average',null);end if;
 select count(*)::integer,round(avg(rating)::numeric,1)into v_count,v_avg from public.reviews where zone_id=v_zone and status='published';
 select coalesce(jsonb_agg(to_jsonb(q)order by q.created_at desc,q.id desc),'[]'::jsonb)into v_rows from(select id,rating,public_name as user_name,public_comment as comment,created_at from public.reviews where zone_id=v_zone and status='published'and(p_before is null or(created_at,id)<(p_before,p_before_id))order by created_at desc,id desc limit p_limit)q;
 return jsonb_build_object('reviews',v_rows,'count',v_count,'average',v_avg);
end;$$;
commit;
