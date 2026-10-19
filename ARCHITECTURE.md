# Architecture and financial boundaries

## Current Render path

`scripts/compile.mjs` compiles the shared Worker/API core and browser assets into `dist/server/index.js`. `scripts/render-server.mjs` loads that core and wraps it using `src/render-adapter.mjs`. Node 24 serves the UI and adapter endpoints from one origin. `npm start` is this Render path, not the legacy SQLite server.

The adapter validates HTTPS/exact origins, JSON request type and body size, verifies Supabase identities, uses protected access/refresh/CSRF cookies and calls the service-only PostgreSQL `finora_workspace` RPC. Private tables hold businesses, memberships and events; UUID membership avoids using email alone as authority. Revision conflicts prevent silent overwrites. No runtime credentials are in the frontend.

`supabase/finora.sql` owns private workspace storage. Existing Sites/D1 migration files and `.openai/hosting.json` are retained legacy provenance, not Render storage configuration. Updating the UI/docs does not initialize, import or reset cloud workspaces.

## Financial engine

Money is stored as integer fen. Validation rejects unsupported currency, malformed critical fields, invalid dates/amounts and incompatible records. Forecasting combines opening cash, expected collections, supplier obligations, recurring costs and scenario assumptions. Opening-day inclusion can make the minimum equal current cash without being a bug.

Additional safe-to-spend = max(0, min(current recorded cash, lowest projected cash − emergency buffer)). A buffer is a planning constraint, not a transaction. Negative forecast lows represent projected shortfalls. Scenario sliders/presets and rescue comparisons do not mutate actual payment records.

Cash Rescue Planner ranks a bounded candidate grid. Its selected response is not a globally optimal proof, supplier agreement, successful collection, loan offer or automatic financial action. Decision Receipts retain a planning snapshot and evidence; stale evidence must be reviewed.

## Document workflow

Receipt PDF → local PDF.js text extraction → labeled field parsing → editable preview/source evidence → validation → payment status and posting confirmation → existing ledger/settlement path. Image-only PDFs need manual entry; this path is not general OCR or official fapiao verification. Duplicate and cross-business checks remain separate from extraction. A linked settlement updates cash and outstanding balance once through the existing logic.

## AI boundary

`business-ai.js` exposes allowed read-only analysis topics. A configured HTTPS Chat Completions-compatible provider may select an analysis topic and explain calculated results. The engine validates amounts/assumptions and computes the figures. Live use requires authentication and explicit consent; question/history/reviewed assumptions/calculated context may go to that provider. Credentials remain server-side. No fine-tuning or measured answer-accuracy claim is made.

Known source caveat: some retained fallback/help text describes older local-only behavior. Treat the actual Render adapter/account state and these current setup notes as the deployment contract; do not interpret historical strings as proof of current provider or sync status. Runtime copy is preserved in this documentation-only refresh.

## Operational limits

Tests simulate Auth/RPC services and execute SQL through PGlite. They do not independently validate production Supabase permissions, email delivery, persistence across devices, actual provider responses or availability. The repository is not a live bank integration, payment system, official document verifier or audited financial advisor.
