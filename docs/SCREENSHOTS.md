# Finora app screenshots

## Capture provenance

Eight genuine browser captures were taken on **19 October 2026** from the user-supplied [Finora dragon preview](https://finora-dragon-preview.dncorleone1211.chatgpt.site/#overview). They use the synthetic **Shenzhen Bloom Commerce** business and fixed **13 October 2026** reporting snapshot. No private account or real customer data appears.

The browser viewport was approximately 1363 × 936 or 1348 × 926 pixels. Each image preserves the full viewport height and crops away neutral margins around the centered app workspace. Crop widths vary slightly with screenshot scaling. These are desktop-browser captures of the responsive interface, not photographs or physical-device tests. No interface was recreated or generated for these images.

The preview's deployed source commit and browser version were not exposed in the capture record. These captures document the observed preview and do not assert that it matches a particular repository commit or the Render deployment.

## Included images

| File | Screen | Language and appearance |
| --- | --- | --- |
| [dashboard.jpg](screenshots/dashboard.jpg) | Home — Recorded cash and the spending estimate, shown in English. | English, light |
| [record.jpg](screenshots/record.jpg) | Record — PDF receipts, income, expenses and statement imports. | English, light |
| [forecast.jpg](screenshots/forecast.jpg) | Forecast — Projected cash, the low point and reserve gap. | English, light |
| [assistant.jpg](screenshots/assistant.jpg) | Assistant — A labelled calculated answer with supporting figures. | English, light |
| [pdf-receipt-review.jpg](screenshots/pdf-receipt-review.jpg) | Receipt review — Editable fields extracted from a synthetic text PDF, before posting. | English, light |
| [collections.jpg](screenshots/collections.jpg) | Collections — Outstanding invoices and expected customer payments. | English, light |
| [more.jpg](screenshots/more.jpg) | More tools — A searchable, categorized directory of business tools. | English, light |
| [dashboard-dark.jpg](screenshots/dashboard-dark.jpg) | Chinese dark mode — The same synthetic business in Simplified Chinese and dark appearance. | Simplified Chinese, dark |

Machine-readable provenance, exact image sizes and hashes: [capture-manifest.json](screenshots/capture-manifest.json).

## Workflow boundaries

- The PDF review uses the supplied synthetic `receipt-02.pdf` fixture. Extraction finished and populated editable fields. No payment was posted to obtain the screenshot.
- The Assistant screen explicitly labels its calculation fallback and unconfigured Gemini connection. It is not evidence of a successful live provider request.
- Displayed amounts are synthetic planning examples, not verified bank balances, forecast guarantees or lending decisions.
- Account permissions, cloud persistence, physical devices, mobile keyboards and animation timing require separate checks.

## Refreshing this gallery

Use the same synthetic business and reporting date. Navigate through the real tabs and More directory, wait for extraction and rendering to finish, and capture the visible interface. Stop before posting money or changing financial records. Inspect every image for readable controls and accidental personal data, then update the gallery, manifest and capture date together. Preserve language/theme labels and identify the actual local or hosted origin.
