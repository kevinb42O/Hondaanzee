-- Additive dashboard foundation. Existing public tables and Storage are untouched.
-- All access is through admin-authenticated Edge Functions using service_role.
begin;

create table public.content_places (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('hotspot', 'service')),
  legacy_id bigint not null check (legacy_id > 0),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  city_slug text not null check (city_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  version integer not null default 1 check (version > 0),
  draft_revision_id uuid,
  published_revision_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, legacy_id),
  unique (kind, city_slug, slug)
);

-- Every save appends a revision. The original complete object stays in JSON,
-- including optional properties and the order of legacy gallery URLs.
create table public.content_place_revisions (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.content_places(id),
  revision_number integer not null check (revision_number > 0),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  source text not null check (source in ('legacy_import', 'dashboard')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (place_id, revision_number),
  unique (place_id, id)
);

alter table public.content_places add constraint content_places_draft_revision_fk
  foreign key (id, draft_revision_id)
  references public.content_place_revisions(place_id, id) deferrable initially deferred;
alter table public.content_places add constraint content_places_published_revision_fk
  foreign key (id, published_revision_id)
  references public.content_place_revisions(place_id, id) deferrable initially deferred;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_provider text not null check (storage_provider in ('legacy', 'r2')),
  bucket text,
  object_key text,
  public_url text,
  status text not null check (status in ('pending', 'verified', 'failed')),
  mime_type text check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size bigint check (byte_size > 0 and byte_size <= 10485760),
  width integer check (width > 0 and width <= 12000),
  height integer check (height > 0 and height <= 12000),
  alt_text text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  expires_at timestamptz,
  unique (bucket, object_key),
  check (
    (storage_provider = 'legacy' and bucket is null and object_key is null
      and public_url is not null and status = 'verified')
    or (storage_provider = 'r2' and bucket in ('hondaanzee-uploads', 'hondaanzee-media')
      and object_key is not null)
  ),
  check (status <> 'verified' or public_url is not null),
  check (storage_provider <> 'r2' or status <> 'verified'
    or (bucket = 'hondaanzee-media' and mime_type is not null
      and byte_size is not null and width is not null and height is not null
      and verified_at is not null))
);

create table public.content_releases (
  id uuid primary key default gen_random_uuid(),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  snapshot_sha256 text not null check (snapshot_sha256 ~ '^[a-f0-9]{64}$'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.publication_jobs (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.content_releases(id),
  status text not null default 'requested'
    check (status in ('requested', 'building', 'live', 'failed')),
  deployment_id text,
  deployment_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  live_at timestamptz,
  check (status <> 'live' or (deployment_id is not null and live_at is not null))
);
-- One deployment workflow at a time. An older build cannot silently supersede
-- a newer requested release. Publication code must verify production promotion.
create unique index publication_jobs_one_active
  on public.publication_jobs ((true)) where status in ('requested', 'building');

create table public.admin_activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  place_id uuid references public.content_places(id),
  revision_id uuid references public.content_place_revisions(id),
  release_id uuid references public.content_releases(id),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_activity_log_created_at_idx on public.admin_activity_log(created_at desc);
create index content_places_updated_at_idx on public.content_places(updated_at desc);

-- Content history and release payloads cannot be rewritten. Actor references
-- may be cleared by the auth.users FK without changing the saved content.
create function public.guard_content_history() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then raise exception 'CONTENT_HISTORY_IMMUTABLE'; end if;
  if (to_jsonb(new) - 'created_by') is distinct from (to_jsonb(old) - 'created_by') then
    raise exception 'CONTENT_HISTORY_IMMUTABLE';
  end if;
  return new;
end;
$$;
create trigger content_place_revisions_immutable before update or delete
  on public.content_place_revisions for each row execute function public.guard_content_history();
create trigger content_releases_immutable before update or delete
  on public.content_releases for each row execute function public.guard_content_history();
revoke all on function public.guard_content_history() from public, anon, authenticated;

-- No client policies: neither anon nor an ordinary signed-in user may read or
-- mutate draft data. service_role is used only after server-side admin auth.
alter table public.content_places enable row level security;
alter table public.content_place_revisions enable row level security;
alter table public.media_assets enable row level security;
alter table public.content_releases enable row level security;
alter table public.publication_jobs enable row level security;
alter table public.admin_activity_log enable row level security;
revoke all on public.content_places, public.content_place_revisions,
  public.media_assets, public.content_releases, public.publication_jobs,
  public.admin_activity_log from anon, authenticated;
grant all on public.content_places, public.content_place_revisions,
  public.media_assets, public.content_releases, public.publication_jobs,
  public.admin_activity_log to service_role;
grant usage, select on sequence public.admin_activity_log_id_seq to service_role;

-- Atomic optimistic locking. Each revision is a full validated object supplied
-- by the Edge Function. Fixed identity and URL are also enforced here.
create function public.save_content_place_draft(
  p_place_id uuid, p_expected_version integer, p_content jsonb, p_actor_id uuid
) returns jsonb language plpgsql set search_path = '' as $$
declare
  v_place public.content_places%rowtype;
  v_revision_id uuid;
begin
  select * into v_place from public.content_places where id = p_place_id for update;
  if not found then raise exception 'PLACE_NOT_FOUND'; end if;
  if v_place.version <> p_expected_version then raise exception 'VERSION_CONFLICT'; end if;
  if v_place.archived_at is not null then raise exception 'PLACE_ARCHIVED'; end if;
  if jsonb_typeof(p_content) is distinct from 'object'
    or p_content->>'id' is distinct from v_place.legacy_id::text
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
revoke all on function public.save_content_place_draft(uuid, integer, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.save_content_place_draft(uuid, integer, jsonb, uuid)
  to service_role;

commit;
