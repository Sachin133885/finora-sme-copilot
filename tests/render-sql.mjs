// Optional full SQL execution: FINORA_PGLITE_MODULE points to an installed PGlite ESM entry.
// The standard suite runs contract checks; explicit integration mode executes the database.
import assert from 'node:assert/strict';import fs from 'node:fs';import {seed} from '../src/engine.js';
const sql=fs.readFileSync('supabase/finora.sql','utf8');
assert.ok(sql.includes('enable row level security'));assert.ok(sql.includes('from public, anon, authenticated'));assert.ok(sql.includes('to service_role'));assert.ok(!/drop\s+(table|schema)/i.test(sql));
let sqlEngine;try{sqlEngine=await import(process.env.FINORA_PGLITE_MODULE||'@electric-sql/pglite');}catch{console.log('PASS SQL privilege/schema contract checks; actual SQL integration not run. Install dev dependencies to execute it.');process.exit(0);}
const {PGlite}=sqlEngine,db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);`);
await db.exec(sql);await db.exec(sql); // additive and repeatable
const ids={owner:'11111111-1111-4111-8111-111111111111',viewer:'22222222-2222-4222-8222-222222222222',other:'33333333-3333-4333-8333-333333333333'};
for(const [name,id] of Object.entries(ids))await db.query('insert into auth.users values($1,$2,now())',[id,name+'@example.test']);
const emails=Object.fromEntries(Object.keys(ids).map(k=>[k,k+'@example.test']));
async function call(name,action,values={}){const a=[ids[name],emails[name],action,values.owner||ids.owner,values.key||'shenzhen',values.data===undefined?null:JSON.stringify(values.data),values.revision??null,values.target??null,values.role??null];const r=await db.query('select public.finora_workspace($1::uuid,$2::text,$3::text,$4::uuid,$5::text,$6::jsonb,$7::bigint,$8::text,$9::text) as result',a);return r.rows[0].result;}
assert.equal((await call('owner','initialize',{data:['shenzhen','guangzhou','chengdu'].map(seed)})).status,200);
assert.equal((await call('owner','list')).businesses.length,3);
assert.equal((await call('other','get')).status,403);
assert.equal((await call('owner','grant',{target:'viewer@example.test',role:'viewer'})).status,200);
assert.equal((await call('viewer','get')).role,'viewer');
assert.equal((await call('viewer','save',{data:seed('shenzhen'),revision:1})).status,403);
assert.equal((await call('viewer','grant',{target:'other@example.test',role:'accountant'})).status,403);
assert.equal((await call('owner','grant',{target:'viewer@example.test',role:'accountant'})).status,200);
const next=seed('shenzhen');next.settings.name='Persisted by accountant';
assert.equal((await call('viewer','save',{data:next,revision:1})).revision,2);
assert.equal((await call('owner','save',{data:next,revision:1})).status,409);
assert.equal((await call('owner','get')).data.settings.name,'Persisted by accountant');
await call('owner','initialize',{data:['shenzhen','guangzhou','chengdu'].map(seed)});assert.equal((await call('owner','get')).revision,2,'repeat initialize must not reset');
await db.query('update auth.users set email=$1 where id=$2',['renamed@example.test',ids.viewer]);emails.viewer='renamed@example.test';
ids.replacement='44444444-4444-4444-8444-444444444444';emails.replacement='viewer@example.test';await db.query('insert into auth.users values($1,$2,now())',[ids.replacement,emails.replacement]);
assert.equal((await call('viewer','get')).role,'accountant','grants follow the verified auth UUID');assert.equal((await call('replacement','get')).status,403,'a new account reusing the email must not inherit access');
assert.equal((await call('owner','members')).members[0].email,'renamed@example.test');
assert.equal((await call('owner','revoke',{target:'renamed@example.test'})).status,200);assert.equal((await call('viewer','get')).status,403);
assert.equal((await call('owner','grant',{target:'owner@example.test',role:'viewer'})).status,400);
assert.equal((await call('owner','audit')).events.length,4);
await call('owner','grant',{target:emails.viewer,role:'accountant'});
await db.query('update auth.users set email=$1 where id=$2',['owner-renamed@example.test',ids.owner]);emails.owner='owner-renamed@example.test';
await db.query('update auth.users set email=$1 where id=$2',['owner@example.test',ids.viewer]);emails.viewer='owner@example.test';
assert.equal((await call('owner','revoke',{target:emails.viewer})).status,200,'an old owner email must not prevent member revocation');assert.equal((await call('viewer','get')).status,403);
assert.equal((await call('owner','list')).businesses[0].owner_email,emails.owner);
await db.exec('set role anon');await assert.rejects(db.query('select * from finora_private.businesses'),/permission denied/);await assert.rejects(db.query(`select public.finora_workspace('${ids.owner}','owner@example.test','list')`),/permission denied/);
await db.exec('reset role;set role authenticated');await assert.rejects(db.query(`select public.finora_workspace('${ids.owner}','owner@example.test','list')`),/permission denied/);
await db.exec('reset role;set role service_role');assert.equal((await call('owner','get')).status,200);
await db.close();console.log('PASS actual PostgreSQL-compatible SQL execution, idempotence, private schema, service-only RPC, roles, isolation, revisions and non-destructive initialization');
