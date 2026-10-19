import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import fs from 'node:fs';
const mod=await import('../src/cloud-accounts.js').catch(()=>({}));assert.equal(typeof mod.cloudAccountRoute,'function','hosted accounts missing');
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('drizzle/0000_finora.sql','utf8'));
const DB={prepare(sql){let args=[];const p={bind(...v){args=v;return p;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};}};return p;},async batch(ps){db.exec('BEGIN');try{const a=[];for(const p of ps)a.push(await p.run());db.exec('COMMIT');return a;}catch(e){db.exec('ROLLBACK');throw e;}}};
const user=(id,email)=>({'oai-authenticated-user-id':id,'oai-authenticated-user-email':email});
async function call(path,method='GET',body=null,who=user('owner','owner@example.com')){const req=new Request('https://finora.example'+path,{method,headers:{...who,origin:'https://finora.example','content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return mod.cloudAccountRoute(req,{DB},body||{});}
assert.equal((await call('/api/business', 'GET',null,{})).status,401);
let r=await call('/api/initialize','POST');assert.equal(r.status,200);let s=await (await call('/api/session')).json();assert.equal(s.businesses.length,3);
let b=await (await call('/api/business?key=shenzhen')).json();assert.equal(b.role,'owner');assert.equal((await call('/api/business?owner=owner&key=shenzhen','GET',null,user('stranger','x@example.com'))).status,403);
assert.equal((await call('/api/members?key=shenzhen','POST',{email:'reader@example.com',role:'viewer'})).status,200);
const reader=user('reader','reader@example.com');assert.equal((await call('/api/business?owner=owner&key=shenzhen','GET',null,reader)).status,200);
assert.equal((await call('/api/business?owner=owner&key=shenzhen','PUT',{data:b.data,revision:b.revision},reader)).status,403);
b.data.settings.name='Updated';assert.equal((await call('/api/business?key=shenzhen','PUT',{data:b.data,revision:b.revision})).status,200);assert.equal((await call('/api/business?key=shenzhen','PUT',{data:b.data,revision:b.revision})).status,409);
assert.equal((await call('/api/members?key=shenzhen','POST',{email:'editor@example.com',role:'accountant'})).status,200);
assert.equal((await call('/api/members?owner=owner&key=shenzhen','POST',{email:'bad@example.com',role:'owner'},reader)).status,403);
assert.equal((await call('/api/members?key=shenzhen','DELETE',{email:'reader@example.com'})).status,200);assert.equal((await call('/api/business?owner=owner&key=shenzhen','GET',null,reader)).status,403);
console.log('PASS hosted identity, isolation, read-only grants, revocation, conflict protection and persistence');
