# Repository refresh verification — 19 October 2026

## Input and scope

Source: team-uploaded `Finora_Vermilion_Source_Final(2).zip`, package version 1.2.0. Runtime implementation, SQL, existing tests and configuration were retained. Documentation, a copied existing branding asset and integrity/provenance files were added/refreshed. Earlier README is retained as `README_BEFORE_REPOSITORY_REFRESH.md`.

## Commands observed

- `npm install --include=dev --package-lock=false`: succeeded.
- `npm run build`: succeeded; current compiled Worker is 13,661,693 bytes.
- `node scripts/standalone.mjs`: succeeded.
- `node scripts/dragon-demo.mjs`: succeeded.
- `npm test`: **33/33 suites passed**. DOM checks are simulated, not browser layout evidence.
- `node scripts/validate-artifact.mjs`: valid ESM default.fetch. Root/supporting documentation links and README anchors passed. Ninety runtime/test/script/SQL/config files matched the uploaded source byte for byte. The documented credential-free local server returned HTTP 200 and served Finora; its status reports legacy chatgpt identity rather than Supabase, as documented. No authenticated cloud/provider call was made.

## Screenshots and production

No Chromium binary was installed; downloading one returned invalid/truncated archives. Final screenshots and real browser/mobile visual review remain outstanding. The existing dragon graphic is decorative artwork, not a screenshot.

The connected GitHub account is Shimanto23. The target repository reported pull=true, push=false during preparation. No target branch was changed, no GitHub Actions success is inferred, and this exact source was not deployed by this documentation update. The repository owner must grant write access or upload the prepared files while preserving existing history. Existing Render/Supabase secrets are not in the package.

The live Render URL is retained as the application entry point, not proof that this final 1.2 release is live. Fresh live AI, actual email recovery, independent deployed roles/cross-device durability, load testing and an external security audit remain unverified.

## Privacy

The registration workbook is read-only input and is excluded. Public team documentation includes names/roles/institution/study area only. It excludes personal identity numbers, student IDs, phone numbers, ages and individual emails. No new collaborator invitation is sent by publishing a team roster.
