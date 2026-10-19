import fs from 'node:fs';import assert from 'node:assert/strict';
const elements=new Map(),listeners={};const el=k=>{if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){},toggle(){}},focus(){},querySelectorAll(){return[]}});return elements.get(k);};
globalThis.document={documentElement:{lang:''},querySelector:el,addEventListener:(k,f)=>{const prior=listeners[k];listeners[k]=e=>{prior?.(e);f(e);}}};globalThis.localStorage={getItem(){return null},setItem(){}};globalThis.window={addEventListener(){}};globalThis.innerWidth=390;globalThis.location={hash:'#overview',protocol:'file:'};globalThis.fetch=()=>{throw Error('No network should be used')};
const html=fs.readFileSync('Finora-mobile.html','utf8');const code=html.match(/<script type="module">([\s\S]*)<\/script>/)[1];assert.ok(!html.includes('src="/app.js"'));assert.ok(!code.includes("from '/engine.js'"));
await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));assert.ok(el('#app').innerHTML.includes('今日财务状况'));listeners.click({target:{closest:selector=>selector==='[data-action]'?({dataset:{action:'nav',page:'options'}}):null}});assert.ok(el('#app').innerHTML.includes('协商供应商付款时间'));assert.ok(!el('#app').innerHTML.includes('undefined'));console.log('Standalone HTML initializes and routes offline; no network dependency.');

const standaloneRefresh=fs.readFileSync('Finora-mobile.html','utf8');
assert.ok(standaloneRefresh.includes('FINORA_WALK_ASSET="data:image/png;base64,'),'offline motion asset must be embedded');
assert.ok(standaloneRefresh.includes('--dragon-walk-art'),'offline sprite presentation must be included');
