-- Admin email OTP login support. These tables are intentionally server-only;
-- the browser never receives allowlist or OTP records.
create table public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint admin_emails_lowercase check (email = lower(email))
);

create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null references public.admin_emails(email) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0 and attempts <= 5),
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);

create index otp_codes_email_created_idx on public.otp_codes(email, created_at desc);
create index otp_codes_expiry_idx on public.otp_codes(expires_at) where consumed = false;

alter table public.admin_emails enable row level security;
alter table public.otp_codes enable row level security;
revoke all on public.admin_emails from anon, authenticated;
revoke all on public.otp_codes from anon, authenticated;

-- Only the server-side secret-key client can access these relations.
grant all on public.admin_emails, public.otp_codes to service_role;
