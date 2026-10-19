# Finora 1.1 — interface refresh

## What changed

The Home screen follows the supplied mobile reference: a deep plum-to-red welcome area, a large orange-red cash card, four financial workspace shortcuts, rounded white summary cards and a fixed five-tab navigation bar. The cash card shows recorded cash and a separate 30-day planning estimate, using the existing calculation engine. It does not present a credit limit or a loan offer.

Record now contains all four primary entry actions: Upload PDF receipt, Add receipt, Add expense and Import statement. Home no longer duplicates those actions. The existing confirmation, duplicate protection, reversal and role permission checks remain in force. Record history now includes posted PDF receipts, with Undo available for eligible quick entries.

The other workspaces use matching red headers, rounded content surfaces and consistent controls. More retains the existing twenty tool routes and search.

The header assistant shortcut is replaced by a moon/sun theme button. First use defaults to light even if the operating system uses dark mode. An explicit dark preference is remembered on this device. A legacy System preference resolves to light. Theme switching changes the display without rerendering forms or writing financial records.

A new red Chinese dragon appears on Home, the assistant tab/avatar, the welcome screen and each guided-tour step. This release displays the new welcome once per user context; Demo lets users reopen the welcome and guide. The tour explains Home, Record, Forecast, Assistant, More and the theme button without posting transactions or submitting questions. Reduced-motion settings disable decorative animation.

The assistant has one full-page conversation, compact question suggestions, readable answer cards, prominent financial figures and expandable evidence. AI connection/privacy controls are in an expandable panel. Live AI still requires explicit consent and server configuration. Calculated, live, failed and fallback replies retain distinct truthful labels. Unsent questions survive navigation in session memory and remain isolated by account, owner and business. Chinese input-method Enter events do not submit a question prematurely.

## Verify and run

Use Node 24.

```sh
npm install
npm run build
node scripts/standalone.mjs
npm run build:web
npm test
node scripts/validate-artifact.mjs
```

`npm start` runs the original Render adapter. Keep the existing Render environment variables, Supabase configuration and database; this UI release requires no schema migration or data reset. The Render setup guide remains at `docs/RENDER_SETUP.md`.

The self-contained `Finora-mobile.html` embeds fonts, stylesheet and mascot. Open it locally to review the interactive demo. It uses local calculations; hosted account sync and live Gemini require the existing server. No real keys are included.

## Deployment status and review limits

The updated source and generated builds are included. The live Render URL has not been modified. No connected Finora repository or Render deployment access was available for publishing this release.

All 32 regression suites passed: the full run passed 31 suites, and the corrected stylesheet token check passed on rerun. The built Worker validated as ESM; exact font/mascot bytes and CSS response types passed. Static and self-contained builds completed. Regression validation uses calculation tests, API tests, SQL/account tests and simulated DOM/event integration. It is not browser layout verification. A browser layout pass was unavailable in this environment. Before production release, visually review 320, 390 and 480px screens, desktop framing, long Chinese labels, both themes, the welcome/tour, PDF review and the assistant with the mobile keyboard open.

## Main files

- `src/app.js`: Home, Record, header, assistant and theme interactions.
- `src/experience.css`: shared visual system and responsive light/dark styles.
- `src/assets/finora-dragon.png`: generated Finora red-dragon mascot.
- `src/tour.js`: dragon welcome and expanded read-only guide.
- `src/theme-init.js`, `src/mobile-engine.js`: light default and saved dark preference.
- Build scripts and server asset routes: stylesheet and mascot delivery for hosted/static/offline builds.

Existing financial engines, authorization adapter and SQL model were not changed by the interface refresh.
