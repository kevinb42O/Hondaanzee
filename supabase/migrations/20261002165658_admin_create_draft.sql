begin;
create function public.create_content_place_draft(
  p_kind text, p_city text, p_slug text, p_content jsonb, p_actor_id uuid
) returns jsonb language plpgsql set search_path = '' as $$
declare v_id uuid; v_legacy_id bigint; v_revision uuid;
begin
  if p_kind not in ('hotspot', 'service') or jsonb_typeof(p_content) is distinct from 'object' then
    raise exception 'INVALID_CONTENT';
  end if;
  -- Allocate within the same kind while concurrent admins create new drafts.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('content_place_id:' || p_kind));
  select coalesce(max(legacy_id), 0) + 1 into v_legacy_id from public.content_places where kind = p_kind;
  insert into public.content_places(kind, legacy_id, slug, city_slug)
    values(p_kind, v_legacy_id, p_slug, p_city) returning id into v_id;
  insert into public.content_place_revisions(place_id, revision_number, content, source, created_by)
    values(v_id, 1, p_content || jsonb_build_object('id', v_legacy_id, 'city', p_city, 'slug', p_slug), 'dashboard', p_actor_id)
    returning id into v_revision;
  update public.content_places set draft_revision_id = v_revision where id = v_id;
  insert into public.admin_activity_log(actor_id, action, place_id, revision_id)
    values(p_actor_id, 'create_place_draft', v_id, v_revision);
  return jsonb_build_object('id', v_id, 'version', 1);
end;
$$;
revoke all on function public.create_content_place_draft(text, text, text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.create_content_place_draft(text, text, text, jsonb, uuid) to service_role;
commit;
