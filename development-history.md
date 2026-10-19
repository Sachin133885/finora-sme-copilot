# Finora — Topic E competition upgrade

This checkout upgrades the original app with statement reconciliation, persistent exception review, cash action plans, forecast evidence and stress tests, invoice field mismatch checks, recovered Gemini tool-calling support, and hosted ChatGPT identity with D1 workspaces.

## Cash Rescue Planner and Decision Receipt

Home → Find a cash rescue plan, or More → Cash Rescue Planner. Choose one receivable and one supplier bill, set maximum collection/deferral, action fees, cash buffer and hypothetical borrowing terms. The search evaluates an explicit bounded grid of at most one hundred loan increments, plus collection portions and supplier delay choices. It keeps payroll/recurring payments unchanged and checks every day over ninety days, including opening cash.

The planner chooses lower borrowing first, then lower known costs, then shorter supplier delay. It reports the evaluated and feasible counts; this is not a global optimum. If none meets the cash buffer, the remaining gap is shown rather than implying approval. Fees are assumptions; supplier deferral fees are conservatively paid the following day in the simulation. Full-term loan cost is shown, though cash simulation stops at ninety days.

The selected plan is stress-tested with customer collections seven days later. The page also ranks the effect of a seven-day delay to individual invoices to suggest which payment date to confirm first. These are sensitivities, not probabilities.

Save Decision Receipt requires explicit confirmation, leaves cash unchanged, and retains up to five receipts in this business, with older snapshots removed when necessary to stay below the cloud save limit. Export important receipts before they expire. JSON export contains the underlying financial records; text export summarizes constraints, evidence and alternatives. Replaying a receipt uses current records while preserving the original snapshot. The UI marks changed records; a stale result cannot be saved. A receipt is not audited, tamper-proof, a lender decision, or proof of customer/supplier agreement.

## Current hosted behavior

- Existing public Site: https://finora-sme-copilot.bravehare4.chatgpt.site
- Guest records stay browser-local. More → Account → ChatGPT sign-in → Open my cloud workspaces explicitly loads isolated synthetic cloud records. Export the guest backup first.
- Owner may grant accountant or read-only viewer access by exact ChatGPT email. No invitations are sent. Cloud writes check permissions server-side and reject stale revisions. Server audit records are separate from editable local history.
- Cloud storage is declared as D1 DB; schema-only SQL and migration journal are in drizzle/. The source packager includes these migrations.
- AI keys were NOT recovered from shared chat. Live AI remains off unless a valid LLM_API_KEY, LLM_ENDPOINT and LLM_MODEL are set as hosted server variables. Native Gemini generateContent and compatible Chat Completions are supported. Full live requests require platform sign-in plus explicit consent.
- Up to four prior questions and reviewed assumptions accompany consented AI requests. Raw ledgers and document contents are not sent to the model. Avoid private names in questions.
- Calculation fallback always labels itself. Mock provider tests do not prove a live provider works.
- No real bank/payment connections, loans, message sending, official fapiao verification or calibrated forecast probabilities. The reporting snapshot remains 2026-10-13.
- Hosted OCR/original file storage are not enabled. Use TXT/manual document fields. The included local SQLite account server retains its OCR path.
- The standalone HTML is an offline demo, not a cloud account client.

## Demonstration

1. Choose EN or 中文. Import → Download reconciliation demo CSV → choose Finora CSV and upload.
2. Confirm reviewed sale; open Reconciliation review to exclude own-account transfer and explicitly post refund. Inspect cash and the persistent pending count.
3. Home → Cash action plan → save a collection/supplier task, update status/note/deadline, inspect evidence. No balance changes until recording settlement.
4. Forecast evidence → compare expected, delayed-collection and lower-sales scenarios from identical records.
5. Account → sign in and explicitly open cloud workspace. Grant viewer access, verify server denies edits; simulate two-device revisions to see conflict handling.
6. AI setup → configure provider server-side, sign in, consent, Test live answer. Without credentials demonstrate transparent engine fallback.

## Verify

