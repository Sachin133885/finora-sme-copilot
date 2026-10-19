# Final 1.2 screenshot capture checklist

## Status and provenance

No genuine final-version screenshots are included yet. On 19 October 2026, Playwright was available but no Chromium binary was installed; browser installation returned invalid/truncated download archives. No browser visual success is claimed. The README uses the existing dragon artwork, explicitly labeled decorative. Concept art, registration screenshots and the older deployed interface are not substitutes for final-source screenshots.

## Capture these eight views

Use the final source, synthetic Shenzhen business and the default fixed reporting snapshot. For local screenshots, run `npm run build` then `node scripts/local.mjs` and open http://localhost:3000. This requires no real account or AI secrets. A local demo screenshot does not verify Supabase behavior.

| Filename under docs/screenshots/ | View and suggested README caption |
| --- | --- |
| `dashboard-desktop.png` | Home — recorded cash, upcoming obligations and the dragon identity. Desktop viewport 1440×1000. |
| `record-desktop.png` | Record — choose income, expense, receipt or import, and inspect history before recording. 1440×1000. |
| `pdf-receipt-review.png` | Supported text PDF preview — inspect editable fields and source evidence before explicit confirmation. 1440×1000. Use a provided synthetic fixture and stop before posting. |
| `forecast-desktop.png` | Forecast — inspect the low point, reserve gap and current assumptions. 1440×1000. |
| `cash-rescue-planner.png` | Cash Rescue Planner — compare hypothetical responses and their assumptions. 1440×1000. |
| `assistant-desktop.png` | Assistant — show a labeled calculated answer/evidence with no live-key or account information. 1440×1000. |
| `more-desktop.png` | More — five directory groups, category filters and tool search. 1440×1000. |
| `dashboard-mobile.png` | Home at 390×844 — touch layout and bottom navigation. |

## Exact manual procedure

1. Build the final source; serve it with the local demo script. Use a fresh/incognito browser profile. Never capture a private cloud workspace.
2. Select English/light for the primary series. Dismiss welcome/tour deliberately. Keep snapshot/cash labels visible and use the same synthetic business in all views.
3. Open developer tools → responsive/device mode. Set 1440×1000 for desktop, 390×844 for mobile. Wait for fonts/artwork to load and the brief motion to finish; use reduced motion when needed.
4. Navigate through real tabs/More tools. Capture actual rendered controls using the browser’s screenshot function; do not recreate them in image generation software. Use one useful viewport or a carefully chosen full-page image, consistently.
5. For PDF review, select one file from `tests/fixtures/receipts/` if that directory exists in your checkout; use the actual PDF fixture directory in `tests/pdf-fixtures.mjs` otherwise. Review the synthetic labels. Do not post just to obtain an image.
6. Inspect every file at normal size: readable text, loaded fonts/assets, no clipped buttons, no debug panels and no secrets or personal account/payment data. Repeat a dark/Chinese view as a separate optional series.
7. Save the PNGs using the filenames above. Add relative Markdown image links only after the files exist, with the captions above and descriptive alt text. For example: `![Finora Home showing synthetic cash and upcoming bills](docs/screenshots/dashboard-desktop.png)` from the root README.
8. Record capture date, commit, viewport, language, theme, browser version and local/deployed origin in a companion manifest. If captured locally, label it local. If final code has not deployed, do not caption a live image as final 1.2.

The expected screenshot names are listed here as plain text, not broken image embeds. Root README image paths should be validated after adding images. A desktop responsive preview is not a physical-device test or proof of production auth/AI.
