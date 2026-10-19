import assert from 'node:assert/strict';import fs from 'node:fs';
import {extractReceiptPDF,validateReceipt,postReceipt,parseReceiptText} from '../src/pdf-receipts.js';import {seed,summary,forecast} from '../src/engine.js';
const loader=async()=>{const pdfjs=await import('../src/vendor/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('../src/vendor/pdf.worker.min.mjs',import.meta.url).href;return pdfjs;};
const expected=JSON.parse(fs.readFileSync('tests/fixtures/receipts/expected.json'));
let d=seed('shenzhen');
for(const row of expected){const bytes=fs.readFileSync('tests/fixtures/receipts/'+row.file);const result=await extractReceiptPDF(Uint8Array.from(bytes).buffer,loader);const {file,...fields}=row;assert.deepEqual(result.fields,fields);validateReceipt(result.fields,d);const before=summary(d).cash;const next=postReceipt(d,fields,{confirmed:true,paid:true,role:'owner'});assert.equal(summary(next).cash-before,Math.round(Number(fields.total)*100)*(fields.type==='income'?1:-1));assert.throws(()=>validateReceipt(fields,next),/duplicate/);if(fields.invoiceId){const a=forecast(d),b=forecast(next);assert.equal(a.events.find(x=>x.id===fields.invoiceId).amount-b.events.find(x=>x.id===fields.invoiceId).amount,100000);assert.equal(a.closing,b.closing,'settlement transfers expected to current, does not create money twice');}d=next;console.log('PASS '+row.file+' actual PDF.js extraction, posting and repeat upload');}
await assert.rejects(extractReceiptPDF(new TextEncoder().encode('not a PDF').buffer,loader),/unsupported/);
const fakeDoc=text=>async()=>({getDocument:()=>({promise:Promise.resolve({numPages:1,getPage:async()=>({getTextContent:async()=>({items:text?[{str:text,transform:[1,0,0,1,0,0],hasEOL:true}]:[]})}),destroy:async()=>{}})})});
await assert.rejects(extractReceiptPDF(new TextEncoder().encode('%PDF- x').buffer,fakeDoc('')),/image-only/);
await assert.rejects(extractReceiptPDF(new TextEncoder().encode('%PDF- x').buffer,fakeDoc('Unstructured document, not supported')),/unsupported/);
assert.throws(()=>parseReceiptText('Receipt ID: A\nReceipt ID: B'),/ambiguous/);
console.log('PASS unsupported, image-only and ambiguous document controls');
