# GO Admin Fix Summaries

This file contains the end-of-fix summaries for the GO Admin platform. New fixes are appended newest-first so they remain easy to review outside the terminal.

## 2026-09-16 — Vercel Linux Tailwind build fix

Vercel was deploying the older commit `334d25d`, and its Linux build could not resolve Tailwind CSS Oxide’s native binding (`@tailwindcss/oxide-linux-x64-gnu`). The admin workspace now records that Linux package as an explicit optional dependency and the lockfile includes its Linux artifact. Redeploy from the latest `main` commit after pushing these changes.

Verification completed:

- `npm run build --workspace admin` passed locally.
- Lockfile contains the Linux Oxide package.
- No dependency vulnerabilities were reported by npm during lockfile generation.

## 2026-09-16 — Production Resend webhook receiver

Implemented and pushed in commit `da36610`.

Supported Resend events:

```text
email.sent
email.delivered
email.delivery_delayed
email.bounced
email.complained
email.opened
email.clicked
```

The receiver verifies Svix/Resend signatures against the raw request body, rejects stale requests, protects the endpoint with a secret token, validates payloads, stores provider events idempotently, and queues normalization work. Resend retries failed webhook requests and uses at-least-once delivery, so duplicate event IDs are acknowledged safely without creating duplicate records.

Production endpoint format:

```text
https://admin.gologs.com.ng/api/webhooks/v1/email/<EMAIL_WEBHOOK_ENDPOINT_TOKEN>
```

References:

- [Resend webhook documentation](https://resend.com/docs/webhooks/introduction)
- [Svix webhook verification guidance](https://docs.svix.com/receiving/verifying-payloads/how)

Verification completed:

- TypeScript typecheck passed.
- 9 automated tests passed.
- Production build passed.
- Changes pushed to GitHub.
