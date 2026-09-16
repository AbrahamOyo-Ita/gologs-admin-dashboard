# Initial verification report

Date: 2026-09-15

## Scope delivered

Greenfield workspace, isolated Next.js admin shell, twelve operational destinations, responsive navigation, environment validation, SSR auth boundary, secure headers, capability policy, editorial and campaign state machines, normalized initial schema, explicit grants/RLS baseline, tamper-evident audit chain, nonproduction seed, tests, CI, contracts, threat model, and runbooks.

## Known limitations

- The public Vite landing repository was absent, so its news and signup components could not be integrated or regression-tested.
- No Supabase project or Docker daemon was supplied; database tests remain to be executed against a running stack.
- Provider adapters, worker deployment, media processing, MFA enrollment, step-up authentication, full CRUD forms, E2E/browser and screenshot suites are not complete.
- Dashboard metrics intentionally remain unavailable until real consented events and aggregates exist.

## Evidence

| Check | Result |
|---|---|
| `npm run verify` | Passed: ESLint with zero warnings, TypeScript strict check, 6 Vitest tests, Next.js 16.3.3 production build |
| `npm audit --audit-level=high` | Passed: 0 vulnerabilities |
| Browser load and route navigation | Passed: overview and news routes returned meaningful content; no Next.js error overlay or browser errors |
| Responsive interaction | Passed at 390 × 844: mobile drawer, Escape close, command search dialog, and route links |
| Automated accessibility | Passed: axe-core 4.12.1, WCAG 2 A/AA, 0 violations and 0 incomplete checks on `/news` |
| Database migration / pgTAP | Not run: Docker executable is not installed in this environment |

Visual evidence: `admin-desktop.png` and `admin-mobile.png` in this directory. The screenshots use honest disconnected states and contain no fabricated dashboard metrics.

## Route and visual follow-up

After a clean dev-server restart, direct requests to `/`, `/analytics`, `/content`, `/news`, `/newsletters`, `/subscribers`, `/media`, `/team`, `/audit`, `/integrations`, `/health`, `/settings`, `/docs/metrics`, and `/login` each returned HTTP 200. The earlier 505 report was reproduced as a stale/orphaned Next dev process holding port 3000 while another process attempted to start; stopping the exact stale process resolved the collision. The refreshed visual pass is `admin-modern-desktop.png`.

The auth boundary now rejects copied Supabase placeholders and redirects provider failures to the setup/sign-in screen instead of surfacing an internal server error. A clean browser click-through from Overview → Analytics → News also completed successfully.

The overview follow-up removed the unrelated finance fixture entirely. `go-overview-clean.png` verifies that finance labels and values are absent while GO audience/service empty charts are present. When `daily_aggregates` rows exist for the signed-in workspace, the same server-rendered cards and charts use those rows on the next request; there is no fallback dataset.
