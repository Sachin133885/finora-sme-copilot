# Finora free hosting migration

Goal: run the existing Finora application on Render Free with persistent Supabase workspaces and verified Supabase email/password identity. Keep the current Site, source calculations, bilingual UI, receipt review, reconciliation, planner and tours intact. Do not transfer/reset production data automatically. The user selected free hosting and created project rrbzfaznyytijabupxkv.

Use a separate Node 24 HTTP adapter around the existing compiled Worker for static assets and financial endpoints. Verify Supabase user tokens through Auth before injecting identity into the Worker; discard all incoming identity headers. Store access/refresh tokens in HttpOnly Secure same-origin cookies, protect account mutations with Origin and CSRF, and return no tokens to browser script. Refresh expired access tokens without changing the independent CSRF token.

Supabase owns authentication. Store workspace JSON, roles, revisions and audit events in a private schema with RLS and no anon/authenticated table grants. One service-only RPC enforces owner/member access, atomic revision updates and owner-only grants. Backend secrets remain in Render variables. Initialization explicitly creates missing synthetic workspaces without overwriting existing records. Browser records change workspace only after explicit user confirmation.

Keep same-origin browser API calls. Render initially serves the whole app. An optional Vercel static export uses API rewrites to Render and an exact allowed origin; no wildcard credentialed CORS. Vercel setup follows a working Render deployment.

Deliver schema SQL, a complete source ZIP and an update-only ZIP. Include precise setup instructions and limitations: no live project/database/provider test until user configuration, no automatic migration from ChatGPT identity to Supabase identity, free-tier sleep/pause limits and unchanged synthetic reporting date.

Verification: failing tests first for spoofed identity, login/confirmation, HttpOnly cookies, refresh, CSRF, permission/RPC validation, conflicts and fallback; all existing suites; SQL execution on a real isolated PostgreSQL-compatible engine if available, otherwise disclose unverified SQL and require actual Supabase execution before deployment.
