import {AS_OF,moneyInput,recordQuickEntry,validateData,outstanding} from './engine.js';
export const receiptFields=[['receiptId','Receipt ID','收据编号'],['date','Transaction Date','交易日期'],['businessId','Business ID','企业标识'],['type','Direction','收支方向'],['party','Counterparty','交易方'],['category','Category','分类'],['description','Description','说明'],['method','Payment Method','支付方式'],['currency','Currency','币种'],['subtotal','Subtotal','税前金额'],['tax','Tax Amount','税额'],['total','Total','总额'],['invoiceId','Invoice Reference','发票/账单编号'],['paymentStatus','Payment Status','付款状态']];
export function parseReceiptText(text){
 if(typeof text!=='string'||text.length>150000)throw Error('unsupported');
 const result={};
 for(const [key,label] of receiptFields){const matches=text.split(/\r?\n/).filter(l=>l.trim().startsWith(label+':'));if(matches.length>1)throw Error('ambiguous');result[key]=matches[0]?.trim().slice(label.length+1).trim()||'';}
 result.type=result.type.toLowerCase();if(result.invoiceId==='NONE')result.invoiceId='';return result;
}
export async function extractReceiptPDF(buffer,loader=()=>import('/vendor/pdf.min.mjs')){
 const bytes=new Uint8Array(buffer);if(bytes.length>2000000||new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('unsupported');
 const pdfjs=await loader();if(typeof window!=='undefined')pdfjs.GlobalWorkerOptions.workerSrc='/vendor/pdf.worker.min.mjs';
 let doc;try{doc=await pdfjs.getDocument({data:bytes,isEvalSupported:false,useSystemFonts:true}).promise;if(doc.numPages>3)throw Error('unsupported');let text='';for(let n=1;n<=doc.numPages;n++){const content=await(await doc.getPage(n)).getTextContent();let y=null;for(const item of content.items){if(!('str'in item))continue;const row=Math.round(item.transform[5]);if(y!==null&&row!==y)text+='\n';text+=item.str+(item.hasEOL?'\n':' ');y=item.hasEOL?null:row;}text+='\n';}if(text.replace(/\s/g,'').length<20)throw Error('image-only');if(!text.includes('FINORA RECEIPT V1'))throw Error('unsupported');return {fields:parseReceiptText(text),text};}finally{if(doc)await doc.destroy();}
}
export function validateReceipt(r,d){
 validateData(d);if(r.businessId!==d.org)throw Error('business');
 for(const key of ['receiptId','party','category','description','method','currency','paymentStatus'])if(typeof r[key]!=='string'||!r[key].trim()||r[key].length>({description:300,party:100,category:40}[key]||80))throw Error(key);
 if(!/^[A-Za-z0-9_-]{1,60}$/.test(r.receiptId))throw Error('receiptId');
 if(!['income','expense'].includes(r.type))throw Error('type');if(r.currency!=='CNY')throw Error('currency');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))||new Date(r.date).toISOString().slice(0,10)!==r.date||r.date<=d.openingDate||r.date>AS_OF)throw Error('date');
 const amount=(s,zero)=>{if(typeof s!=='string'||!/^\d{1,10}\.\d{2}$/.test(s))throw Error('amount');return zero&&/^0+\.00$/.test(s)?0:moneyInput(s);};
 const subtotal=amount(r.subtotal,true),tax=amount(r.tax,true),total=amount(r.total,false);
 // One fen tolerance accommodates independently rounded tax lines. Post printed total exactly.
 if(Math.abs(subtotal+tax-total)>1)throw Error('total');
 if(r.invoiceId){const i=d.invoices.find(i=>i.id===r.invoiceId&&i.org===d.org);if(!i||i.kind!==(r.type==='income'?'receivable':'payable')||total>outstanding(i)||i.party.trim().toLowerCase()!==r.party.trim().toLowerCase())throw Error('invoiceId');}
 const norm=s=>s.trim().toLowerCase().replace(/\s+/g,' ');
 const same=d.transactions.find(x=>x.receipt?.id===r.receiptId||x.id==='PDF-'+r.receiptId||x.date===r.date&&x.type===r.type&&x.amount===total&&norm(x.party)===norm(r.party));
 if(same)throw Error('duplicate:'+same.id);
 return {subtotal,tax,total};
}
export function postReceipt(d,r,{confirmed=false,paid=false,role='viewer'}={}){
 if(!['owner','accountant'].includes(role))throw Error('read-only');if(!confirmed)throw Error('confirmation');if(!paid)throw Error('payment');
 const amounts=validateReceipt(r,d);
 const next=recordQuickEntry(d,{id:'PDF-'+r.receiptId,type:r.type,date:r.date,party:r.party,category:r.category,amount:r.total,note:r.description,method:r.method,invoiceId:r.invoiceId||undefined});
 next.transactions.at(-1).receipt={id:r.receiptId,...amounts,currency:'CNY',paymentConfirmed:true,extraction:'structured-pdf-v1',authenticity:'not-verified'};
 validateData(next);return next;
}
