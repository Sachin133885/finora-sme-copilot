from pathlib import Path
import json,zipfile
from decimal import Decimal
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("DemoSans","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DemoSans-Bold","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
from reportlab.lib.colors import HexColor
out=Path('tests/fixtures/receipts');out.mkdir(parents=True,exist_ok=True)
labels=['Receipt ID','Transaction Date','Business ID','Direction','Counterparty','Category','Description','Payment Method','Currency','Subtotal','Tax Amount','Total','Invoice Reference','Payment Status']
rows=[('INCOME','Jade Market','sales','Partial collection for INV-1042','1000.00','0.00','INV-1042'),('EXPENSE','Lumen Office Supply','office','Printer paper and labels','120.00','15.60','NONE'),('INCOME','Maple Corner Retail','sales','Shop merchandise received','680.00','88.40','NONE'),('EXPENSE','Lantern Parcel Services','logistics','Outbound parcel delivery fees','240.00','14.40','NONE'),('INCOME','Riverstone Gifts','sales','Gift packaging order','1500.00','195.00','NONE'),('EXPENSE','Harbor Design Lab','marketing','Seasonal catalogue layout','800.00','48.00','NONE'),('INCOME','Cedar Lane Boutique','sales','Retail accessories order','920.00','119.60','NONE'),('EXPENSE','Sunbeam Software Studio','software','Monthly stock management subscription','300.00','18.00','NONE'),('INCOME','Morning Cloud Crafts','sales','Craft accessories collection','450.00','58.50','NONE'),('EXPENSE','Amber Workspace Services','maintenance','Equipment maintenance visit','560.00','33.60','NONE')]
expected=[]
for i,(direction,party,category,description,subtotal,tax,invoice) in enumerate(rows,1):
 total=f'{Decimal(subtotal)+Decimal(tax):.2f}'
 values=[f'FINORA-DEMO-{i:03}','2026-10-12','shenzhen',direction,party,category,description,'bank transfer','CNY',subtotal,tax,total,invoice,'PAID']
 file=f'receipt-{i:02}.pdf';c=canvas.Canvas(str(out/file),pagesize=(595,842));c.setTitle(f'Finora Synthetic Receipt {i:02}');c.setFillColor(HexColor('#fff8ef'));c.rect(0,0,595,842,fill=1,stroke=0);c.setFillColor(HexColor('#a9322b'));c.rect(0,730,595,112,fill=1,stroke=0);c.setFillColor(HexColor('#ffffff'));c.setFont('DemoSans-Bold',22);c.drawString(38,794,'FINORA RECEIPT V1');c.setFont('DemoSans-Bold',12);c.drawString(38,765,'SYNTHETIC DEMO');c.setFillColor(HexColor('#e57521'));c.rect(38,699,519,5,fill=1,stroke=0)
 for n,(label,value) in enumerate(zip(labels,values)):
  y=668-n*31;c.setFillColor(HexColor('#35231e'));c.setFont('DemoSans',11);c.drawString(38,y,f'{label}: {value}');c.setStrokeColor(HexColor('#eaded3'));c.line(38,y-11,557,y-11)
 c.setFillColor(HexColor('#6b5144'));c.setFont('DemoSans',10);c.drawString(38,165,'Fictional test document. Not a tax invoice, fapiao or bank payment proof.');c.drawString(38,148,'Review extracted fields and explicitly confirm payment before posting.');c.drawString(38,131,'Supported reporting snapshot: 2026-10-13. Business ID: shenzhen.');c.save()
 expected.append(dict(zip(['receiptId','date','businessId','type','party','category','description','method','currency','subtotal','tax','total','invoiceId','paymentStatus'],values),file=file));expected[-1]['type']=direction.lower();expected[-1]['invoiceId']='' if invoice=='NONE' else invoice
(out/'expected.json').write_text(json.dumps(expected,indent=2))
readme='''FINORA — SYNTHETIC DEMO RECEIPTS

These 10 individual, selectable-text PDFs use exactly the same FINORA RECEIPT V1 layout and labels. They are fictional test documents, not official fapiao or proof of a bank payment.

HOW TO TEST
1. Select the Shenzhen workspace (Business ID: shenzhen). Reporting snapshot: 2026-10-13. All receipts are dated 2026-10-12, within the current ledger rules.
2. Open Upload PDF receipt. Choose one PDF. Review fields and evidence.
3. Confirm that money was actually received/paid, then validate and explicitly confirm posting. Upload alone does not change cash. In a real workspace only confirm actual payments; these files are for synthetic demo testing.
4. Upload the same PDF again: posting is blocked as a possible duplicate. A different ID with identical date/direction/counterparty/total is also blocked.
5. Switch to another business and try a file: posting is blocked; switch back and preview again. Viewer accounts cannot post.

Receipts 02–10 are deliberately unlinked; no matching seeded invoice exists. Receipt 01 references seeded unpaid receivable INV-1042 (Jade Market, Shenzhen). It posts a CNY 1,000.00 partial collection only if that invoice still has at least that much outstanding. If your live records differ, the app rejects the link; do not invent a replacement reference. Existing records are never reset by importing these files.

Expected field results and cash effects follow. All are CNY, bank transfer, Payment Status PAID (document text only; user confirmation still required), Business ID shenzhen, dated 2026-10-12. Linked collection reduces the outstanding invoice by exactly its total and excludes that settled amount from future collections. Unlinked sales affect recent daily sales averages; expenses outside operations affect current cash only, not daily operations averages.

'''
for r in expected:
 readme+=f"{r['file']} | {r['receiptId']} | {r['type']} | {r['party']} | {r['category']} | {r['description']} | subtotal {r['subtotal']} + tax {r['tax']} = total {r['total']} | invoice {r['invoiceId'] or 'NONE'} | cash {'+' if r['type']=='income' else '-'}{r['total']}\n"
readme+='\nRounding rule: subtotal + tax may differ from printed total by at most CNY 0.01 (one fen); the printed total is posted. All examples are exact. Critical missing fields, other currencies, invalid dates, image-only PDFs and unsupported layouts require correction/manual entry. Source authenticity is not verified.\n'
(out/'README.txt').write_text(readme)
zip_path=Path('/workspace/scratch/5302bfc3ad3f/Finora-Sample-Receipts.zip')
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(out.glob('*')):z.write(p,p.name)
print(zip_path)
