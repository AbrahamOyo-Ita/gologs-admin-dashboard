# GO Admin Platform

A security-first Next.js administration application backed by Supabase Postgres, Auth, RLS, and Storage contracts. This workspace began greenfield because the referenced public Vite repository was not present; see [ADR 0001](docs/decisions/0001-greenfield-admin-boundary.md).

## Local development

Requirements: Node.js 24, npm 11, Docker Desktop for the local Supabase stack.

```bash
npm install
copy apps\admin\.env.example apps\admin\.env.local
npx supabase start
npx supabase db reset
npm run dev
```

Copy the local URL and publishable key printed by `supabase status` into `apps/admin/.env.local`, or copy the hosted project URL and keys from Supabase Dashboard → Project Settings → API. The three values you need are `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the server-only `SUPABASE_SECRET_KEY`. Never use a service-role or secret key in a `NEXT_PUBLIC_` variable. Seed data is explicitly nonproduction and contains no real people.

## Verification

```bash
npm run verify
npx supabase test db
npm audit --audit-level=high
```

The database commands require Docker. Before a production deployment, configure the admin origin, MFA policy, rate-limit provider, email sandbox/production credentials, monitoring, backups, and object-storage policies. Apply migrations before deploying the application.

## Repository map

- `apps/admin`: isolated protected admin application
- `supabase/migrations`: versioned source-of-truth schema
- `supabase/tests`: pgTAP database and RLS checks
- `docs/architecture`: system boundaries and deployment model
- `docs/security`: threat model and RBAC matrix
- `docs/contracts`: public/admin/webhook contracts
- `docs/runbooks`: recovery and incident procedures
