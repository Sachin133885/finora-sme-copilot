// Shared deterministic engine. All money is integer fen; dates use UTC calendar days.
export const AS_OF='2026-10-13';
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
export const daysBetween=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/86400000);
export const sum=(items,key='amount')=>items.reduce((s,x)=>s+x[key],0);
export const outstanding=i=>Math.max(0,i.total-i.paid);
export const status=i=>!outstanding(i)?'paid':i.due<AS_OF?'overdue':i.paid?'partial':'pending';
export const profiles=[{id:'shenzhen',en:'Shenzhen Bloom Commerce',zh:'深圳花时电商',industry:['E-commerce · 12 employees','电商零售 · 12名员工'],factor:1,cash:6240000},{id:'guangzhou',en:'Guangzhou Horizon Trading',zh:'广州远景贸易',industry:['Wholesale · 24 employees','批发贸易 · 24名员工'],factor:2.2,cash:9800000},{id:'chengdu',en:'Chengdu Studio Collective',zh:'成都聚创设计',industry:['Professional services · 8 employees','专业服务 · 8名员工'],factor:.65,cash:18700000}];
export function seed(id){
 const p=profiles.find(p=>p.id===id); if(!p)throw Error('organization'); const f=p.factor, money=n=>Math.round(n*100*f);
 const transactions=[];
 for(let day=-119;day<=0;day++){
  const date=addDays(AS_OF,day),n=day+119;
  transactions.push({id:`${id}-T${n}-R`,org:id,date,type:'income',category:'sales',party:'Storefront',description:'Retail sales',amount:money(3900+(n%7)*160+(n>89?260:0))});
  transactions.push({id:`${id}-T${n}-E`,org:id,date,type:'expense',category:'operations',party:'Operations',description:'Operating costs',amount:money(2200+(n%5)*110)});
  if(date.endsWith('-01'))transactions.push({id:`${id}-PAY${date}`,org:id,date,type:'expense',category:'payroll',party:'Team payroll',description:'Monthly payroll',amount:money(24000)});
  if(date.endsWith('-15')&&id!=='chengdu')transactions.push({id:`${id}-STOCK${date}`,org:id,date,type:'expense',category:'inventory',party:'Eastgate Inventory',description:'Inventory purchase',amount:money(45000)});
  if(date.endsWith('-05'))transactions.push({id:`${id}-RENT${date}`,org:id,date,type:'expense',category:'rent',party:'Property management',description:'Monthly rent',amount:money(8500)});
 }
 transactions.push({id:`${id}-AD01`,org:id,date:'2026-10-08',type:'expense',category:'marketing',party:'Campaign vendor',description:'Campaign invoice A',amount:money(6800)}, {id:`${id}-AD02`,org:id,date:'2026-10-08',type:'expense',category:'marketing',party:'Campaign vendor',description:'Campaign invoice B — review',amount:money(6800)});
 const invoices=[
  {id:'INV-1042',org:id,kind:'receivable',party:'Jade Market',partyZh:'翡翠集市',issued:'2026-09-10',due:'2026-09-30',expected:'2026-10-20',subtotal:money(28000),taxRate:0,total:money(28000),paid:0},
  {id:'INV-1048',org:id,kind:'receivable',party:'Cloud Nine Retail',partyZh:'云上零售',issued:'2026-09-22',due:'2026-10-10',expected:'2026-10-25',subtotal:money(25000),taxRate:0,total:money(25000),paid:money(8000)},
  {id:'INV-1056',org:id,kind:'receivable',party:'Pearl Collective',partyZh:'明珠商贸',issued:'2026-10-03',due:'2026-11-02',expected:'2026-11-02',subtotal:money(36000),taxRate:0,total:money(36000),paid:0},
  {id:'BILL-0201',org:id,kind:'payable',party:'Eastgate Inventory',partyZh:'东门供应链',issued:'2026-10-01',due:'2026-10-23',expected:'2026-10-23',subtotal:money(id==='chengdu'?12000:125000),taxRate:0,total:money(id==='chengdu'?12000:125000),paid:0},
  {id:'BILL-0208',org:id,kind:'payable',party:'Parcel Logistics',partyZh:'速达物流',issued:'2026-10-07',due:'2026-11-05',expected:'2026-11-05',subtotal:money(12500),taxRate:0,total:money(12500),paid:0}
 ];
 transactions.push({id:`${id}-SET1048`,org:id,date:'2026-10-09',type:'income',category:'settlement',party:'Cloud Nine Retail',description:'Partial collection INV-1048',invoiceId:'INV-1048',amount:money(8000)});
 if(id==='chengdu'){for(const i of invoices){if(i.id==='BILL-0201'){i.party='Design Systems';i.partyZh='设计系统服务';}if(i.id==='INV-1042'){i.party='City Creative';i.partyZh='城市创意';}}}
 const net=sum(transactions.filter(t=>t.type==='income'))-sum(transactions.filter(t=>t.type==='expense'));
 return {org:id,opening:p.cash-net,openingDate:addDays(AS_OF,-120),transactions,invoices,reviewed:[],audit:[],chats:[],settings:{name:p.en,currency:'CNY',reserve:money(20000)},recurring:[{id:'FC-PAY',day:1,amount:money(24000),category:'payroll'},{id:'FC-RENT',day:5,amount:money(8500),category:'rent'}]};
}
export function validateData(d){
 if(!d||!profiles.some(p=>p.id===d.org)||!Array.isArray(d.transactions)||!Array.isArray(d.invoices)||d.transactions.length>5000||d.invoices.length>1000||!Number.isSafeInteger(d.opening))throw Error('invalid data');
 const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 if(!date(d.openingDate)||!d.settings||!Number.isSafeInteger(d.settings.reserve)||d.settings.reserve<0||!Array.isArray(d.recurring))throw Error('invalid settings');
 const ids=new Set();for(const t of d.transactions){if(t.org!==d.org||!Number.isSafeInteger(t.amount)||t.amount<=0||t.amount>100000000000||!['income','expense','transfer'].includes(t.type)||!date(t.date)||t.date<=d.openingDate||t.date>AS_OF||typeof t.id!=='string'||ids.has(t.id)||typeof t.party!=='string'||typeof t.category!=='string')throw Error('invalid transaction');ids.add(t.id);}
 const ii=new Set();for(const i of d.invoices){if(i.org!==d.org||!['receivable','payable'].includes(i.kind)||!date(i.due)||!date(i.issued)||!date(i.expected)||i.due<i.issued||i.expected<i.issued||![i.subtotal,i.total,i.paid].every(Number.isSafeInteger)||i.subtotal<0||i.total<=0||i.total>100000000000||i.paid<0||i.paid>i.total||!Number.isFinite(i.taxRate)||i.taxRate<0||i.taxRate>100||i.total!==i.subtotal+Math.round(i.subtotal*i.taxRate/100)||typeof i.party!=='string'||typeof i.id!=='string'||ii.has(i.id))throw Error('invalid invoice');ii.add(i.id);}
 for(const i of d.invoices){const linked=d.transactions.filter(t=>t.invoiceId===i.id);if(linked.some(t=>t.category!=='settlement'||t.type!==(i.kind==='receivable'?'income':'expense'))||sum(linked.filter(t=>!t.voidedAt))!==i.paid)throw Error('inconsistent settlement');}
 for(const t of d.transactions)if(t.invoiceId&&!d.invoices.some(i=>i.id===t.invoiceId))throw Error('unknown invoice');
 for(const r of d.recurring)if(!Number.isInteger(r.day)||r.day<1||r.day>28||!Number.isSafeInteger(r.amount)||r.amount<0)throw Error('invalid recurring');
 return d;
}
export function summary(d,start=addDays(AS_OF,-29),end=AS_OF){
 const tx=d.transactions.filter(t=>t.org===d.org&&!t.voidedAt&&t.date>=start&&t.date<=end),all=d.transactions.filter(t=>t.org===d.org&&!t.voidedAt&&t.date<=AS_OF);
 const revenue=sum(tx.filter(t=>t.type==='income')),expenses=sum(tx.filter(t=>t.type==='expense'));
 const invoices=d.invoices.filter(i=>i.org===d.org),receivables=invoices.filter(i=>i.kind==='receivable'),payables=invoices.filter(i=>i.kind==='payable');
 const cash=d.opening+sum(all.filter(t=>t.type==='income'))-sum(all.filter(t=>t.type==='expense'));
 const burn=Math.max(0,(expenses-revenue)/Math.max(1,daysBetween(start,end)+1));
 return {revenue,expenses,profit:revenue-expenses,cash,ar:sum(receivables.map(i=>({amount:outstanding(i)}))),ap:sum(payables.map(i=>({amount:outstanding(i)}))),overdue:sum(receivables.filter(i=>i.due<AS_OF).map(i=>({amount:outstanding(i)}))),runway:burn>0?Math.floor(Math.max(0,cash)/burn):null,transactions:tx,start,end};
}
export function forecast(d,opts={}){
 const {days=30,growth=0,delay=0,expense=0,hiring=0,supplierDelay=0,oneOff=0,loan=0,monthlyPayment=0,repayment=[],collection=null,billTiming=null}=opts;
 if(![30,60,90].includes(days)||![growth,delay,expense,hiring,supplierDelay,oneOff,loan,monthlyPayment].every(Number.isFinite)||growth< -100||growth>100||delay<0||delay>60||expense<0||expense>100||supplierDelay<0||supplierDelay>60||[hiring,oneOff,loan,monthlyPayment].some(x=>x<0||!Number.isSafeInteger(x)))throw Error('invalid scenario');
 if(!Array.isArray(repayment)||repayment.length>60||repayment.some(x=>!Number.isSafeInteger(x)||x<0))throw Error('invalid repayment');
 if(collection&&(!d.invoices.some(i=>i.id===collection.id&&i.kind==='receivable')||!Number.isFinite(collection.percent)||collection.percent<0||collection.percent>100||!Number.isInteger(collection.days)||collection.days<1||collection.days>90||!Number.isSafeInteger(collection.cost)||collection.cost<0))throw Error('invalid collection');
 if(billTiming&&(!d.invoices.some(i=>i.id===billTiming.id&&i.kind==='payable')||!Number.isInteger(billTiming.days)||billTiming.days<0||billTiming.days>60))throw Error('invalid bill timing');
 const hist=d.transactions.filter(t=>t.org===d.org&&!t.voidedAt&&t.date>=addDays(AS_OF,-29)&&t.date<=AS_OF);
 const dailySales=Math.round(sum(hist.filter(t=>t.type==='income'&&t.category==='sales'))/30), dailyOps=Math.round(sum(hist.filter(t=>t.type==='expense'&&t.category==='operations'))/30);
 const invoices=d.invoices.filter(i=>i.org===d.org&&outstanding(i)>0),events=[];
 let cash=summary(d).cash,points=[{date:AS_OF,cash,inflow:0,outflow:0,evidence:[]}];
 for(let n=1;n<=days;n++){
  const date=addDays(AS_OF,n);let inflow=Math.round(dailySales*(1+growth/100)),outflow=Math.round(dailyOps*(1+expense/100)),evidence=[];
  for(const i of invoices){
   const base=i.kind==='receivable'?i.expected:i.due,shift=i.kind==='receivable'?delay:supplierDelay;
   const due=addDays(base<=AS_OF?addDays(AS_OF,1):base,Math.round(shift)+(billTiming?.id===i.id?billTiming.days:0));
   const moved=collection?.id===i.id?Math.round(outstanding(i)*collection.percent/100):0,remaining=outstanding(i)-moved;
   if(collection?.id===i.id&&date===addDays(AS_OF,collection.days)&&moved){inflow+=moved;outflow+=collection.cost;evidence.push(i.id);events.push({date,id:i.id,kind:'receivable',amount:moved});}
   if(date===due&&remaining){if(i.kind==='receivable')inflow+=remaining;else outflow+=remaining;evidence.push(i.id);events.push({date,id:i.id,kind:i.kind,amount:remaining});}
  }
  for(const r of d.recurring)if(+date.slice(-2)===r.day){outflow+=r.amount;evidence.push(r.id);events.push({date,id:r.id,kind:'payable',amount:r.amount});}
  if(n===1){inflow+=loan;outflow+=oneOff;}
  if(n%30===0){const payment=repayment.length?(repayment[n/30-1]||0):monthlyPayment;outflow+=hiring+payment;if(hiring||payment)evidence.push('SCENARIO');}
  cash+=inflow-outflow;points.push({date,cash,inflow,outflow,evidence});
 }
 const min=points.reduce((a,b)=>a.cash<b.cash?a:b),first=points.find(p=>p.cash<0),reserve=d.settings.reserve;
 return {points,events,min,first,closing:cash,shortfall:Math.max(0,-min.cash),need:Math.max(0,reserve-min.cash),dailySales,dailyOps,reserve,options:opts};
}
export function risks(d){
 const f=forecast(d),s=summary(d),r=[];
 if(f.min.cash<d.settings.reserve)r.push({id:'cash',severity:f.min.cash<0?'critical':'high',amount:f.need,date:f.min.date,evidence:f.events.filter(x=>x.kind==='payable'&&x.date<=f.min.date).map(x=>x.id),route:'cash'});
 const overdue=d.invoices.filter(i=>i.org===d.org&&i.kind==='receivable'&&i.due<AS_OF&&outstanding(i));if(overdue.length)r.push({id:'overdue',severity:'high',amount:s.overdue,date:AS_OF,evidence:overdue.map(i=>i.id),route:'invoices'});
 const dup=duplicates(d.transactions.filter(t=>t.org===d.org));if(dup.length)r.push({id:'duplicate',severity:'medium',amount:sum(dup.map(g=>({amount:g[0].amount*(g.length-1)}))),date:AS_OF,evidence:dup.flat().map(t=>t.id),route:'expenses'});
 const top=d.invoices.filter(i=>i.kind==='receivable'&&i.org===d.org).sort((a,b)=>outstanding(b)-outstanding(a))[0];if(top&&s.ar&&outstanding(top)/s.ar>.4)r.push({id:'concentration',severity:'medium',amount:outstanding(top),date:AS_OF,evidence:[top.id],route:'invoices'});
 return r;
}
export function duplicates(tx){tx=tx.filter(t=>!t.voidedAt);const groups=new Map();for(const t of tx){const k=[t.date,t.type,t.party,t.amount].join('|');groups.set(k,[...(groups.get(k)||[]),t]);}return [...groups.values()].filter(g=>g.length>1);}
export function financing(principal,apr,months,fee){
 if(!Number.isSafeInteger(principal)||principal<=0||principal>100000000||!Number.isFinite(apr)||apr<0||apr>100||!Number.isInteger(months)||months<1||months>60||!Number.isFinite(fee)||fee<0||fee>20)throw Error('invalid financing');
 const r=apr/1200,payment=r===0?Math.ceil(principal/months):Math.ceil(principal*r/(1-Math.pow(1+r,-months))),upfront=Math.round(principal*fee/100);let balance=principal,total=0,schedule=[];
 for(let n=1;n<=months;n++){const interest=Math.round(balance*r),due=Math.min(payment,balance+interest);balance-=due-interest;total+=due;schedule.push({month:n,payment:due,interest,balance});}
 return {payment,total,fee:upfront,cost:total+upfront-principal,net:principal-upfront,schedule};
}
export function parseCSV(text,org){
 if(text.length>1000000)throw Error('file size');const rows=[];let row=[],field='',quote=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){field+='"';i++;}else quote=!quote;}else if(c===','&&!quote){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;}if(quote)throw Error('quotes');if(field||row.length){row.push(field);rows.push(row);}
 const headers=(rows.shift()||[]).map(s=>s.replace(/^\uFEFF/,'').trim().toLowerCase()),required=['id','date','type','category','party','amount'];if(required.some(h=>!headers.includes(h)))throw Error('headers');
 const records=[],errors=[];for(let n=0;n<rows.length;n++){const x=Object.fromEntries(headers.map((h,i)=>[h,rows[n][i]?.trim()||'']));const amount=/^\d+(\.\d{1,2})?$/.test(x.amount)?Math.round(Number(x.amount)*100):NaN;
 const t={sourceLine:n+2,id:x.id,org,date:x.date,type:x.type,category:x.category,party:x.party,description:x.description||'',amount};if(!t.id||!t.party||!t.category||!Number.isSafeInteger(amount)||amount<=0||!['income','expense'].includes(t.type)||!/^\d{4}-\d{2}-\d{2}$/.test(t.date)||isNaN(Date.parse(t.date))||new Date(t.date).toISOString().slice(0,10)!==t.date||t.date>AS_OF)errors.push(n+2);else records.push(t);}
 return {records,errors};
}
export function analyze(d,question,lang='en',context='',reportPeriod=null){validateData(d);if(typeof question!=='string'||question.length>2000)throw Error('invalid question');const q=question.toLowerCase(),s=reportPeriod?summary(d,reportPeriod.start,reportPeriod.end):summary(d),base=forecast(d),zh=lang==='zh',pick=(en,cn)=>zh?cn:en;const result={kind:'cash',summary:'',figures:[],evidence:[],assumptions:[],action:'cash'};
 if(/compare.*(collect|loan|options)|比较.*(催收|贷款|方案)/.test(q)){result.kind='options';result.summary=pick('Compare customer collections, agreed supplier timing and hypothetical borrowing using one shared baseline. Choose amounts and dates before deciding.','用同一基准比较客户回款、协商供应商付款时间与假设借款。请先选择金额与日期。');result.figures=[['cash',s.cash],['need',base.need]];result.evidence=base.events.map(e=>e.id);result.action='options';}
 else if(/next|doing today|接下来|今天/.test(q)){result.kind='cash';result.summary=base.first?pick(`A cash gap is projected on ${base.first.date}. Review the largest upcoming bill and follow up on overdue customer payments.`,`预计${base.first.date}出现现金缺口。请核查近期最大账单并跟进逾期客户回款。`):pick('No cash deficit is projected in the base case. Review overdue payments and test a stress scenario before new spending.','基准情景未预计现金赤字。请核查逾期回款，并在新增支出前测试压力情景。');result.figures=[['cash',s.cash],['need',base.need]];result.evidence=base.events.map(e=>e.id);}
 else if(/hire|employee|员工|招聘|工资/.test(q)){result.kind='hiring';result.summary=pick('What is the total monthly payroll cost, including employer costs? Enter it in the scenario workspace to test affordability.','请提供包含雇主成本的每月新增薪酬总额，然后在情景工作区评估负担能力。');result.figures=[['cash',s.cash],['need',base.need]];result.action='cash';}
 else if(/(customer|客户).*(late|delay|延迟)|延迟.*付款/.test(q)){const match=q.match(/(\d+)\s*(days?|天)/),delayDays=match?Math.min(60,+match[1]):15;const top=d.invoices.filter(i=>i.kind==='receivable'&&outstanding(i)).sort((a,b)=>outstanding(b)-outstanding(a))[0];if(!top){result.kind='clarify';result.summary=pick('No outstanding customer invoice is available to delay.','没有可供延迟模拟的未结客户发票。');}else{const changed=structuredClone(d);changed.invoices.find(i=>i.id===top.id).expected=addDays(top.expected,delayDays);const f=forecast(changed);result.kind='scenario';result.summary=pick(`Delay the largest outstanding invoice ${top.id} by ${delayDays} days. This changes timing only; no invoice was edited.`,`将最大未结发票${top.id}延迟${delayDays}天，仅模拟时间变化；未修改发票。`);result.figures=[['minimum',f.min.cash],['impact',f.min.cash-base.min.cash],['need',f.need]];result.evidence=[top.id];result.action='cash';}}
 else if(/revenue.*(drop|decreas)|收入.*下降|stress|压力/.test(q)||(context==='scenario'&&/that|这样|它/.test(q))){const pct=q.match(/(\d+(?:\.\d+)?)\s*%/);const decline=pct?Math.min(100,+pct[1]):15;const f=forecast(d,{growth:-decline});result.kind='scenario';result.summary=pick(`A ${decline}% decline applies to projected new sales, not to existing invoices. The lowest projected cash balance changes by the amount below.`, `收入下降${decline}%仅作用于预计新增销售，不改变现有发票金额。最低预计现金余额的变化如下。`);result.figures=[['minimum',f.min.cash],['impact',f.min.cash-base.min.cash],['need',f.need]];result.evidence=[...base.events.map(e=>e.id)];result.assumptions=[pick('30-day historical daily sales × changed growth; costs held constant.','历史30天日均销售额乘以增长调整；成本保持不变。')];result.action='cash';}
 else if(/expense|spend|支出|费用|investigate|核查/.test(q)){const current=s.expenses,prev=reportPeriod?summary(d,addDays(reportPeriod.start,-(daysBetween(reportPeriod.start,reportPeriod.end)+1)),addDays(reportPeriod.start,-1)).expenses:summary(d,addDays(AS_OF,-59),addDays(AS_OF,-30)).expenses;const dup=duplicates(d.transactions.filter(t=>t.org===d.org&&t.type==='expense'));result.kind='expenses';result.summary=pick('Start with same-date, same-vendor, same-amount records. These are potential duplicates, not confirmed fraud.','优先核查同一天、同一供应商、同一金额的记录。这些是可能的重复记录，并非已确认的欺诈。');result.figures=[['expenses',current],['previous',prev],['change',current-prev]];result.evidence=dup.flat().map(t=>t.id);result.action='expenses';}
 else if(/invoice|owe|customer|collect|发票|欠款|客户|跟进/.test(q)){const rows=d.invoices.filter(i=>i.org===d.org&&i.kind==='receivable'&&outstanding(i)).sort((a,b)=>outstanding(b)-outstanding(a));result.kind='invoices';result.summary=pick('Follow up on overdue invoices before assuming new borrowing. Expected payment dates are assumptions, not promises.','在考虑新增借款前，先跟进逾期发票。预计到账日期是假设，不是承诺。');result.figures=[['ar',s.ar],['overdue',s.overdue]];result.evidence=rows.map(i=>i.id);result.action='invoices';}
 else if(/financ|capital|loan|融资|营运资金|贷款/.test(q)){result.kind='financing';result.summary=pick('The funding gap includes the cash deficit and your minimum reserve. Compare collecting receivables against borrowing before choosing. Terms in the calculator are hypothetical, not lender offers.','资金缺口包含现金短缺和最低储备要求。请先比较催收与借款方案。计算器中的条款是假设，并非贷款机构报价。');result.figures=[['shortfall',base.shortfall],['reserve',base.reserve],['need',base.need]];result.evidence=base.events.map(e=>e.id);result.action='financing';}
 else if(/quarter|季度/.test(q)){const now=summary(d,'2026-10-01',AS_OF),prev=summary(d,'2026-07-01','2026-09-30');result.kind='comparison';result.summary=pick('The current quarter is incomplete and the prior quarter begins before available records. A like-for-like full-quarter comparison is not supported.','本季度尚未结束，且上一季度的起始日期早于现有记录。无法进行完整季度的同口径比较。');result.figures=[['revenue',now.revenue],['previous',prev.revenue]];result.evidence=now.transactions.slice(-4).map(t=>t.id);result.assumptions=[pick('Partial periods; not comparable growth.','数据期间不完整；不计算可比增长率。')];}
 else if(/cash|enough|situation|short|现金|财务|足够|余额|why|为什么|explain|解释/.test(q)){result.summary=base.first?pick(`Cash is projected to turn negative on ${base.first.date}. Prioritize collection and review the timing of the largest supplier obligation.`,`预计现金将在${base.first.date}转为负数。优先跟进回款，并核查最大供应商付款的时间。`):pick('No cash deficit is projected in the base case. Check the minimum reserve and stress scenario before committing to new costs.','基准情景未预计出现现金赤字。在承诺新增成本前，请检查最低储备和压力情景。');result.figures=[['cash',s.cash],['minimum',base.min.cash],['need',base.need]];result.evidence=base.events.map(e=>e.id);}
 else {result.kind='clarify';result.summary=pick('I can evaluate cash flow, receivables, expenses, hiring costs and financing. Which decision and time horizon do you want to test?','我可以评估现金流、应收款、支出、招聘成本和融资。您希望评估哪项决策以及多长的时间范围？');result.action='copilot';}
 if(!result.assumptions.length)result.assumptions=[pick('Forecast: 30-day daily sales and operating-cost averages; scheduled bills, recurring payroll and rent; receivables on their expected dates.','预测：采用过去30天销售与运营成本日均值；计入到期账单、定期工资和租金；应收款按预计日期到账。')];
 result.uncertainty=pick('Synthetic records as of 13 Oct 2026. Payment timing may change. Forecasts are deterministic scenarios, not probabilities.','截至2026年10月13日的模拟记录。付款时间可能变化。预测为确定性情景，不代表概率。');result.evidence=[...new Set(result.evidence)];return result;
}

