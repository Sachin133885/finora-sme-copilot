# Finora Render and Supabase migration candidate

Topic E SME Finance Copilot. This candidate adds verified Supabase login and persistent role-controlled workspaces to the complete existing app. It is prepared for Render Free, with an optional Vercel static frontend after the backend is verified.

**Start with [the setup guide](docs/RENDER_SETUP.md).** The SQL file is `supabase/finora.sql`. Render build: `npm install --omit=dev --package-lock=false && npm run build`. Render start: `npm start`. Enter actual Supabase keys only in Render Environment settings. No runtime secrets are in this repository.

This source has passed 30 local regression suites and isolated PostgreSQL-compatible SQL integration tests. It has not been deployed to Render/Vercel or connected to the user's actual Supabase Auth/database/provider during preparation. It does not automatically transfer the original Site's accounts or records. Keep the original app and backups until migration is verified.

The financial engine, receipt logic, rescue algorithm and tour modules are unchanged. English/Chinese UI and all existing workspaces remain. Login uses Supabase on this deployment; the original Site retains its own sign-in system. Authentication, data-store and hosting sections below are historical baseline documentation and are superseded by the setup guide for this candidate.

## Original Site baseline documentation

# Finora — SME Finance Copilot

**2026 Shenzhen International FinTech Competition · Topic E**

Finora helps SME owners record money, review receipts, reconcile entries, understand cash pressure and compare possible responses. It supports English and Simplified Chinese, a mobile-first interface, Light/Dark/System appearance, and reviewed financial actions.

**Working public application:** https://finora-sme-copilot.bravehare4.chatgpt.site/

Prepared on 18 October 2026 from deployed-source commit `522435c6b9b48fdc3f6b5622a2eb02b4b8993f7a` (Site version 10). Submission documentation, an ignore file and a test workflow were added separately. Application source is unchanged. See `SUBMISSION.json` and `SHA256SUMS.txt` for provenance and integrity.

## Run a local demonstration

Install **Node.js 24**. No npm installation is needed: the app uses browser APIs, Node built-ins and vendored PDF.js assets.

Unzip the submission, open a terminal in `Finora-Source`, then run:

```sh
node scripts/compile.mjs
node scripts/local.mjs
```

Open **http://localhost:3000/**. Stop with Ctrl+C. Keep this development server local; it is not a production authentication gateway.

Local mode demonstrates browser-local synthetic records, manual/PDF entry, forecasting, planning, bilingual UI and guided tours. It does not reproduce hosted ChatGPT sign-in or the D1 cloud binding. Keep AI credentials unset for the local demonstration; calculation-based responses remain available. The fixed synthetic reporting date is **2026-10-13**, not a live bank date.

`.env.example` documents optional server settings. These scripts do not automatically load a `.env` file. Never put actual keys into source or browser code.

## Build and test

Run these commands in order:

```sh
node scripts/compile.mjs
node scripts/standalone.mjs
node scripts/test.mjs
node scripts/validate-artifact.mjs
```

The suites cover financial arithmetic, invoice settlement, accounts/permissions, cloud conflicts, imports, PDF extraction/posting, planning, AI fallback/activation, appearance, typography, navigation and onboarding. PDF fixture tests run the actual PDF.js extractor on all ten sample receipts.

Automated DOM harnesses are not real browser/mobile visual tests. Mock AI providers are not proof of a live connection. See `docs/VERIFICATION.md` for this package's results.

## Main workflows

| Workspace | Purpose |
| --- | --- |
| Home | Recorded cash, reporting snapshot, safe-to-spend and upcoming pressure |
| Record | Money received/spent and transaction history |
| Forecast | Projected daily cash and reviewed scenario assumptions |
| Assistant | Financial questions, calculated evidence and optional consented live AI |
| More | Documents, payments, planning, reports, business and account tools |

More exposes PDF receipts, statement imports, invoice evidence, reconciliation, invoices/bills, collections, recurring expenses, financing, Cash Rescue Planner, action plans, weekly priorities, options comparison, AI setup, reports, forecast confidence/evidence, Decision Receipts, risk, business setup, accounts and Settings & Data. Actions depend on permissions.

### PDF receipts

Use the receipt upload entry point in Record or More. Select a supported text-based PDF, inspect/edit extracted fields and source evidence, confirm payment occurred, then approve posting. Uploading alone does not change cash. Duplicate receipt identities or matching transaction details are blocked. Linked invoices use settlement logic so money is not counted twice.

