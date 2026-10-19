// Finora 1.2 behavioral integration. Layout and animation appearance need a real browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {installTourDOM} from './helpers/tour-dom.mjs';
import {forecast} from '../src/engine.js';
const dom=installTourDOM();document.documentElement.style={setProperty(){}};
Object.assign(globalThis,{location:{hash:'#overview',protocol:'file:'},innerWidth:390});dom.storage.set('finora-lang','en');dom.storage.set('finora-welcome-v4:guest','seen');
const source=fs.readFileSync('src/app.js','utf8').replace(/from '\/(.*?)'/g,(_,f)=>'from '+JSON.stringify(pathToFileURL(process.cwd()+'/src/'+f).href))+`\nexport {render,initialAccountReady};export const inspect=()=>({data,scenario,page});`;
const app=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));await app.initialAccountReady;
const q=s=>document.querySelector(s),click=(action,extra={})=>{const n=document.createElement('button');n.dataset.action=action;for(const[k,v]of Object.entries(extra))n.dataset[k]=v;document.body.append(n);n.click();n.remove();};
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'CNY',maximumFractionDigits:0}).format(n/100);
const ledger=JSON.stringify(app.inspect().data);
assert.ok(q('.dragon-stage'));assert.ok(q('.dragon-walker'));assert.equal(document.querySelectorAll('.home-tools .brand-icon').length,4);assert.equal(q('.content').querySelector('[data-action="quickincome"]'),null);
q('.dragon-stage').click();assert.equal(JSON.stringify(app.inspect().data),ledger,'replay must not mutate records');
click('nav',{page:'transactions'});assert.equal(document.querySelectorAll('.record-tools .brand-icon').length,4);assert.equal(document.querySelectorAll('.record-flow li').length,3);
click('nav',{page:'cash'});
for(const days of [30,60,90]){
 click('horizon',{days:String(days)});assert.equal(app.inspect().scenario.days,days);
 const f=forecast(app.inspect().data,app.inspect().scenario);assert.match(q('#scenario-kpis').textContent,new RegExp(money(f.min.cash).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.ok(q('#scenario-kpis').textContent.includes(money(f.need)));assert.ok(q('#scenario-chart svg'));assert.equal(document.querySelectorAll('.period-pills [aria-pressed="true"]').length,1);
}
click('preset',{preset:'stress'});assert.equal(q('.forecast-toolbar [data-preset="stress"]').getAttribute('aria-pressed'),'true');
const slider=q('#delay');slider.value='11';dom.dispatch({type:'input',target:slider});assert.equal(document.querySelectorAll('.forecast-toolbar [data-action="preset"][aria-pressed="true"]').length,0,'custom assumptions must clear preset selection');const f=forecast(app.inspect().data,app.inspect().scenario);assert.ok(q('#scenario-kpis').textContent.includes(money(f.need)),'live slider metrics must use the updated engine output');
click('nav',{page:'copilot'});const composer=q('#chatinput');composer.value='My unsent question';const chats=app.inspect().data.chats.length;click('focuschat');assert.equal(q('#chatinput'),composer);assert.equal(composer.value,'My unsent question');assert.equal(document.activeElement,composer);assert.equal(app.inspect().data.chats.length,chats,'start conversation only focuses; it must not submit');assert.equal(q('[data-action="microphone"]'),null);
click('more');assert.equal(document.querySelectorAll('.directory-group').length,5);assert.equal(new Set(document.querySelectorAll('.directory-tools .tool-row').map(n=>n.dataset.page)).size,20);assert.equal(document.querySelectorAll('.more-filters button').length,4);
click('morefilter',{filter:'business'});assert.equal(document.querySelectorAll('.directory-group').length,1);assert.equal(document.querySelectorAll('.directory-tools .tool-row').length,3);const search=q('#moresearch');search.value='invoice';dom.dispatch({type:'input',target:search});assert.ok(q('#more-results').textContent.includes('No tools found'),'search must respect the chosen category');click('morefilter',{filter:'all'});assert.ok(q('.tool-row[data-page="invoices"]'));search.value='';dom.dispatch({type:'input',target:search});assert.equal(document.querySelectorAll('.directory-group').length,5);click('closemodal');assert.equal(q('#chatinput'),composer);assert.equal(composer.value,'My unsent question');assert.equal(JSON.stringify(app.inspect().data),ledger);
for(const lang of ['en','zh']){click('language',{lang});for(const page of ['overview','transactions','cash','copilot','invoices','expenses','reports','financing','settings']){click('nav',{page});assert.ok(!q('#app').innerHTML.includes('undefined'));assert.ok(!q('#app').innerHTML.includes('NaN'));}}
const css=fs.readFileSync('src/experience.css','utf8');assert.match(css,/@keyframes loong-frames/);assert.match(css,/background-size:300% 200%/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/\.dragon-stage\{[^}]*overflow:hidden/);assert.match(css,/\.keyboard-open/);
console.log('PASS 1.2 native recording cards, immutable dragon replay, real forecast metrics across horizons, live custom assumptions, focus-only assistant CTA, filtered 20-route directory, draft preservation and bilingual workspace rendering (simulated DOM)');
