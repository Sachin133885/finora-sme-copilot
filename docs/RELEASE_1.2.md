# Finora 1.2 — Vermilion & Ivory

The five reference concepts are implemented as native interactive screens over the existing Finora application. This is a local source release, not a deployment to the Render app or the earlier hosted preview.

## What changed

| Screen | Implementation |
| --- | --- |
| Home | Oxblood/vermilion header, realistic transparent loong, dragon-watermarked cash card, distinct sculpted vector shortcuts, ivory summary cards and a red conversation invitation. Values come from the existing engine. |
| Record | Four recording cards, PDF/income/expense/import flows, a select-review-confirm explanation and the real existing entry history. |
| Forecast | Scenario chart above dynamic metric cards, horizon and preset controls, live assumptions, comparison action and expandable evidence. Chart shape, low-point date, reserve gap and amounts all come from the engine. |
| Assistant | Dragon avatar, red header, expandable connection/privacy controls, welcoming ivory card, functional question cards, a focus-only Start conversation action, evidence-backed replies and one composer. |
| More | Grouped card directory, original twenty tools, category filters, search within the chosen category, group drill-down and draft-safe modal return paths. |
| Secondary workspaces | Shared red artwork headers, typography, surfaces, controls, dialogs and both appearance modes. |

The source has a consistent local vector icon family using red/gold/jade materials. Icons communicate the tool function and do not imply third-party integrations. The pixiu decoration is a restrained original line engraving.

Chinese UI copy is live text, rather than text baked into screenshots. Both Simplified Chinese and English remain available. Light remains the default regardless of the OS setting, and explicit dark mode is remembered. A new once-per-context welcome shows the updated dragon; Demo reopens the guide. Guided tours expand disclosure panels to reveal their targets and preserve the original workspace/drafts on exit.

## Dragon motion

Home includes a six-frame sprite walk with articulated leg poses, a short corner translation, a pause, a small upward ember and a resting state. It runs briefly on Home entry and can be replayed by tapping the dragon. Motion is clipped inside the decorative corner, separate from the money card. Reduced-motion preferences show still artwork.

This is a generated 2D sprite treatment, not a rigged 3D simulation. Its appearance, frame transitions and device timing still require real-browser review. Open `Finora-Dragon-Motion.html` for the isolated executable motion demonstration. The original static cutout is used in headers, avatars, watermarks and the guide.

Both PNG assets have genuine alpha transparency, verified from pixel data. The static cutout is 1774×887. The sprite is 1536×1024 with six equal 512×512 cells. About 60% and 66% of their pixels respectively are transparent. Asset origins are recorded in ASSET_PROVENANCE_1.2.json.

## Preserved behavior

Seven protected financial/account modules match the uploaded archive byte for byte: engine.js, business-ai.js, readiness.js, rescue.js, pdf-receipts.js, cloud-accounts.js and render-adapter.mjs. Their hashes are in FINANCIAL_INTEGRITY_1.2.json.

Integer-fen calculations, confirmation-before-write, duplicate handling, settlements, audit/reversal behavior, role permissions, auth boundaries, live-AI consent, business isolation and escaping remain in force. No ledger reset or schema migration was introduced.

Forecast supports the existing valid 30/60/90-day horizons. The reference's 7-day chip was not copied because the existing scenario engine is based on those supported horizons. Zero spending estimates and reserve warnings remain truthful. No financial values or chart coordinates were copied from concept art.

## Run and review

Use Node 24. From the extracted project root:

```sh
npm install
npm run build
npm start
```

Then open the local URL printed by the server. Preserve the existing Render environment variables and Supabase settings. The UI release adds no runtime service or paid dependency.

For an immediate offline review, download/open `Finora-mobile.html`. It embeds fonts, artwork, stylesheet and app code. Its local calculations and demo workflows work without a server. Live Gemini and cloud sync require the hosted backend and configuration. `Finora-updated.html` is now a small local redirect to the current standalone file.

Build static and offline outputs:

```sh
npm run build:web
node scripts/standalone.mjs
node scripts/dragon-demo.mjs
```

Generated `public/`, `worker/` and `dist/` directories are reproducible and omitted from the source ZIP. Run the build before tests/start when using a freshly extracted archive.

## Verification

All 33 regression suites passed in a complete run. After a final motion-only CSS adjustment, artifact validation, palette contrast, exact asset serving, the redesign integration suite and standalone checks passed again. Hosted Worker, static frontend, standalone application and isolated motion demo builds completed.

New integration tests verify dynamic forecast cards across horizons, custom preset-state updates, immutable animation replay, the native Record hub, all twenty directory routes, category-scoped search, focus-only conversation startup, composer preservation and bilingual rendering. Existing account, SQL, PDF, financial, AI-consent and tour suites pass.

Browser screenshots and recorded animation were not produced: the environment lacks the browser-control capability required by its Sites workflow, which explicitly requires skipping browser QA in that situation. Simulated DOM checks do not verify visual layout, mobile keyboards, or animation appearance. No generated concept image is presented as an implemented-app screenshot.

Before production deployment, visually review 320/390/480px, tablet and desktop, both languages/themes, large/negative values, mobile-keyboard behavior, disclosure steps in the guide and reduced-motion mode. Compare the five live screens against the supplied references. The source manifest's imported hosting identity was preserved but was not used for deployment.
