# ADR 0001: Greenfield admin boundary

Status: accepted, 2026-09-15

The provided workspace was empty and did not contain the audited Vite landing application. With explicit authorization to proceed, this repository starts as an npm workspace containing a separate Next.js admin at `apps/admin`. The public application is not recreated because doing so would invent brand copy and risk breaking its established URLs. Public integration contracts are documented so the real landing repository can consume them later.

Consequences: admin code is isolated from any future public bundle; the landing news component and newsletter form remain an external integration task until their source is supplied; no completion claim includes the missing public app.
