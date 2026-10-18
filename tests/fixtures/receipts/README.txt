FINORA — SYNTHETIC DEMO RECEIPTS

These 10 individual, selectable-text PDFs use exactly the same FINORA RECEIPT V1 layout and labels. They are fictional test documents, not official fapiao or proof of a bank payment.

HOW TO TEST
1. Select the Shenzhen workspace (Business ID: shenzhen). Reporting snapshot: 2026-10-13. All receipts are dated 2026-10-12, within the current ledger rules.
2. Open Upload PDF receipt. Choose one PDF. Review fields and evidence.
3. Confirm that money was actually received/paid, then validate and explicitly confirm posting. Upload alone does not change cash. In a real workspace only confirm actual payments; these files are for synthetic demo testing.
4. Upload the same PDF again: posting is blocked as a possible duplicate. A different ID with identical date/direction/counterparty/total is also blocked.
5. Switch to another business and try a file: posting is blocked; switch back and preview again. Viewer accounts cannot post.

Receipts 02–10 are deliberately unlinked; no matching seeded invoice exists. Receipt 01 references seeded unpaid receivable INV-1042 (Jade Market, Shenzhen). It posts a CNY 1,000.00 partial collection only if that invoice still has at least that much outstanding. If your live records differ, the app rejects the link; do not invent a replacement reference. Existing records are never reset by importing these files.

Expected field results and cash effects follow. All are CNY, bank transfer, Payment Status PAID (document text only; user confirmation still required), Business ID shenzhen, dated 2026-10-12. Linked collection reduces the outstanding invoice by exactly its total and excludes that settled amount from future collections. Unlinked sales affect recent daily sales averages; expenses outside operations affect current cash only, not daily operations averages.

receipt-01.pdf | FINORA-DEMO-001 | income | Jade Market | sales | Partial collection for INV-1042 | subtotal 1000.00 + tax 0.00 = total 1000.00 | invoice INV-1042 | cash +1000.00
receipt-02.pdf | FINORA-DEMO-002 | expense | Lumen Office Supply | office | Printer paper and labels | subtotal 120.00 + tax 15.60 = total 135.60 | invoice NONE | cash -135.60
receipt-03.pdf | FINORA-DEMO-003 | income | Maple Corner Retail | sales | Shop merchandise received | subtotal 680.00 + tax 88.40 = total 768.40 | invoice NONE | cash +768.40
receipt-04.pdf | FINORA-DEMO-004 | expense | Lantern Parcel Services | logistics | Outbound parcel delivery fees | subtotal 240.00 + tax 14.40 = total 254.40 | invoice NONE | cash -254.40
receipt-05.pdf | FINORA-DEMO-005 | income | Riverstone Gifts | sales | Gift packaging order | subtotal 1500.00 + tax 195.00 = total 1695.00 | invoice NONE | cash +1695.00
receipt-06.pdf | FINORA-DEMO-006 | expense | Harbor Design Lab | marketing | Seasonal catalogue layout | subtotal 800.00 + tax 48.00 = total 848.00 | invoice NONE | cash -848.00
receipt-07.pdf | FINORA-DEMO-007 | income | Cedar Lane Boutique | sales | Retail accessories order | subtotal 920.00 + tax 119.60 = total 1039.60 | invoice NONE | cash +1039.60
receipt-08.pdf | FINORA-DEMO-008 | expense | Sunbeam Software Studio | software | Monthly stock management subscription | subtotal 300.00 + tax 18.00 = total 318.00 | invoice NONE | cash -318.00
receipt-09.pdf | FINORA-DEMO-009 | income | Morning Cloud Crafts | sales | Craft accessories collection | subtotal 450.00 + tax 58.50 = total 508.50 | invoice NONE | cash +508.50
receipt-10.pdf | FINORA-DEMO-010 | expense | Amber Workspace Services | maintenance | Equipment maintenance visit | subtotal 560.00 + tax 33.60 = total 593.60 | invoice NONE | cash -593.60

Rounding rule: subtotal + tax may differ from printed total by at most CNY 0.01 (one fen); the printed total is posted. All examples are exact. Critical missing fields, other currencies, invalid dates, image-only PDFs and unsupported layouts require correction/manual entry. Source authenticity is not verified.
