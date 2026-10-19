import {seed,profiles,validateData} from './engine.js';
const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function cloudAccountRoute(request,env,body={}){
 const url=new URL(request.url),path=url.pathname;if(!['/api/session','/api/initialize','/api/business','/api/members','/api/cloud-audit'].includes(path))return null;
 const id=request.headers.get('oai-authenticated-user-id'),email=(request.headers.get('oai-authenticated-user-email')||'').toLowerCase();
 if(!id||!email)return path==='/api/session'?reply({user:null,accounts:!!env.DB}):reply({error:'Sign in with ChatGPT'},401);
 if(!env.DB)return reply({error:'Cloud storage is not available',user:null,accounts:false},503);
 if(request.method!=='GET'&&request.headers.get('origin')!==url.origin)return reply({error:'Origin rejected'},403);
 const db=env.DB,owner=url.searchParams.get('owner')||id,key=url.searchParams.get('key')||'shenzhen',now=new Date().toISOString();
 if(!profiles.some(p=>p.id===key)||owner.length>200)return reply({error:'Invalid workspace'},400);
 const list=async()=>{const result=await db.prepare('SELECT b.owner,b.key,b.owner_email, CASE WHEN b.owner=? THEN \'owner\' ELSE m.role END AS role FROM finora_businesses b LEFT JOIN finora_members m ON m.owner=b.owner AND m.key=b.key AND m.email=? WHERE b.owner=? OR m.email=?').bind(id,email,id,email).all();return result.results;};
 if(path==='/api/session')return reply({user:{id,email},csrf:'platform-origin',businesses:await list(),accounts:true});
 if(path==='/api/initialize'&&request.method==='POST'){
  await db.batch(profiles.map(p=>db.prepare('INSERT OR IGNORE INTO finora_businesses(owner,key,owner_email,data,revision,updated_at) VALUES(?,?,?,?,1,?)').bind(id,p.id,email,JSON.stringify(seed(p.id)),now)));
  return reply({user:{id,email},csrf:'platform-origin',businesses:await list()});
 }
 const record=await db.prepare('SELECT * FROM finora_businesses WHERE owner=? AND key=?').bind(owner,key).first();
 if(!record)return reply({error:'Workspace not found'},404);
 const member=owner===id?{role:'owner'}:await db.prepare('SELECT role FROM finora_members WHERE owner=? AND key=? AND email=?').bind(owner,key,email).first();
 if(!member)return reply({error:'Access denied'},403);
 if(path==='/api/business'&&request.method==='GET')return reply({data:JSON.parse(record.data),revision:record.revision,role:member.role});
 if(path==='/api/business'&&request.method==='PUT'){
  if(member.role==='viewer')return reply({error:'Read-only access'},403);
  try{validateData(body.data);if(body.data.org!==key||JSON.stringify(body.data).length>1200000||!Number.isSafeInteger(body.revision))throw Error('data');}catch{return reply({error:'Invalid financial data'},400);}
  const event=crypto.randomUUID();
  const result=await db.batch([db.prepare('UPDATE finora_businesses SET data=?,revision=revision+1,updated_at=? WHERE owner=? AND key=? AND revision=?').bind(JSON.stringify(body.data),now,owner,key,body.revision),db.prepare('INSERT INTO finora_cloud_events(id,owner,key,actor,event,created_at) SELECT ?,?,?,?,?,? WHERE changes()=1').bind(event,owner,key,id,'save_records',now)]);
  return result[0].meta.changes?reply({revision:body.revision+1}):reply({error:'Conflict: another device saved first; export your local backup before loading the server copy.'},409);
 }
 if(path==='/api/cloud-audit'&&request.method==='GET'){const rows=await db.prepare('SELECT actor,event,created_at FROM finora_cloud_events WHERE owner=? AND key=? ORDER BY created_at DESC LIMIT 100').bind(owner,key).all();return reply({events:rows.results});}
 if(path==='/api/members'){
  if(member.role!=='owner')return reply({error:'Owner access required'},403);
  if(request.method==='GET'){const rows=await db.prepare('SELECT email,role FROM finora_members WHERE owner=? AND key=?').bind(owner,key).all();return reply({members:rows.results});}
  const target=String(body.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)||target===email)return reply({error:'Invalid member'},400);
  if(request.method==='POST'&&['accountant','viewer'].includes(body.role))await db.prepare('INSERT INTO finora_members(owner,key,email,role) VALUES(?,?,?,?) ON CONFLICT(owner,key,email) DO UPDATE SET role=excluded.role').bind(owner,key,target,body.role).run();
  else if(request.method==='DELETE')await db.prepare('DELETE FROM finora_members WHERE owner=? AND key=? AND email=?').bind(owner,key,target).run();else return reply({error:'Invalid role or method'},400);
  await db.prepare('INSERT INTO finora_cloud_events(id,owner,key,actor,event,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),owner,key,id,'access_'+request.method.toLowerCase(),now).run();return reply({ok:true});
 }
 return reply({error:'Not found'},404);
}
