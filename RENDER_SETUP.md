> Historical preparation record. For the current 1.2 source and repository refresh, see [SETUP.md](SETUP.md), [REPOSITORY_VERIFICATION.md](REPOSITORY_VERIFICATION.md), and the root README. Earlier pending-deployment, test-count and missing-password-reset statements below may be superseded.

# Finora Render and Supabase setup

This is a tested migration candidate, not a verified live deployment. It preserves the app workflows and leaves the existing public Site untouched. Use free plans within their limits. Do not enter secret values into chat, GitHub files or a screenshot.

## 1 Set up the database

Project dashboard: https://supabase.com/dashboard/project/rrbzfaznyytijabupxkv

Standard API origin: https://rrbzfaznyytijabupxkv.supabase.co

Open SQL Editor, create a New query, paste the entire contents of `supabase/finora.sql`, then click Run. The script adds a private schema and a service-only RPC. It does not seed records yet or import/delete existing Site data. Running it again does not replace existing workspaces. Keep the private schema private; do not add public table policies or grant browser access.

Expected outcome is successful execution. To inspect it in SQL Editor:

```sql
select schema_name from information_schema.schemata
where schema_name = 'finora_private';
```

The default public table list may remain empty; the business tables are intentionally in `finora_private`. Do not switch off row-level security to make them appear publicly.

## 2 Upload the migration code

Use `Finora_Render_Update.zip` to overwrite only the changed/new files in the existing GitHub repository, preserving their paths. It includes no real credentials. The complete ZIP is an alternative full source export; do not upload either ZIP as a single repository file. Hidden `.github/` and `.env.render.example` items may need explicit creation through GitHub's web editor.

The update adds `src/render-adapter.mjs`, `scripts/render-server.mjs`, `supabase/finora.sql`, `package.json`, setup helpers/tests and an account-flow adaptation. Generated Worker/offline output is rebuilt. The old `.openai/hosting.json` remains only for reproducible legacy compilation; it does not connect Render to the existing Site database.

Wait for GitHub tests to pass. The prepared version passes 30 suites locally. A GitHub run of the older source does not verify this migration.

## 3 Configure Render

Use the connected `Sachin133885/finora-sme-copilot` repository:

| Field | Value |
| --- | --- |
| Service name | finora-sme-copilot |
| Language | Node |
| Branch | main |
| Root directory | leave blank |
| Build command | npm install --omit=dev --package-lock=false && npm run build |
| Start command | npm start |
| Instance | Free |
| Health check path | /healthz |

`package.json` requests Node 24.x. No local persistent disk is used. Render supplies `PORT` and the service URL (`RENDER_EXTERNAL_URL`); the server binds to `0.0.0.0`.

In Render Environment, add these values privately:

| Name | Value to enter |
| --- | --- |
| SUPABASE_URL | https://rrbzfaznyytijabupxkv.supabase.co |
| SUPABASE_PUBLISHABLE_KEY | the project's publishable key from Supabase Settings > API Keys |
| SUPABASE_SECRET_KEY | the server-only secret key from the same project |

Modern publishable and secret key names are preferred. The backend also accepts a legacy anon key as the publishable value and a legacy service-role JWT as the secret value. Do not use a database password in either key field. Secret keys bypass browser-level database restrictions; keep them only on the server.

Do not set `FINORA_LOCAL=1` on Render. `APP_ORIGIN` can be omitted when Render supplies `RENDER_EXTERNAL_URL`; if explicitly set it must match the exact HTTPS app origin, with no path. Keep `FRONTEND_ORIGIN` unset until a real Vercel origin exists.

After these entries and the updated code are present, create/deploy the service. Verify `/healthz`, `/api/status` and the actual UI before calling the deployment complete. `accounts: true` and `mode: configured` describe configuration, not a completed live login or provider test.

## 4 Configure authentication and demo users

