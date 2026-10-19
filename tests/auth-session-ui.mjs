import assert from 'node:assert/strict';import fs from 'node:fs';import {pathToFileURL} from 'node:url';import {installTourDOM} from './helpers/tour-dom.mjs';
const dom=installTourDOM();Object.assign(globalThis,{location:{hash:'#account',protocol:'https:'},innerWidth:390});dom.storage.set('finora-lang','en');dom.storage.set('finora-welcome-v4:guest','seen');
globalThis.FormData=class{constructor(f){this.vals=f.vals||{}}*[Symbol.iterator](){yield*Object.entries(this.vals)}};
let loginResolve,logins=0,sessionUser=null,logoutCalls=0;
globalThis.fetch=async(url,opt={})=>{
 if(url==='/api/status')return Response.json({accounts:true,identityMode:'supabase',authenticated:false,mode:'configured'});
 if(url==='/api/session')return Response.json({user:sessionUser});
 if(url==='/api/login'){logins++;return new Promise(r=>{loginResolve=r;});}
 if(url==='/api/logout'){logoutCalls++;return Response.json({ok:true});}
 throw Error('unexpected '+url);
};
let source=fs.readFileSync('src/app.js','utf8').replace(/from '\/(.*?)'/g,(_,f)=>'from '+JSON.stringify(pathToFileURL(process.cwd()+'/src/'+f).href));
source+=`\nexport {initialAccountReady,loadCloudIdentity};export const state=()=>({data,cloudIdentity,aiStatus});export const authenticated=()=>{aiStatus.authenticated=true;};export const language=()=>{lang='zh';render();};export const cloud=()=>{cloudIdentity={user:{id:'verified-user',email:'owner@example.test'},csrf:'csrf'};accountState={...accountState,user:cloudIdentity.user,csrf:'csrf',activeOwner:'verified-user',role:'owner',sync:'synced'};aiStatus.authenticated=true;page='account';render();};`;
const app=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));await app.initialAccountReady;
const original=JSON.stringify(app.state().data);let f=document.querySelector('#authform');assert.equal(document.querySelector('#authpassword').getAttribute('minlength'),'1','login must not apply signup length rules');
f.vals={email:'owner@example.test',password:'olderpwd',mode:'login'};dom.dispatch({type:'submit',target:f});dom.dispatch({type:'submit',target:f});await dom.tick();assert.equal(logins,1,'double submission must issue one login request');
loginResolve(Response.json({code:'invalid_credentials',error:'Unable to sign in'},{status:400}));await dom.tick();assert.match(document.querySelector('#autherror').textContent,/email.*password|password.*email/i,'show a useful inline error');assert.equal(f.vals.email,'owner@example.test');
dom.dispatch({type:'submit',target:f});await dom.tick();assert.equal(logins,2,'failed request must permit a retry');
loginResolve(Response.json({user:{id:'verified-user',email:'owner@example.test'},csrf:'csrf',businesses:[]}));await dom.tick();assert.ok(app.state().cloudIdentity.user);assert.equal(JSON.stringify(app.state().data),original,'login preserves guest records');
const signout=document.querySelector('[data-action="signout"]');signout.click();signout.click();await dom.tick();assert.equal(logoutCalls,1,'double signout must issue one request');assert.equal(app.state().cloudIdentity,null);assert.equal(app.state().aiStatus.authenticated,false);assert.ok(document.querySelector('#authform'));assert.equal(JSON.stringify(app.state().data),original);
app.authenticated();await app.loadCloudIdentity();assert.equal(app.state().aiStatus.authenticated,false,'missing session must clear stale authenticated status');
let mode=document.querySelector('#authmode');mode.value='register';dom.dispatch({type:'change',target:mode});assert.equal(document.querySelector('#authpassword').getAttribute('minlength'),'12');assert.equal(document.querySelector('#authpassword').getAttribute('autocomplete'),'new-password');
f=document.querySelector('#authform');f.vals={email:'owner@example.test',password:'short',mode:'register'};dom.dispatch({type:'submit',target:f});await dom.tick();assert.match(document.querySelector('#autherror').textContent,/12/);assert.equal(logins,2);
app.language();f=document.querySelector('#authform');f.vals={email:'owner@example.test',password:'olderpwd',mode:'login'};dom.dispatch({type:'submit',target:f});await dom.tick();loginResolve(Response.json({code:'invalid_credentials',error:'Unable to sign in'},{status:400}));await dom.tick();assert.match(document.querySelector('#autherror').textContent,/邮箱.*密码/);assert.equal(JSON.stringify(app.state().data),original);
const guest=structuredClone(app.state().data);guest.settings.reserve=987600;dom.storage.set('finora-shenzhen',JSON.stringify(guest));app.cloud();document.querySelector('[data-action="signout"]').click();await dom.tick();assert.equal(app.state().data.settings.reserve,987600,'leaving cloud returns to the saved guest workspace, not a fresh synthetic reset');assert.equal(app.state().cloudIdentity,null);
console.log('PASS duplicate-submit protection, inline retryable errors, login/logout UI and authoritative session state without guest ledger writes (simulated DOM)');
