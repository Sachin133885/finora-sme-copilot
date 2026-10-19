# Current setup and deployment

Use Node.js 24.x and npm. The repository has no lockfile; use `npm install`, not `npm ci`.

## Offline/local demo

Open `Finora-mobile.html` for a self-contained local demo. To serve the compiled UI/API core without cloud credentials:

```sh
npm install --include=dev --package-lock=false
npm run build
node scripts/local.mjs
```

Open http://localhost:3000. Browser-local synthetic data and calculated analysis are available; this is not the Supabase adapter. No cloud credentials or live AI are required. The bundled reporting date is 2026-10-13.

## Render-compatible local development

Use an authorized Supabase project and run `supabase/finora.sql` in its SQL Editor. This private schema/RPC must not be exposed through browser table policies. Do not replace existing records to test documentation.

Export the following variables privately into your shell; the scripts do not automatically load `.env`:

```sh
export SUPABASE_URL='https://YOUR_PROJECT.supabase.co'
export SUPABASE_PUBLISHABLE_KEY='YOUR_PUBLISHABLE_KEY'
export SUPABASE_SECRET_KEY='YOUR_SERVER_ONLY_SECRET_KEY'
export APP_ORIGIN='http://localhost:3000'
export FINORA_LOCAL='1'
export PORT='3000'
npm run build
npm start
```

These are placeholders. Use actual credentials only in a private development environment. Never commit shell history, secret environment files or screenshots of credentials. In PowerShell, set session variables with `$env:NAME = 'value'` instead of `export`.

`SUPABASE_URL` must be an HTTPS origin with no path/query/credentials. `APP_ORIGIN` must be an exact origin. Localhost behavior is enabled only with `FINORA_LOCAL=1`; leave it unset in production.

## Render deployment

Repository: https://github.com/Sachin133885/finora-sme-copilot
App: https://finora-sme-copilot.onrender.com

- Root directory: blank; branch: main; Node 24.
- Build: `npm install --omit=dev --package-lock=false && npm run build`.
- Start: `npm start`; health: `/healthz`.
- Keep existing Supabase/AI environment variables. Render supplies PORT and RENDER_EXTERNAL_URL. APP_ORIGIN, if set, must match the actual HTTPS service origin.
- Leave FINORA_LOCAL unset. Do not enable SQLite persistence on ephemeral free hosting.
- Upload files inside the extracted source folder, not the ZIP or an extra wrapper folder. Preserve the repository’s history and existing settings.
- Auto-deploy depends on Render configuration; otherwise choose Manual Deploy → Deploy latest commit. Check the selected commit and actual build logs before claiming the release is live.

## Supabase signup and recovery

Enable email/password and new user signup if public registration is intended. With email confirmation enabled, use suitable custom SMTP for general public users; the default sender is restricted. If the owner deliberately disables confirmation for a demo, email ownership is not verified. This documentation does not change those dashboard settings. Anonymous sign-in is not required by Finora’s email/password workflow.

The current source includes `src/password-recovery.mjs`; the older migration guide’s claim that reset UI is missing is obsolete. Configure the exact `/reset-password` redirect for the selected HTTPS app origin, following `docs/PASSWORD_RECOVERY.md`. Email delivery and a completed reset still require actual end-to-end verification.

## Optional provider

Privately set LLM_API_KEY, LLM_ENDPOINT (HTTPS Chat Completions URL) and LLM_MODEL (available tool-capable model). Sign in, enable live use with consent and verify an actual response. Configured status alone is insufficient. Provider billing/quotas are separate from hosting; do not assume a free host makes model calls free.

## Other retained paths

`scripts/serve.mjs` uses a separate SQLite account store and optional Poppler/Tesseract extraction. `.env.example` includes its variables. It is not the current production path. `scripts/configure-vercel.mjs` prepares an optional static proxy frontend; no Vercel deployment is established here. The old Sites manifest/D1 schema is preserved for provenance and compilation, not automatically migrated.
