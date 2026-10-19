import assert from 'node:assert/strict';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
import {installTourDOM} from './helpers/tour-dom.mjs';import {createRenderHandler} from '../src/render-adapter.mjs';
const dom=installTourDOM();Object.assign(globalThis,{location:{hash:'#account',protocol:'https:'},innerWidth:390});dom.storage.set('finora-lang','en');dom.storage.set('finora-welcome-v4:guest','seen');
const user={id:'11111111-1111-4111-8111-111111111111',email:'owner@example.test',email_confirmed_at:'2026-10-18'};
dom.storage.set('finora-welcome-v4:'+user.id,'seen');
const origin='https://finora.test',csrf='real-test-csrf',cookies='__Host-finora_access=test-access; __Host-finora_refresh=test-refresh; __Host-finora_csrf='+csrf;
let logoutStatus=null,cleared=[],upstreamLogout=0,logoutRequests=0;
const handler=createRenderHandler({SUPABASE_URL:'https://project.supabase.co',SUPABASE_PUBLISHABLE_KEY:'test-public',SUPABASE_SECRET_KEY:'test-private',APP_ORIGIN:origin},{worker:{fetch:()=>Response.json({})},fetcher:async(url,opt={})=>{
 const p=new URL(url).pathname;if(p==='/auth/v1/user')return Response.json(user);if(p==='/auth/v1/logout'){upstreamLogout++;return new Response(null,{status:204});}throw Error('Unexpected upstream request '+p);
}});
globalThis.fetch=async(url,opt={})=>{
 if(url==='/api/status')return Response.json({accounts:true,identityMode:'supabase',authenticated:true,mode:'configured'});
 if(url==='/api/session')return Response.json({user,csrf,businesses:[]});
 if(url==='/api/logout'){
  logoutRequests++;const headers=new Headers(opt.headers);headers.set('origin',origin);headers.set('cookie',cookies);
  const r=await handler(new Request(origin+url,{...opt,headers}));logoutStatus=r.status;cleared=r.headers.getSetCookie();return r;
 }
 throw Error('Unexpected UI request '+url);
};
let source=fs.readFileSync('src/app.js','utf8').replace(/from '\/(.*?)'/g,(_,f)=>'from '+JSON.stringify(pathToFileURL(process.cwd()+'/src/'+f).href));source+='\nexport {initialAccountReady};export const showAccount=()=>{page="account";render();};export const state=()=>({cloudIdentity,aiStatus,data});';
const app=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));await app.initialAccountReady;
app.showAccount();const before=JSON.stringify(app.state().data);assert.ok(app.state().cloudIdentity.user);
document.querySelector('[data-action="signout"]').click();await dom.tick();await dom.tick();
assert.equal(logoutStatus,200,'the real UI request must satisfy the actual adapter JSON contract');
assert.equal(logoutRequests,1);assert.equal(upstreamLogout,1);assert.equal(cleared.length,3);assert.ok(cleared.every(x=>x.includes('Max-Age=0')));
assert.equal(app.state().cloudIdentity,null);assert.equal(app.state().aiStatus.authenticated,false);assert.ok(document.querySelector('#authform'));assert.equal(JSON.stringify(app.state().data),before);
console.log('PASS actual Sign out UI → accountAPI → production Render adapter → simulated Auth logout: JSON accepted, cookies cleared, UI signed out, guest records preserved');