Run node scripts/compile.mjs, node scripts/standalone.mjs, all tests/*.mjs, then node scripts/validate-artifact.mjs. Browser/device visual QA is not claimed by the DOM harness.

## Original package documentation


## October 2026 receipt and guidance update

The same Site remains Topic E — SME Finance Copilot. Red/orange brand tokens are separate from success/error status. Original ledgers, permissions, D1 synchronization, reconciliations, rescue plans, Decision Receipts and server-only AI credentials are retained.

The Upload PDF receipt workspace uses vendored PDF.js 5.6.205 (Apache-2.0 license in src/vendor) in the browser, with a same-origin worker. No container Python/OCR is used by the hosted app. It supports selectable-text FINORA RECEIPT V1 documents, up to 2 MB and three pages, one English field label per line. See the sample README and receiptFields in src/pdf-receipts.js for the exact schema. Only CNY is supported; decimal values use exactly two fractional digits. Subtotal plus tax must equal total within one fen; the printed total is posted. Dates must follow the opening ledger date and not exceed the fixed reporting snapshot. Missing fields remain blank for review. Original PDFs and source text are not uploaded or retained; confirmed transaction values and receipt provenance use the existing ledger/cloud sync. Extraction is not authenticity/fapiao verification.

Posting requires editable review, explicit payment confirmation, validation and a final confirmation. It calls recordQuickEntry so linked settlements use the existing balance checks. Duplicate receipt IDs or matching date/direction/counterparty/total are blocked, including voided records; investigate before creating any manual replacement. Linked invoice direction, party and outstanding amount must match. Preview is invalidated on workspace changes; confirmation rechecks workspace, current financial state and role. Viewers can inspect PDFs but cannot post or edit the buffer.

Safe-to-spend remains max(0, min(current cash, minimum forecast cash minus reserve)), including the opening day. It is recalculated from current records with no memoized result. The breakdown describes a base 30-day estimate and the reporting snapshot, with the lowest date and relevant obligations. Buffer editing uses the existing store/sync. Forecast links reset unrelated assumptions; customer-delay testing starts with a 14-day delay. Changing the buffer is not an expense or bank deduction.

The six-step tour highlights real controls without triggering actions. Completion and skip are stored per browser/user; Help on Home and Settings restarts it. It supports both languages, Escape, keyboard focus, responsive positioning and reduced motion. A completed tour returns to its starting page.

Reproduce sample files with python scripts/sample-receipts.py (ReportLab and DejaVu Sans fonts required). The ten generated receipt PDFs in tests/fixtures/receipts are passed through the actual PDF.js extractor by tests/pdf-fixtures.mjs, then posted into synthetic ledgers and checked for duplicates and settlement double counting. Tests/tour.mjs and tests/ui.mjs are minimal DOM/event harnesses, not real browser or mobile layout tests. This environment had no supported browser automation tool, so browser/device visual QA remains unverified. Live AI is not verified; deterministic fallback and mocked provider paths are tested. Offline standalone HTML keeps existing functionality and includes welcome/tour code; structured PDF extraction requires the hosted Site.

## Welcome and comprehensive guide — 17 October 2026

The original Finora Site and Topic E remain unchanged. The new first-visit welcome uses a lightweight CSS logo/text reveal, immediate Quick Start / Guided Tour buttons and a chapter picker. English and Chinese follow the active interface language. Welcome state is remembered per browser/user after initial identity discovery; Help → Demo / Guided tour can replay it. The welcome does not interrupt an input field or an open modal. The tour uses manual progression, with no autoplay.

There are seven menu choices: a six-step quick introduction; record money and upload receipts; invoices, collections and reconciliation; forecasting and cash decisions; assistant, reports and evidence; account, settings and synchronization; and the complete app. The registry in src/tour.js currently contains 37 steps across real controls and all meaningful workspaces, including expense analysis and More navigation. Each step includes stable ID, chapter, route, target, bilingual copy, placement preference and visibility condition. Approximate duration uses 15 seconds per step; reading pace is user-controlled.

The spotlight measures live DOM targets, gently scrolls content and uses 260 ms transitions. Fixed header and bottom navigation targets are exempt from content clipping. Resize, orientation and visual viewport changes trigger repositioning; narrow/short screens use a scrollable compact card in a separate region. Missing targets show an explanation instead of triggering a control. Reduced-motion preferences disable transitions/animations and smooth scrolling. Escape exits, focus is managed and clicks/keys outside the guide cannot activate underlying financial controls.

The guide only renders routes. It does not use go() or change the URL, business, language, scenario, ledger or account. Existing app and modal nodes are temporarily retained so drafts, selected file objects, expanded panels, scroll positions and focus can be restored. Known active calculations/extractions finish before a guide can open. If background results or synchronization complete during a guide, the latest interface is rendered while the original editable forms/inputs are reattached; stale confirmations must be reviewed again. Changing account/business invalidates the retained surface for isolation.

Validation: tests/tour.mjs checks chapter controls, persistence, reduced-motion behavior, keyboard/focus, cancellation, header/mobile geometry and original-node restoration. tests/welcome.mjs exercises actual app bootstrap for first/returning visits, account context, both languages and replay. tests/ui.mjs checks every real target against the app's rendered HTML in both languages and owner/accountant/viewer views, then traverses the entire guide and verifies unchanged ledger/account/scenario, original route/hash and preserved form/modal/file drafts. It also tests late assistant/PDF UI results. These use an explicitly simulated DOM/geometry model in tests/helpers/tour-dom.mjs, not a browser rendering engine. No supported control-browser tool is available in this environment; real browser/mobile visual layout and animation have not been verified. The existing financial/API/account/planner/PDF/regression suites are also run. Runtime secrets are preserved and no new live AI claim is made.


## Appearance and clarity upgrade — 17 October 2026

The deployed Site is upgraded in place, preserving Topic E and the existing modules, ledger schema, permissions, synchronization, rescue planning, decision receipts and AI consent/integration. No source migration or data reset is required.

- **Appearance:** Settings & data → Appearance → System / Light / Dark. System is the default and responds to OS changes. The preference is saved only in `finora-appearance`, independently of cloud business settings. `src/theme-init.js` resolves the preference before CSS paints, as a same-origin script under the unchanged strict CSP. `createAppearanceController` in `src/mobile-engine.js` handles the live OS listener and manual choice. All stylesheet colors are semantic variables in `src/index.html`; SVG series and legends use the same chart tokens. Red brand actions remain distinct from labeled financial warnings.
- **Navigation:** Home / Record / Forecast / Assistant / More, with accessible text labels and outlined versus filled SVG icon variants. Internal route IDs and mobile navigation are unchanged.
- **Cash explanation:** Home shows recorded cash and the lowest 30-day projected balance on comparison tracks, with a hatched emergency-buffer zone. This is not a probability or account balance gauge. The deterministic safe-to-spend formula is unchanged. A zero estimate is explained as no extra spending room; a negative forecast separately shows Projected shortfall and the low-point date. The optional full calculation, buffer editing and scenario links remain available.
- **Welcome/setup:** Quick Start dismisses the existing welcome and immediately restores the user's workspace and drafts. A fresh visitor already starts in the seeded Shenzhen Bloom Commerce demo; existing visitors are never switched or reseeded. Guided Tour retains all 37 steps and chapters. Business Setup shows explicit Step 1/3, 2/3 and 3/3 headings. Invoices, expenses, collection and evidence empty states explain the next action and its effect on cash.
- **PDF fallback:** Receipt entry points show a document/T icon and selectable-text support. Failed extraction offers a bilingual modal with manual income/expense entry or another PDF. No extracted or guessed values are posted, and viewers cannot use the posting actions. Manual entry still requires review and confirmation. This does not add OCR, scanned-image recognition, or fapiao authenticity verification.
- **Trust/localization/accessibility:** The Home Security & Privacy button opens an accurate data-processing explanation. WeChat reminder drafts are prominent in Collections, with copy/send-by-user wording. New UI, errors and date/money explanations follow English/Chinese. Body copy is at least 14px, inputs 16px, captions at least 12px, and action targets at least 44px. Native form validation exposes localized inline errors and accessibility attributes without changing money validation.

### Verification and limits

Run `node scripts/compile.mjs`, `node scripts/standalone.mjs`, `node scripts/test.mjs`, and `node scripts/validate-artifact.mjs`.

New suites test OS/manual theme changes and persistence/storage failure, cash gauge examples including 89,500 and negative/zero cases, semantic text contrast >=4.5:1 and chart contrast >=3:1 for specified palette pairs, strict-CSP theme boot serving, bilingual navigation/settings, native inline validation, actual unsupported-upload fallback handling, viewer guards, Quick Start and unchanged ledger state. Existing financial, account/API, cloud, planner, PDF fixtures and full-tour suites are retained.

The DOM harness simulates the DOM and geometry; it is not browser rendering. A supported browser preview controller is unavailable for this change, so actual light/dark browser screenshots, mobile layout, screen-reader behavior and a complete WCAG audit are unverified. Token contrast checks do not certify every component/cascade state. Live AI was not invoked or verified, and existing secrets were not altered. The sample/reporting date remains the fixed synthetic 2026-10-13.

## Live AI activation repair — 18 October 2026 (Asia/Dhaka)

Gemini configuration and the last answer's mode are now presented separately. A calculated reply no longer labels a configured provider as disconnected. Assistant offers a sign-in link or an explicit Enable live Gemini consent dialog, plus an off switch. Enabling sends no question and makes no ledger changes; the user submits the next question normally. Consent remains scoped to the current tab and requires platform authentication. Checking Use live LLM in AI settings immediately enables Test live answer. Only activation controls update, preserving the existing chat input and open pane. Existing replies retain their calculated/live provenance.

The provider credential stays in server runtime secrets; no credential or provider setting is included in source. `tests/ai-activation.mjs` reproduces the disabled-test-button defect and covers configured/disabled/signed-out states, explicit consent, no automatic request, preserved draft nodes, consented request flags, successful-response labels and Chinese controls. It is a simulated DOM test. The user separately confirmed a successful live response in the deployed interface before this UI repair; browser rendering of the repaired controls remains unverified.

## Reference UI redesign — 18 October 2026 (Asia/Dhaka)

Eight supplied visual references guide the warm charcoal/peach dark palette, serif headings, outline icons, spacious lists and five-tab mobile navigation. Light/System/Dark preferences remain available; the charcoal reference appearance is the Dark choice, with a warm ivory Light equivalent. All colors continue to use semantic tokens.

More now presents the actual 20 tools in five groups: Records & documents (4), Payments & spending (4), Planning & decisions (4), Insights & assurance (5), and Business & settings (3). Search matches existing English/Chinese tool titles and descriptions. Three quick links open receipt upload, statement import and collections. This is a navigation overlay; closing it restores original page/form nodes, focus and any suspended reminder modal. Selecting an actual destination deliberately exits the overlay. Financial confirmation callbacks are invalidated if the underlying financial state changes while More is open.

PDF receipts show Select file, Review details and a real Complete state. The picker indicates selectable-text support; extraction still runs locally, all required fields remain editable, payment must be confirmed and posting requires the existing validation/final confirmation. Only a successfully posted transaction produces Receipt saved. View receipt opens its actual transaction evidence. Uploaded document metadata is transient and does not claim authenticity or bank verification.

Collections now offers search, invoice rows, an Invoice details sheet and a Review reminder sheet. Existing follow-up and settlement logic is reused. The reviewed text can be copied manually or explicitly saved as a draft. Draft saving never sends a message or changes cash, invoices, dates or scenarios. It rechecks business context/financial state and permissions at confirmation. All older saved drafts are retained; only the recent ten are listed in the compact history, and the full data remains in backup exports. Viewer posting, follow-up edits and draft saves remain blocked.

Tests/design-navigation.mjs verifies all 20 routes, bilingual search, underlying draft preservation, collection navigation, confirmed draft save without financial changes, real receipt confirmation/success and viewer controls. Tests/design-drafts.mjs verifies restoration of the original edited reminder/focus after More, retention of more than fifty older saved drafts and deliberate navigation exit. Tests/ux-polish.mjs follows the new invoice-detail entry point when checking prominent WeChat reminder controls. Existing financial, account, cloud, planner, PDF, live-AI activation, semantic contrast and complete-tour tests remain applicable.

Automated DOM tests simulate geometry and are not real browser/mobile visual checks. A supported browser preview controller is unavailable for this change, so the new layout has not been visually verified in a browser. No runtime secrets, AI configuration, Site audience or ledger schema are changed by this redesign.