In Supabase Authentication, keep email/password sign-in enabled and require email confirmation. After Render supplies the final app URL, set Supabase's Auth Site URL to that HTTPS origin. Confirm your email, then return to Finora and sign in. The app intentionally does not trust tokens in URL fragments; confirmation may be completed separately and followed by normal sign-in.

Supabase's default SMTP service is limited to project-team email addresses and a small quota. For an immediate controlled competition demo, create verified test users through the Supabase Auth dashboard using its supported admin workflow, or use your verified team email. Never claim public signup is working until a real confirmation flow succeeds. Configure suitable SMTP before inviting arbitrary public users. Password reset UI is not included in this migration; owner-assisted Auth dashboard recovery remains a setup limitation.

After signing in, Finora retains the active browser records. Export a backup before selecting Open my cloud workspaces. That explicit step creates only missing isolated synthetic workspaces and loads existing cloud records without replacing them. An owner can grant access to another already verified account. No invitation or reminder message is sent by Finora's membership/collections workflow.

ChatGPT identities and Supabase identities are different. Existing Site D1 records do not automatically transfer. Keep the original Site available, export authorized business backups, and explicitly review/import each one into the intended new owner/workspace. Never paste another owner's backup into an unreviewed workspace. Verify balances, invoices, roles and revisions after migration.

## 5 Optional live AI

Set `LLM_API_KEY`, `LLM_ENDPOINT` and `LLM_MODEL` privately in Render. Existing Site secrets are not included in this package or copied automatically. Use a provider/tool-capable model supported by the existing adapter. Sign in, explicitly enable live AI and test an actual response.

Without provider settings the app offers labeled calculation-based responses. Hosting on free plans does not guarantee free AI provider calls; provider quotas/billing are independent. No actual live provider call was verified while preparing this package.

## 6 Verify before recording or submission

Test a supported PDF review/post, duplicate blocking, linked invoice settlement, safe-to-spend recalculation, forecasting, rescue comparison and Decision Receipt saving. Check English/Chinese, appearance, tours and mobile layout. Test owner, accountant and viewer using separate real accounts. Test two-device stale revisions and recovery. Revisit after a Render restart to verify persistence in your actual Supabase project.

The developer checks are 30 local suites, an actual local Node HTTP test and SQL execution on PGlite with a simulated Auth schema. They are not actual Supabase, Render, Vercel, real browser/mobile or provider verification. Hosted environment problems must be resolved before replacing submission URLs/evidence. Parts 1-6 still describe the original Site until the new live deployment is verified and the submission documents are updated.

## 7 Add Vercel only after Render works

Render can serve the complete application itself. If a Vercel frontend is still desired, use the same source and export its static files:

```sh
node scripts/configure-vercel.mjs https://YOUR-VERIFIED-SERVICE.onrender.com
```

This writes `vercel.json` with `node scripts/export-web.mjs` as build command, `public` as output and a same-origin `/api/` rewrite to Render. The example placeholder is not a deployed service. Commit the generated file, import the repository into Vercel using the owner's authorized GitHub connection, then obtain the actual production URL. Enter that exact HTTPS origin in Render `FRONTEND_ORIGIN` and redeploy Render.

The browser continues to call its own `/api/` origin through the rewrite; no wildcard credentialed CORS or tokens in localStorage are introduced. Render and Vercel cookies belong to different browser origins, so sign in separately and verify login/refresh/CSRF/sync on the final frontend URL. Preview URLs are not automatically allowlisted. Set the Auth Site URL to the chosen final public frontend. Do not claim Vercel behavior is verified before testing the actual rewrite and cookies.

## Free plan limits

Render Free services sleep after inactivity and cannot persist a local SQLite database. Supabase Free projects can pause after low activity. Keep authorized backups and test the actual app before a scheduled demo. Do not use fake keep-alive traffic or assume uninterrupted production availability.

Official references checked 18 October 2026:
- https://render.com/docs/free
- https://render.com/docs/web-services
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/database/functions
- https://vercel.com/docs/rewrites
