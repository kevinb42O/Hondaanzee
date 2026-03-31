create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique default substr(encode(gen_random_bytes(8), 'hex'), 1, 12),
  category text not null check (category in ('gif', 'afval', 'weggegooid_voorwerp', 'hondenpoep', 'gevaarlijke_situatie', 'andere_overlast')),
  city_slug text not null,
  location_text text not null,
  description text not null,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  status text not null default 'published' check (status in ('published', 'removed')),
  is_hidden boolean not null default false,
  report_count integer not null default 0,
  ip_address_hash text,
  city_intervention_status text not null default 'not_applicable' check (city_intervention_status in ('not_applicable', 'pending', 'forwarded', 'resolved')),
  city_intervention_note text,
  resolved_at timestamptz
);

create index if not exists reports_public_id_idx on public.reports (public_id);
create index if not exists reports_city_slug_idx on public.reports (city_slug);
create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_observed_at_idx on public.reports (observed_at desc);

create table if not exists public.report_flags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  ip_address_hash text not null,
  created_at timestamptz not null default now(),
  constraint report_flags_unique_report_ip unique (report_id, ip_address_hash)
);

create index if not exists report_flags_report_id_idx on public.report_flags (report_id);

create or replace function public.sync_report_flag_state(target_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  flag_total integer;
begin
  select count(*)::integer
  into flag_total
  from public.report_flags
  where report_id = target_report_id;

  update public.reports
  set
    report_count = flag_total,
    is_hidden = case
      when flag_total >= 3 then true
      else is_hidden
    end
  where id = target_report_id;
end;
$$;

create or replace function public.handle_report_flag_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_report_flag_state(coalesce(new.report_id, old.report_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists report_flags_after_insert on public.report_flags;
create trigger report_flags_after_insert
after insert on public.report_flags
for each row
execute function public.handle_report_flag_change();

drop trigger if exists report_flags_after_delete on public.report_flags;
create trigger report_flags_after_delete
after delete on public.report_flags
for each row
execute function public.handle_report_flag_change();

alter table public.reports enable row level security;
alter table public.report_flags enable row level security;

drop policy if exists "Public can read visible reports" on public.reports;
create policy "Public can read visible reports"
on public.reports
for select
to anon, authenticated
using (status = 'published' and is_hidden = false);

drop policy if exists "No public writes to reports" on public.reports;
create policy "No public writes to reports"
on public.reports
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "No public writes to report_flags" on public.report_flags;
create policy "No public writes to report_flags"
on public.report_flags
for all
to anon, authenticated
using (false)
with check (false);
