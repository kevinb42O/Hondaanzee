alter table public.reports
add column if not exists confirm_count integer not null default 0;

create index if not exists reports_confirm_count_idx on public.reports (confirm_count desc);

create table if not exists public.report_confirmations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  ip_address_hash text not null,
  created_at timestamptz not null default now(),
  constraint report_confirmations_unique_report_ip unique (report_id, ip_address_hash)
);

create index if not exists report_confirmations_report_id_idx on public.report_confirmations (report_id);

create or replace function public.sync_report_confirmation_state(target_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  confirmation_total integer;
begin
  select count(*)::integer
  into confirmation_total
  from public.report_confirmations
  where report_id = target_report_id;

  update public.reports
  set confirm_count = confirmation_total
  where id = target_report_id;
end;
$$;

create or replace function public.handle_report_confirmation_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_report_confirmation_state(coalesce(new.report_id, old.report_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists report_confirmations_after_insert on public.report_confirmations;
create trigger report_confirmations_after_insert
after insert on public.report_confirmations
for each row
execute function public.handle_report_confirmation_change();

drop trigger if exists report_confirmations_after_delete on public.report_confirmations;
create trigger report_confirmations_after_delete
after delete on public.report_confirmations
for each row
execute function public.handle_report_confirmation_change();

alter table public.report_confirmations enable row level security;

drop policy if exists "No public writes to report_confirmations" on public.report_confirmations;
create policy "No public writes to report_confirmations"
on public.report_confirmations
for all
to anon, authenticated
using (false)
with check (false);
