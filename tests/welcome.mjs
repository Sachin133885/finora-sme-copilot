import assert from 'node:assert/strict';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
import {installTourDOM} from './helpers/tour-dom.mjs';import {welcomeSeen} from '../src/tour.js';
const source=fs.readFileSync('src/app.js','utf8').replace(/from '\/(.*?)'/g,(_,file)=>'from '+JSON.stringify(pathToFileURL(process.cwd()+'/src/'+file).href))+'\nexport {openFinoraGuide}; export const guide=()=>tourRuntime.instance;';
async function run({seen=false,focused=false,user='first-user',lang='en',run=0}={}){
 const dom=installTourDOM();Object.assign(globalThis,{location:{hash:'#overview',protocol:'https:'},innerWidth:390});dom.storage.set('finora-lang',lang);if(seen)dom.storage.set('finora-welcome-v4:'+user,'seen');
 globalThis.fetch=async url=>new Response(JSON.stringify(url==='/api/status'?{accounts:true,identityMode:'chatgpt',mode:'demo'}:{user:{id:user,email:'test@example.test'},businesses:[]}));
 if(focused)dom.document.querySelector('#unsaved').focus();else dom.document.activeElement=dom.document.body;
 const app=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// run '+run).toString('base64'));await new Promise(r=>setTimeout(r,20));return {dom,app};
}
let current=await run({run:1});assert.equal(current.app.guide().state.mode,'welcome');assert.equal(welcomeSeen(localStorage,'first-user'),true);assert.equal(welcomeSeen(localStorage,'guest'),false,'initial identity must be resolved before marking welcome');assert.match(document.querySelector('.guide-card').textContent,/Welcome to Finora/);document.querySelector('[data-guide="exit"]').click();
current=await run({seen:true,run:2});assert.equal(document.querySelector('.finora-guide'),null,'returning user enters directly');current.app.openFinoraGuide();assert.equal(current.app.guide().state.mode,'menu');document.querySelector('[data-guide="welcome"]').click();assert.equal(current.app.guide().state.mode,'welcome');current.app.guide().close();
current=await run({user:'other-user',lang:'zh',run:3});assert.equal(current.app.guide().state.mode,'welcome');assert.match(document.querySelector('.guide-card').textContent,/欢迎使用融财/);current.app.guide().close();
current=await run({focused:true,user:'typing-user',run:4});assert.equal(document.querySelector('.finora-guide'),null,'do not interrupt input with automatic welcome');
console.log('PASS actual bootstrap first visit, returning visit, account isolation, Chinese welcome, replay and no interruption of focused input (simulated DOM)');
