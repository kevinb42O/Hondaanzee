-- Run against the installed member migrations inside BEGIN / ROLLBACK.
-- No real users, emails, sessions or persistent records are created by this test.
do $$ begin
  if exists(select 1 from auth.users where id in ('f0000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000002')) then
    raise exception 'Test IDs already exist; refusing to overwrite';
  end if;
end $$;
insert into auth.users(id,email,email_confirmed_at,created_at,updated_at,aud,role)
values('f0000000-0000-4000-8000-000000000001','haz-rls-one@example.invalid',now(),now(),now(),'authenticated','authenticated'),
      ('f0000000-0000-4000-8000-000000000002','haz-rls-two@example.invalid',now(),now(),now(),'authenticated','authenticated');
insert into public.member_favorites(member_id,kind,city_slug,place_slug)
values('f0000000-0000-4000-8000-000000000002','hotspot','de-haan','other-private-place');
insert into public.member_trips(id,member_id,title,note,share_token)
values('f0000000-0000-4000-8000-000000000011','f0000000-0000-4000-8000-000000000001','My shared test','PRIVATE-NOTE-NEVER-SHARE','f0000000-0000-4000-8000-000000000021'),
      ('f0000000-0000-4000-8000-000000000012','f0000000-0000-4000-8000-000000000002','Other private test','','f0000000-0000-4000-8000-000000000022');
insert into public.member_trip_places(trip_id,kind,city_slug,place_slug)
values('f0000000-0000-4000-8000-000000000012','hotspot','de-haan','other-private-place');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"f0000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ declare n integer; begin
  select count(*) into n from public.member_profiles; if n<>1 then raise exception 'Profile isolation failed'; end if;
  select count(*) into n from public.member_favorites; if n<>0 then raise exception 'Favorite isolation failed'; end if;
  select count(*) into n from public.member_trips; if n<>1 then raise exception 'Trip isolation failed'; end if;
  select count(*) into n from public.member_trip_places; if n<>0 then raise exception 'Trip item isolation failed'; end if;
  update public.member_profiles set display_name='UNAUTHORIZED' where id='f0000000-0000-4000-8000-000000000002';
  get diagnostics n=row_count; if n<>0 then raise exception 'Cross-profile update succeeded'; end if;
  begin
    update public.member_profiles set status='suspended' where id='f0000000-0000-4000-8000-000000000001';
    raise exception 'Member updated administrative status';
  exception when insufficient_privilege then null; end;
  begin
    update public.member_profiles set email_confirmed_at=now() where id='f0000000-0000-4000-8000-000000000001';
    raise exception 'Member forged email verification';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.member_favorites(member_id,kind,city_slug,place_slug) values('f0000000-0000-4000-8000-000000000002','hotspot','de-haan','forged');
    raise exception 'Member wrote another members favorite';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.member_trip_places(trip_id,kind,city_slug,place_slug) values('f0000000-0000-4000-8000-000000000012','hotspot','de-haan','forged');
    raise exception 'Member wrote another members trip item';
  exception when insufficient_privilege then null; end;
  begin
    perform public.admin_list_members('','',1); raise exception 'Member enumerated users';
  exception when insufficient_privilege then null; end;
end $$;
insert into public.member_favorites(member_id,kind,city_slug,place_slug)
values('f0000000-0000-4000-8000-000000000001','hotspot','de-haan','my-own-place');
insert into public.member_trip_places(trip_id,kind,city_slug,place_slug)
values('f0000000-0000-4000-8000-000000000011','hotspot','de-haan','my-own-place');
do $$ declare i integer; begin
  for i in 1..10 loop insert into public.member_dogs(member_id,name) values('f0000000-0000-4000-8000-000000000001','Test dog '||i); end loop;
  begin
    insert into public.member_dogs(member_id,name) values('f0000000-0000-4000-8000-000000000001','One too many');
    raise exception 'Record limit failed';
  exception when raise_exception then
    if sqlerrm<>'Je hebt het maximum aantal bereikt.' then raise; end if;
  end;
end $$;
select public.record_member_visit();
reset role;

set local role anon;
do $$ declare shared jsonb; begin
  begin perform * from public.member_profiles; raise exception 'Anonymous profile access'; exception when insufficient_privilege then null; end;
  shared:=public.read_shared_trip('f0000000-0000-4000-8000-000000000021');
  if shared->>'title'<>'My shared test' or jsonb_array_length(shared->'places')<>1 then raise exception 'Shared collection unavailable'; end if;
  if shared ? 'note' or shared ? 'member_id' or shared ? 'email' or position('PRIVATE-NOTE' in shared::text)>0 then raise exception 'Private data leaked'; end if;
end $$;
reset role;
update public.member_trips set share_token=null where id='f0000000-0000-4000-8000-000000000011';
do $$ begin if public.read_shared_trip('f0000000-0000-4000-8000-000000000021') is not null then raise exception 'Revoked share still readable'; end if; end $$;
update public.member_trips set share_token='f0000000-0000-4000-8000-000000000021' where id='f0000000-0000-4000-8000-000000000011';
update public.member_profiles set status='suspended' where id='f0000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$ declare n integer; begin
  select count(*) into n from public.member_favorites; if n<>0 then raise exception 'Suspended member read private data'; end if;
  begin insert into public.member_towns(member_id,city_slug) values('f0000000-0000-4000-8000-000000000001','de-haan'); raise exception 'Suspended member wrote data'; exception when insufficient_privilege then null; end;
  if public.read_shared_trip('f0000000-0000-4000-8000-000000000021') is not null then raise exception 'Suspended collection still shared'; end if;
end $$;
reset role;
update public.member_profiles set status='active' where id='f0000000-0000-4000-8000-000000000001';
update auth.users set email_confirmed_at=null where id='f0000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$ begin if not public.is_active_member() then raise exception 'Password account cannot use its member data'; end if;
  if public.read_shared_trip('f0000000-0000-4000-8000-000000000021') is null then raise exception 'Password account cannot share outings'; end if; end $$;
reset role;
delete from auth.users where id='f0000000-0000-4000-8000-000000000001';
do $$ begin
  if exists(select 1 from public.member_profiles where id='f0000000-0000-4000-8000-000000000001') or exists(select 1 from public.member_trips where id='f0000000-0000-4000-8000-000000000011') or exists(select 1 from public.member_trip_places where trip_id='f0000000-0000-4000-8000-000000000011') then raise exception 'Account cascade failed'; end if;
end $$;
select true as member_security_checks_passed;
