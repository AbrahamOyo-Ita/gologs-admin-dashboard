# Threat model and controls

Scope covers the admin origin, auth session, Data API, public content/subscription endpoints, media, jobs, email, exports, and provider webhooks.

| Threat | Primary controls | Verification |
|---|---|---|
| Broken access control / privilege escalation | deny-by-default capabilities, server assertions, explicit grants, RLS, step-up design for high-risk commands | negative role tests and RLS tests |
| Cross-workspace leakage | workspace foreign keys, membership predicate in RLS, scoped query contracts | two-workspace fixtures |
| Stored XSS | structured editor blocks, renderer allowlist, CSP, URL allowlist, server sanitization | sanitizer corpus |
| CSRF / confused deputy | SameSite auth cookies, origin validation on commands, no state mutation in GET | cross-origin request tests |
| Injection | parameterized Supabase client, Zod filter schemas, allowlisted sort fields | malicious filter tests |
| SSRF | no arbitrary server fetch, DNS/IP validation for future link preview and import workers | private-address corpus |
| Upload abuse | private originals, MIME sniffing, limits, image decoding, metadata stripping, malware adapter | malformed file fixtures |
| Enumeration and brute force | generic auth/subscription responses, rate limits, expiring single-use invitations | rate and response-equivalence tests |
| Session theft / staleness | secure cookie SSR, short JWT lifetime, refreshed claims, session revocation for risky operations | revoked-session E2E |
| Duplicate or suppressed sends | recipient unique key, global suppression join, campaign idempotency key, resumable jobs | retry and suppression integration tests |
| Webhook forgery / replay | signature verification before parse, unique provider event ID, timestamp tolerance | forged/replayed fixtures |
| CSV injection | formula-prefix neutralization, export ID, authorization and audit event | export unit tests |
| Secret leakage | server-only env, log redaction, CSP, no secret columns in browser queries | repository and bundle scanning |
| DoS | pagination, indexed filters, bounded exports, job queues, per-actor and per-IP rate limits | limit tests and query plans |

Residual work before production: choose a rate-limit store, configure MFA policy and step-up UX, implement malware scanning provider, complete external penetration testing, and connect error monitoring with PII redaction.