export function moneyInput(value){const s=String(value).trim();if(!/^\d+(\.\d{1,2})?$/.test(s))throw Error('invalid amount');const [whole,fraction='']=s.split('.'),amount=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(!Number.isSafeInteger(amount)||amount<=0||amount>100000000)throw Error('invalid amount');return amount;}
export function recordQuickEntry(d,input){
 validateData(d);if(!input||!['income','expense'].includes(input.type)||typeof input.party!=='string'||!input.party.trim()||input.party.length>100||typeof input.category!=='string'||input.category.length>40||typeof input.id!=='string'||d.transactions.some(t=>t.id===input.id)||typeof input.note!=='string'||input.note.length>300)throw Error('invalid entry');
 const amount=moneyInput(input.amount),next=structuredClone(d),invoice=input.invoiceId?next.invoices.find(i=>i.id===input.invoiceId&&i.org===d.org):null;
 if(input.invoiceId&&(!invoice||invoice.kind!==(input.type==='income'?'receivable':'payable')||amount>outstanding(invoice)))throw Error('invalid invoice settlement');
 const tx={id:input.id,org:d.org,date:input.date,type:input.type,party:input.party.trim(),category:invoice?'settlement':input.category,description:input.note,amount,paymentMethod:input.method||'unspecified',createdVia:'quick',createdAt:new Date().toISOString(),...(invoice?{invoiceId:invoice.id}:{})};
 next.transactions.push(tx);if(invoice)invoice.paid+=amount;next.lastQuickEntry=tx.id;next.audit.unshift({date:tx.createdAt,action:'quick_entry',record:tx.id});next.audit=next.audit.slice(0,200);for(const c of next.chats){delete c.aiExplanation;delete c.live;}
 validateData(next);return next;
}
export function undoQuickEntry(d,id){
 validateData(d);const next=structuredClone(d),tx=next.transactions.find(t=>t.id===id&&t.org===d.org);
 if(!tx||tx.createdVia!=='quick'||tx.voidedAt||tx.reconciled||tx.locked||tx.usedInConsequentialAction)throw Error('undo unavailable');
 tx.voidedAt=new Date().toISOString();if(tx.invoiceId){const i=next.invoices.find(i=>i.id===tx.invoiceId);if(!i||i.paid<tx.amount)throw Error('undo unavailable');i.paid-=tx.amount;}
 next.audit.unshift({date:tx.voidedAt,action:'quick_undo',record:tx.id});next.audit=next.audit.slice(0,200);next.lastQuickEntry=null;for(const c of next.chats){delete c.aiExplanation;delete c.live;}validateData(next);return next;
}
export function compareActions(d,input,baseOptions={}){
 validateData(d);const {invoiceId,percent=100,collectionDays=1,collectionCost=0,billId,deferralDays=14,loanTerms}=input;
 const opts={...baseOptions,days:90},base=forecast(d,opts),collection=invoiceId?{id:invoiceId,percent,days:collectionDays,cost:collectionCost}:null,billTiming=billId?{id:billId,days:deferralDays}:null;
 const loan=loanTerms?financing(loanTerms.principal,loanTerms.apr,loanTerms.months,loanTerms.fee):null;
 const project=f=>({...f,cash7:f.points[7].cash,cash30:f.points[30].cash,cash90:f.points[90].cash,changeTomorrow:f.points[1].cash-base.points[1].cash,firstDate:f.first?.date||null});
 return {base:project(base),collect:collection?project(forecast(d,{...opts,collection})):null,defer:billTiming?project(forecast(d,{...opts,billTiming})):null,borrow:loan?project(forecast(d,{...opts,loan:loan.net,repayment:loan.schedule.map(x=>x.payment)})):null,combined:project(forecast(d,{...opts,collection,billTiming,...(loan?{loan:loan.net,repayment:loan.schedule.map(x=>x.payment)}:{})})),loan,collection,billTiming};
}
