# Operations runbooks

## Backup and restore

1. Confirm managed daily backups and point-in-time recovery are enabled for the production tier.
2. Export migration history and encrypted configuration inventory separately; object storage is not included in database backups.
3. Restore into an isolated project, rotate all provider and database secrets, then apply migrations in order.
4. Run RLS, integrity, audit-chain, media-reference, and recipient-idempotency checks before switching traffic.
5. Record the exercise as a high-risk audit event. Perform a restore exercise quarterly.

## Incident response

Contain by revoking affected sessions/tokens and pausing campaign workers. Preserve immutable logs and request IDs. Classify affected workspaces/data, notify the incident lead and legal owner, eradicate the cause, restore from a known-good state, then publish a timeline and remediation record. Never delete audit evidence during containment.

## Email provider failure

Pause claim of new send jobs; do not reset recipient states. Inspect provider status and webhook lag. Resume using existing idempotency keys after recovery. If switching providers, reconcile accepted provider message IDs and exclude all accepted/suppressed recipients before enqueueing replacements.

## Key rotation

Create a replacement with equal or narrower scope, deploy it server-side, verify health, revoke the old key, and inspect last-used timestamps. Webhook signing secrets use a short dual-secret overlap. Never place secret values in tickets, commits, logs, or audit `changes`.
