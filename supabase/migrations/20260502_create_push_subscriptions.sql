-- Web Push subscriptions + broadcast log
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists push_subscriptions_created_at_idx
  on public.push_subscriptions (created_at desc);

create table if not exists public.push_notifications_log (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  url text,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  total_count integer not null default 0,
  sent_by text,
  created_at timestamptz not null default now()
);

create index if not exists push_notifications_log_created_at_idx
  on public.push_notifications_log (created_at desc);

alter table public.push_subscriptions enable row level security;
alter table public.push_notifications_log enable row level security;

drop policy if exists "No public access to push_subscriptions" on public.push_subscriptions;
create policy "No public access to push_subscriptions"
  on public.push_subscriptions
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "No public access to push_notifications_log" on public.push_notifications_log;
create policy "No public access to push_notifications_log"
  on public.push_notifications_log
  for all
  to anon, authenticated
  using (false)
  with check (false);
