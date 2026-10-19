// Behavioral checks for the 1.1 UI refresh. Geometry requires a real browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {installTourDOM} from './helpers/tour-dom.mjs';
const dom=installTourDOM();
const attrs={};document.documentElement.style={};document.documentElement.setAttribute=(k,v)=>attrs[k]=v;
Object.assign(globalThis,{location:{hash:'#overview',protocol:'file:'},innerWidth:390});
dom.storage.set('finora-lang','en');dom.storage.set('finora-welcome-v4:guest','seen');
const source=fs.readFileSync('src/app.js','utf8').replace(/from '\/(.*?)'/g,(_,f)=>'from '+JSON.stringify(pathToFileURL(process.cwd()+'/src/'+f).href))+`\nexport {render,ask,initialAccountReady,openFinoraGuide};export const state=()=>({data,org,page});export const role=r=>{accountState.user=r?{id:'viewer-id'}:null;accountState.role=r||'owner';};`;
const app=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));await app.initialAccountReady;
const click=(action,extra={})=>{const n=document.createElement('button');n.dataset.action=action;for(const [k,v]of Object.entries(extra))n.dataset[k]=v;document.body.append(n);n.click();n.remove();};
const q=s=>document.querySelector(s);
assert.equal(attrs['data-theme'],'light');
const recordTools=['[data-action="nav"][data-page="pdfreceipts"]','[data-action="quickincome"]','[data-action="quickexpense"]','[data-action="nav"][data-page="imports"]'];
for(const language of ['en','zh']){
 click('language',{lang:language});click('nav',{page:'overview'});
 for(const selector of recordTools)assert.equal(q('.content').querySelector(selector),null,'Home must not duplicate recording tools');
 assert.ok(q('.home-hero .finora-dragon'));assert.ok(q('.topbar [data-action="toggletheme"]'));assert.equal(q('.topbar [data-action="opencopilot"]'),null);
 click('nav',{page:'transactions'});for(const selector of recordTools)assert.ok(q('.record-tools').querySelector(selector),selector);
}
click('language',{lang:'en'});click('nav',{page:'settings'});const name=q('#bizname');name.value='Unsaved company name';const before=JSON.stringify(app.state());const keys=[...dom.storage.keys()];
click('toggletheme');assert.equal(attrs['data-theme'],'dark');assert.equal(q('#bizname'),name,'theme toggle must not reconstruct forms');assert.equal(name.value,'Unsaved company name');assert.equal(JSON.stringify(app.state()),before);assert.deepEqual([...dom.storage.keys()].filter(k=>!keys.includes(k)),['finora-appearance']);assert.equal(q('[data-action="toggletheme"]').getAttribute('aria-pressed'),'true');
click('toggletheme');assert.equal(attrs['data-theme'],'light');
click('nav',{page:'copilot'});assert.equal(document.querySelectorAll('#chatinput').length,1);assert.ok(q('.copilot.inline'));assert.ok(q('.assistant-empty .finora-dragon'));
const input=q('#chatinput');input.value='我想了解现金';let count=app.state().data.chats.length;
dom.dispatch({type:'keydown',key:'Enter',isComposing:true,target:input});assert.equal(app.state().data.chats.length,count,'Chinese composition must not submit');
dom.dispatch({type:'keydown',key:'Enter',keyCode:229,target:input});assert.equal(app.state().data.chats.length,count);
click('nav',{page:'overview'});click('nav',{page:'copilot'});assert.equal(q('#chatinput').value,'我想了解现金','navigation must retain an unsent question');
click('nav',{page:'overview'});dom.dispatch({type:'change',target:Object.assign(q('#business'),{value:'guangzhou'})});click('nav',{page:'copilot'});assert.equal(q('#chatinput').value,'','drafts are isolated by business');
dom.dispatch({type:'change',target:Object.assign(q('#business'),{value:'shenzhen'})});click('nav',{page:'copilot'});assert.equal(q('#chatinput').value,'我想了解现金');
await app.ask('Will I have enough cash?');assert.equal(app.state().data.chats.length,count+1);assert.equal(q('#chatinput').value,'');assert.ok(q('.answer .finora-dragon'));assert.ok(q('.evidence-details'));assert.equal(document.querySelectorAll('#chatinput').length,1);
app.role('viewer');click('nav',{page:'transactions'});assert.equal(document.querySelectorAll('.record-tool').length,4);for(const n of document.querySelectorAll('.record-tool'))assert.equal(n.disabled,true);
app.role(null);const financeBefore=JSON.stringify(app.state().data);app.openFinoraGuide('welcome');assert.ok(q('.guide-mark img'));q('[data-guide="quick"]').click();await dom.tick();assert.ok(q('.guide-companion img'));q('[data-guide="exit"]').click();assert.equal(JSON.stringify(app.state().data),financeBefore,'dragon tour cannot write financial data');
console.log('PASS bilingual Record migration, header theme toggle, light default, draft/ledger isolation, IME handling, single assistant, viewer tools and read-only dragon guide (simulated DOM)');
