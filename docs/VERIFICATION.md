# Migration verification — 18 October 2026

The Render/Supabase candidate passed 30/30 local suites, compiled Worker validation, local Node HTTP checks, static export, and actual PGlite SQL execution with simulated Supabase Auth roles/users. SQL idempotence, revision conflicts, UUID permissions, revocation and email reuse were tested. See migration-checks logs.

No real Supabase, Render, Vercel, mobile browser or live AI response has been verified for this candidate. The GitHub baseline passed its earlier 26-suite workflow; this migration has not been uploaded. No existing Site records or hosting configuration were changed.

## Historical baseline verification

# Submission verification — 18 October 2026

## Source provenance

Public Site lookup confirmed an active version 10 at https://finora-sme-copilot.bravehare4.chatgpt.site/.

Source baseline: `522435c6b9b48fdc3f6b5622a2eb02b4b8993f7a`.

All 85 tracked baseline files are included. The root README was replaced with submission instructions and its original retained as `docs/development-history.md`. All other baseline files, including regenerated Worker/offline outputs, were byte-compared with the canonical checkout and matched. The canonical checkout remains unchanged.

## Commands actually run on this packaged copy

Runtime: Node.js v24.19.0, Linux.

```text
node scripts/compile.mjs
Built Finora Worker: 7883906 bytes

node scripts/standalone.mjs
Built standalone Finora-mobile.html

node scripts/test.mjs
26/26 test suites passed. DOM checks are not browser layout checks.

node scripts/validate-artifact.mjs
Artifact is valid ESM and exports default.fetch
```

Passed suites: accounts, ai-activation, ai-upgrade, api, appearance, cloud, design-drafts, design-navigation, financial, font-serving, mobile, pdf-fixtures, pdf-receipts, readiness, rescue, safe-spend-upgrade, server, standalone, theme-tokens, tour-registry, tour, typography-layout, ui, upgrades, ux-polish and welcome.

PDF fixture verification uses the real PDF.js extraction implementation for all ten receipt PDFs, confirms expected fields, posting arithmetic and duplicate rejection, and checks linked settlement handling. The suite also covers unsupported/image-only/ambiguous input.

## Archive checks

The submission excludes Git metadata, local databases, dependency caches, runtime credentials and actual user data. A targeted scan found no credential-shaped matches for common Google/GitHub/private-key/provider-key patterns. Placeholder configuration and synthetic test secrets remain intentionally. This scan is not a security audit.

`SHA256SUMS.txt` hashes every payload file except itself. The ZIP was reopened, its entry CRCs tested, and every extracted payload checked against the manifest before delivery.

## Limits

- DOM tests use simulated browser elements/geometry; no real browser/mobile visual check was performed in this task.
- No new authenticated live Gemini response was verified.
- No external security audit or production load test was performed.
- The included Actions workflow has not run on GitHub.
- No GitHub repository was created or uploaded: the connected account was Shimanto23, while the requested owner is sachin133885. A target repository with authorized write access is still needed.
- No redeployment or migration was performed. Production data, permissions, Site identity, audience and runtime settings were left unchanged.

The source/readme deliverable is complete; the repository link remains pending account/repository access.
