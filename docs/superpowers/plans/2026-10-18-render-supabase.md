# Finora Render and Supabase Implementation Plan

Goal: preserve all app workflows while adding a separately deployable Node 24 adapter and durable free-tier workspaces.

Spec: docs/superpowers/specs/2026-10-18-render-supabase.md.

Architecture: Supabase verifies users, the Node adapter protects cookies and API calls, and a service-only private-schema RPC enforces workspace access/revisions. Financial/static responses reuse the current Worker.

1. Add tests/render-adapter.mjs. Assert spoofed headers are ignored, Origin/CSRF denial, registration confirmation, token cookie protection/refresh, valid workspace posting and 409 mapping. Run before implementation and observe missing adapter failure.
2. Implement src/render-adapter.mjs and scripts/render-server.mjs. Stream-limit bodies, require explicit HTTPS production origin, redact provider errors and preserve strict headers. Add service-only supabase/finora.sql with initialization, grants and conditional saves.
3. Integrate identityMode supabase into existing account flow. Preserve guest data on login, require explicit cloud opening, localize messages and direct AI sign-in links to Account. Add a DOM test for pending confirmation and cloud-open behavior.
4. Add static export and optional Vercel configuration helper, package.json and pinned PDF test dependency installation. Do not include any runtime secrets or change Site identity.
5. Compile, run all suites, validate artifacts, exercise actual Node HTTP adapter and compare financial modules to baseline. Package schema and changed/full source with README. Disclose tests using provider/RPC doubles and any unverified live deployment.

Review focus: stale permissions, expired tokens during save, missing configuration, browser-origin mismatch and identity changes preserving guest records. No deployment or existing-data mutation occurs before actual service configuration.
