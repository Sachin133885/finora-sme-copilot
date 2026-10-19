import assert from 'node:assert/strict';
import {createRenderHandler} from '../src/render-adapter.mjs';
const user={id:'11111111-1111-4111-8111-111111111111',email:'owner@example.test',email_confirmed_at:'2026-10-18'};
const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_PUBLISHABLE_KEY:'test-public',SUPABASE_SECRET_KEY:'test-private',APP_ORIGIN:'https://finora.test'};
let expired=false,revokeFails=false,rejectLogin=false;const events=[];
const fetcher=async(url,opt={})=>{const u=new URL(url);events.push(u.pathname);
 if(u.pathname==='/auth/v1/token'){
  if(u.searchParams.get('grant_type')==='refresh_token'&&expired)return Response.json({error:'expired'},{status:401});
  if(rejectLogin)return Response.json({code:'invalid_credentials',msg:'private upstream text'},{status:400});
  return Response.json({access_token:'test-access',refresh_token:'test-refresh',expires_in:3600});
 }
 if(u.pathname==='/auth/v1/user')return expired?Response.json({error:'expired'},{status:401}):Response.json(user);
 if(u.pathname==='/auth/v1/logout')return new Response(null,{status:revokeFails?503:204});
 if(u.pathname==='/rest/v1/rpc/finora_workspace')return Response.json({status:200,businesses:[]});
 throw Error('unexpected upstream');
};
const handle=createRenderHandler(env,{worker:{fetch:()=>Response.json({})},fetcher});
const call=(path,body={},headers={})=>handle(new Request('https://finora.test'+path,{method:'POST',headers:{origin:env.APP_ORIGIN,'content-type':'application/json',...headers},body:JSON.stringify(body)}));
let r=await call('/api/login',{email:user.email,password:'olderpwd'});
assert.equal(r.status,200,'existing shorter Supabase passwords must reach the Auth verifier');
const login=await r.json(),cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
assert.equal((await call('/api/register',{email:user.email,password:'olderpwd'})).status,400,'new passwords keep the 12-character requirement');
rejectLogin=true;r=await call('/api/login',{email:user.email,password:'wrong-password'});const rejected=await r.json();assert.equal(rejected.code,'invalid_credentials');assert.ok(!JSON.stringify(rejected).includes('private upstream'));rejectLogin=false;
assert.equal((await call('/api/logout',{}, {cookie,'x-csrf-token':'wrong'})).status,403,'valid signed-in sessions still need CSRF');
revokeFails=true;r=await call('/api/logout',{}, {cookie,'x-csrf-token':login.csrf});assert.equal(r.status,200,'upstream revocation failure must still clear this browser session');assert.equal((await r.json()).sessionsRevoked,false);assert.ok(r.headers.getSetCookie().every(x=>x.includes('Max-Age=0')));
expired=true;r=await call('/api/logout',{}, {cookie,'x-csrf-token':login.csrf});assert.equal(r.status,200,'expired sessions can still sign out');assert.equal(r.headers.getSetCookie().length,3);
r=await call('/api/logout');assert.equal(r.status,200,'logout is idempotent');assert.equal(r.headers.getSetCookie().length,3);
assert.ok(!events.includes('/api/business'));
console.log('PASS login password compatibility, safe error codes, CSRF and idempotent local logout with expired or failed upstream sessions');
