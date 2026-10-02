begin;

-- A rejected edit retains the approved version. Tell its author that the
-- submitted text was rejected rather than implying that it is now public.
create or replace function public.member_hotspot_state(p_member uuid,p_city text,p_slug text)returns jsonb language plpgsql stable set search_path='' as $$declare place uuid;own jsonb;begin
 perform public.community_require_member(p_member);place=public.community_place(p_city,p_slug);if place is null then raise exception 'PLACE_UNAVAILABLE';end if;
 select jsonb_build_object('id',r.id,'version',r.version,'status',r.status,'needs_review',r.needs_review,'has_published',r.published_revision_id is not null,
 'rejected_edit',r.status='published'and not r.needs_review and r.submitted_revision_id is distinct from r.published_revision_id,
 'rating',v.rating,'comment',v.comment,'name',v.public_name,'visit_month',v.visit_month)into own
 from public.hotspot_reviews r join public.hotspot_review_versions v on v.id=r.submitted_revision_id where r.member_id=p_member and r.place_id=place;
 return jsonb_build_object('liked',exists(select 1 from public.place_likes where place_id=place and member_id=p_member),'review',own);
end$$;

notify pgrst,'reload schema';
commit;