Ten selectable-text synthetic receipt PDFs and expected results are in `tests/fixtures/receipts/`. Read its `README.txt` before posting. They use business ID `shenzhen` and dates compatible with the fixed reporting snapshot. Receipt 01 references `INV-1042`; it is valid only if the current invoice still matches and has sufficient outstanding balance. Image-only PDFs need manual entry. Extraction is not official fapiao/authenticity verification.

### Forecast and safe-to-spend

Amounts are integer fen internally. The planning estimate is:

```text
max(0, min(recorded cash, lowest 30-day forecast cash - emergency buffer))
```

The buffer is cash the owner wants to preserve, not a posted expense. Forecasts include the opening point, expected collections, scheduled obligations and daily averages. They are estimates, not guarantees. Avoid entering the same obligation as both a bill and recurring cost.

### Rescue planning and evidence

The rescue planner evaluates a bounded set of collection portions, supplier delays and hypothetical borrowing amounts. It shows evaluated/feasible counts, costs and a seven-day late-collections stress test. A selected plan does not send messages, change invoices, pay bills or obtain a loan. Saving a Decision Receipt retains an explicitly confirmed planning snapshot without changing cash. It is not an immutable audit or lender decision.

## Architecture and source map

| Path | Role |
| --- | --- |
| `src/index.html`, `src/app.js` | UI shell, semantic design tokens, workflows and state |
| `src/engine.js`, `src/mobile-engine.js` | Integer-fen ledger, forecasts, safe-to-spend and imports |
| `src/pdf-receipts.js`, `src/vendor/` | Browser PDF extraction, review validation and posting |
| `src/rescue.js`, `src/readiness.js` | Rescue comparison, evidence and planning support |
| `src/business-ai.js` | Validated read-only financial tools and optional provider explanations |
| `src/server.js`, `src/cloud-accounts.js` | Worker HTTP routes, hosted identity and D1 authorization |
| `src/tour.js`, `src/typography.js`, `src/theme-init.js` | Bilingual tours, font handling and appearance |
| `src/fonts/` | Subsetted local fonts and third-party licenses |
| `drizzle/` | Schema-only D1 migrations; no production database dump |
| `scripts/`, `tests/` | Build, local development, regression tests and synthetic fixtures |
| `dist/server/index.js`, `worker/index.js` | Generated Worker artifacts; regenerate from `src/` |
| `Finora-mobile.html` | Generated offline demonstration, not a cloud client |
| `reference-briefs/`, `Finora-updated.html` | Historical references, not the current entry point |

## Hosting, accounts and AI

The public app runs as a Worker with D1 binding `DB` and a platform-managed identity gateway. Guest data stays in the browser. Signing in and explicitly opening cloud workspaces accesses owner-isolated records. Owners manage accountant/viewer grants; server routes enforce permissions and reject stale-revision writes.

Live AI uses server-only `LLM_API_KEY`, `LLM_ENDPOINT` and `LLM_MODEL`, authenticated access and explicit consent. Native Gemini `generateContent` and compatible Chat Completions are supported. The code computes amounts; the provider explains reviewed context. Failures return a labeled calculation-based fallback. Never publish keys or include private document contents in questions.

**GitHub hosts the source; the existing Site hosts the full app.** GitHub Pages is static hosting and cannot directly run this Worker/D1/identity backend. Migration requires secure identity adaptation, data migration, runtime secrets and full regression testing. Never trust visitor-supplied identity headers on a replacement public host. See `docs/DEPLOYMENT.md`.

The optional `scripts/serve.mjs` / `src/accounts.mjs` SQLite/password server is retained as development code. It is a different account store, does not migrate hosted D1 accounts, and has not been certified as a production/live-AI replacement. Use the public app to evaluate current cloud and live-AI behavior.

## Submission and GitHub publication

See `docs/GITHUB-HANDOFF.md` for source upload. Intended owner: **sachin133885**. No GitHub repository link is claimed until creation and upload are verified.

Never upload `.env`, runtime credentials, database files, private backups or Git metadata. This archive contains code, synthetic fixtures, schema and generated artifacts, not existing users' records or hosted secrets.

## Limits and licensing

No real bank integration, payments, loan applications, automatic messaging, general OCR, official fapiao verification or guaranteed forecasts. The current snapshot is synthetic and fixed; change reporting policy deliberately before using current real records. Decision Receipt retention is bounded; export important evidence.

No new open-source license is declared for team-owned code. Publishing on GitHub does not itself grant an open-source license. Retain PDF.js and font notices in `src/vendor/` and `src/fonts/`.

Earlier implementation notes are preserved in `docs/development-history.md`. This README and current source take precedence over superseded descriptions there.
