# Architecture overview

## Runtime boundaries

```text
Staff browser -> admin protected origin -> Next.js server -> caller-scoped Supabase client -> Postgres + RLS
                                             |            -> server-only adapters -> email/storage
Public site  -> versioned public endpoints -> published read model / subscription command
Scheduler    -> idempotent job worker      -> background_jobs -> provider adapters
Provider     -> signed webhook endpoint    -> replay store -> normalized delivery events
```

`apps/admin` uses React Server Components by default. Client components are limited to navigation, dialogs, and form interaction. Supabase Auth sessions use secure cookies; the proxy refreshes claims before protected routes. Authorization is expressed as capabilities in one policy module and mirrored by database permissions/RLS. Secret keys are server-only.

PostgreSQL is the source of truth. The first migration normalizes identity, editorial, media, audience, campaign, analytics, audit, integration, and operations domains. JSONB is restricted to versioned editor blocks, events, rule definitions, and provider payloads.

## Trust boundaries

- Browser inputs are untrusted and validated with Zod.
- Rich content is structured JSON, never arbitrary HTML.
- Public reads expose only published articles.
- Public subscription commands are server-only and must return a generic response.
- Provider webhooks require signatures, unique provider event IDs, and replay rejection.
- Audit events are append-only and chained by SHA-256 hashes per workspace.
- Production email requires three independent conditions: production runtime, explicit enablement, and a real provider.

## Deployment

Deploy `apps/admin` to a separate protected origin. Use Node.js 24 LTS-compatible runtime. Apply migrations before the application deployment, then validate RLS and job health. Do not expose `SUPABASE_SECRET_KEY` to `NEXT_PUBLIC_*` variables.
