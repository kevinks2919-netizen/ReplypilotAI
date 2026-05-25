create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  profile_type text not null check (profile_type in ('creator', 'agency')),
  biggest_pain_point text not null,
  plan_interest text not null default 'beta',
  source text not null default 'replypilot_landing',
  status text not null default 'waitlisted',
  created_at timestamptz not null default now()
);

create table if not exists public.trial_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null,
  reply_limit integer not null default 20,
  replies_used integer not null default 0,
  plan_status text not null default 'trial' check (plan_status in ('trial', 'active', 'expired')),
  created_at timestamptz not null default now()
);

create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_account_id uuid not null references public.trial_accounts(id) on delete cascade,
  provider text not null check (provider in ('gmail')),
  provider_email text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scopes text not null,
  status text not null default 'connected' check (status in ('connected', 'needs_reauth')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_account_id, provider)
);

create table if not exists public.auto_reply_approvals (
  id uuid primary key default gen_random_uuid(),
  owner_account_id uuid not null references public.trial_accounts(id) on delete cascade,
  provider text not null check (provider in ('gmail', 'tiktok')),
  sender_identifier text not null,
  sender_label text not null,
  status text not null default 'approved' check (status in ('approved', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_account_id, provider, sender_identifier)
);

create table if not exists public.tiktok_connection_requests (
  id uuid primary key default gen_random_uuid(),
  owner_account_id uuid not null references public.trial_accounts(id) on delete cascade,
  tiktok_handle text not null,
  account_type text not null check (account_type in ('creator', 'agency', 'brand')),
  requested_capability text not null default 'dm_review' check (requested_capability in ('dm_review')),
  status text not null default 'requested' check (status in ('requested', 'approved', 'blocked')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_account_id, tiktok_handle)
);
