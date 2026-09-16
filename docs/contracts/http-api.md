# HTTP API contracts

All responses include `x-request-id`. Errors use `{ "error": { "code": string, "message": string } }` and never expose stack traces.

## Published news

`GET /api/public/v1/news?cursor=<opaque>&limit=12`

Returns only `published` articles whose `published_at` is not in the future. Maximum limit is 50. The response is `{ items, nextCursor, generatedAt }`; each item contains id, slug, title, excerpt, sanitized structured body, approved media URLs, category, tags, and publication time. Responses use safe shared caching and ETags.

## Subscribe

`POST /api/public/v1/subscriptions`

Body: `{ email, consent: true, policyVersion, source, acquisition? }`. The command normalizes the address, applies rate and bot controls, creates or reuses a pending subscriber idempotently, records consent, and returns the same `202` generic response for existing and new addresses.

## Admin commands

Admin mutations are same-origin server actions or `/api/admin/v1/*` handlers. Each command requires a verified session, workspace, granular capability, Zod contract, origin check, idempotency key where applicable, and transactional audit event.

## Provider webhooks

`POST /api/webhooks/v1/email/:endpointToken`

Verify the raw-body signature and timestamp before JSON parsing. Store the unique provider event ID, reject replays, acknowledge accepted events quickly, and normalize asynchronously. Secret rotation supports current and previous secret during a bounded overlap.
## Public newsletter subscription

`POST https://admin.<domain>/api/public/newsletter` accepts `{ email, consent: true, source?, policyVersion? }`. The public landing form must call this endpoint and only show success after a `200` response. It returns generic errors and persists an idempotent pending subscriber plus consent event.
