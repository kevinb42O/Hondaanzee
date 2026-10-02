-- A preserved, authenticated archive. Independent dimensions are never added
-- together, and Vercel visitor counts are never summed across days.
create table public.analytics_imports (
 id uuid primary key default gen_random_uuid(),
 source text not null check (source = 'vercel'),
 imported_at timestamptz not null default now(),
 payload jsonb not null,
 payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$'),
 unique(source, payload_sha256)
);
alter table public.analytics_imports enable row level security;
revoke all on public.analytics_imports from anon, authenticated;
grant select, insert on public.analytics_imports to service_role;
