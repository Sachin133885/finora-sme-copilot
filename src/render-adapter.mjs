import {randomBytes,timingSafeEqual} from 'node:crypto';
import {seed,profiles,validateData,AS_OF} from './engine.js';

const security={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'same-origin','x-frame-options':'DENY','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(x);
const same=(a,b)=>{const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length>0&&x.length===y.length&&timingSafeEqual(x,y);};
class UpstreamError extends Error {constructor(status=503){super('Upstream service unavailable');this.status=status;}}

export function createRenderHandler(env,{worker,fetcher=fetch}={}){
 const supabase=new URL(env.SUPABASE_URL||'');
 if(supabase.protocol!=='https:'||supabase.username||supabase.password||supabase.pathname!=='/'||supabase.search||supabase.hash)throw Error('Invalid Supabase URL');
 if(!env.SUPABASE_PUBLISHABLE_KEY||!env.SUPABASE_SECRET_KEY||!worker?.fetch)throw Error('Missing server configuration');
 const app=new URL(env.APP_ORIGIN||env.RENDER_EXTERNAL_URL||'');
 const local=env.FINORA_LOCAL==='1'&&['localhost','127.0.0.1'].includes(app.hostname);
 if(app.origin!==app.href.replace(/\/$/,'')||(!local&&app.protocol!=='https:'))throw Error('Invalid application origin');
 const allowed=new Set([app.origin]);
 if(env.FRONTEND_ORIGIN){const f=new URL(env.FRONTEND_ORIGIN);if(f.protocol!=='https:'||f.href.replace(/\/$/,'')!==f.origin)throw Error('Invalid frontend origin');allowed.add(f.origin);}
 let limitMinute=-1;
 const prefix=local?'finora_':'__Host-finora_',names={access:prefix+'access',refresh:prefix+'refresh',csrf:prefix+'csrf'},limits=new Map(),refreshing=new Map();
 const authHeaders=()=>({'apikey':env.SUPABASE_PUBLISHABLE_KEY,'content-type':'application/json'});
 const privateHeaders=()=>({'apikey':env.SUPABASE_SECRET_KEY,'content-type':'application/json',...(env.SUPABASE_SECRET_KEY.startsWith('eyJ')?{authorization:'Bearer '+env.SUPABASE_SECRET_KEY}:{})});
 const upstream=async(route,options)=>{try{return await fetcher(supabase.origin+route,{...options,redirect:'error',signal:AbortSignal.timeout(15000)});}catch{throw new UpstreamError();}};
 const rpc=async(user,action,values={})=>{
  const r=await upstream('/rest/v1/rpc/finora_workspace',{method:'POST',headers:privateHeaders(),body:JSON.stringify({p_actor:user.id,p_email:user.email,p_action:action,...values})});
  if(!r.ok)throw new UpstreamError();const value=await r.json();if(!value||typeof value!=='object'||!Number.isInteger(value.status))throw new UpstreamError();return value;
 };
 const cookiesFor=(tokens,csrf)=>{
  const suffix=`; Path=/; HttpOnly; SameSite=Lax${local?'':'; Secure'}`;
  return [`${names.access}=${encodeURIComponent(tokens.access_token)}; Max-Age=${Math.max(60,Math.min(3600,Number(tokens.expires_in)||3600))}${suffix}`,`${names.refresh}=${encodeURIComponent(tokens.refresh_token)}; Max-Age=604800${suffix}`,`${names.csrf}=${encodeURIComponent(csrf)}; Max-Age=604800${suffix}`];
 };
 const clearCookies=()=>Object.values(names).map(n=>`${n}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${local?'':'; Secure'}`);
 const verifiedUser=async access=>{
  const r=await upstream('/auth/v1/user',{headers:{...authHeaders(),authorization:'Bearer '+access}});
  if(r.status===401||r.status===403)return null;if(!r.ok)throw new UpstreamError();const u=await r.json();
  return uuid(u.id)&&typeof u.email==='string'&&u.email_confirmed_at?{id:u.id,email:u.email.toLowerCase()}:null;
 };
 const session=async(request)=>{
  const cookies={};for(const part of (request.headers.get('cookie')||'').split(';')){const i=part.indexOf('=');if(i<0)continue;try{cookies[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1));}catch{}}
  let access=cookies[names.access],refresh=cookies[names.refresh],csrf=cookies[names.csrf]||'',set=[];
  if(!access&&!refresh)return {user:null,csrf:'',set};
  let user=access?await verifiedUser(access):null;
  if(!user&&refresh){
   // Collapse concurrent refreshes for the same cookie within one server instance.
   let pending=refreshing.get(refresh);
   if(!pending){pending=upstream('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:authHeaders(),body:JSON.stringify({refresh_token:refresh})}).then(async r=>{if(!r.ok){if(r.status===400||r.status===401)return null;throw new UpstreamError();}return r.json();});refreshing.set(refresh,pending);pending.finally(()=>{const timer=setTimeout(()=>refreshing.delete(refresh),10000);timer.unref?.();}).catch(()=>{});}
   const tokens=await pending;
   if(tokens?.access_token&&tokens?.refresh_token){user=await verifiedUser(tokens.access_token);if(user){access=tokens.access_token;csrf=csrf||randomBytes(24).toString('hex');set=cookiesFor(tokens,csrf);}}
  }
  if(!user)set=clearCookies();
  return {user,csrf,access,set};
 };
 const restricted=new Set(['/api/session','/api/initialize','/api/business','/api/members','/api/cloud-audit','/api/logout']);
 return async function handle(request){
  let set=[];
  const reply=(body,status=200)=>{const h=new Headers({...security,'content-type':'application/json;charset=utf-8'});for(const c of set)h.append('set-cookie',c);return new Response(JSON.stringify(body),{status,headers:h});};
  try{
   const url=new URL(request.url),route=url.pathname,method=request.method;
   if(route==='/healthz')return reply({ok:true,service:'Finora',snapshot:AS_OF});
   if(route==='/signin-with-chatgpt'||route==='/signout-with-chatgpt')return new Response(null,{status:302,headers:{...security,location:'/#account'}});
   if(!['GET','HEAD','POST','PUT','DELETE'].includes(method))return reply({error:'Method not allowed'},405);
   let origin=request.headers.get('origin');if(origin&&!allowed.has(origin))return reply({error:'Origin rejected'},403);
   const mutating=!['GET','HEAD'].includes(method);
   if(mutating&&!allowed.has(origin))return reply({error:'Origin required'},403);
   if(mutating&&!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON required'},415);
   let body=null;if(mutating){const text=await request.text();if(Buffer.byteLength(text)>1500000)return reply({error:'Request too large'},413);try{body=JSON.parse(text);}catch{return reply({error:'Invalid JSON'},400);}if(!body||Array.isArray(body)||typeof body!=='object')return reply({error:'Invalid JSON object'},400);}
   if(route==='/api/login'||route==='/api/register'){
    if(method!=='POST')return reply({error:'Method not allowed'},405);
    const email=String(body.email||'').trim().toLowerCase(),password=body.password;
    const minute=Math.floor(Date.now()/60000);if(minute!==limitMinute){limits.clear();limitMinute=minute;}
    const key='account:'+email.slice(0,120),n=(limits.get(key)||0)+1,total=(limits.get('total')||0)+1;limits.set(key,n);limits.set('total',total);
    if(n>8||total>120)return reply({error:'Try again later'},429);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>120||typeof password!=='string'||password.length<12||password.length>128)return reply({error:'Invalid account details'},400);
    const register=route==='/api/register',r=await upstream(register?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{method:'POST',headers:authHeaders(),body:JSON.stringify({email,password})});
    if(!r.ok)return reply({error:'Unable to sign in or register. Check account details or confirm your email.'},r.status===429?429:400);
    const tokens=await r.json();if(register&&!tokens.access_token)return reply({confirmationRequired:true});
    if(!tokens.access_token||!tokens.refresh_token)throw new UpstreamError();const user=await verifiedUser(tokens.access_token);if(!user)return reply({error:'Confirm your email before signing in.'},401);
    const csrf=randomBytes(24).toString('hex');set=cookiesFor(tokens,csrf);const info=await rpc(user,'list');if(info.status!==200)return reply({error:info.error||'Workspace unavailable'},info.status);
    return reply({user,csrf,businesses:info.businesses,accounts:true});
   }
   const needsIdentity=route.startsWith('/api/');const s=needsIdentity?await session(request):{user:null,set:[]};set=s.set;
   if(route==='/api/status')return reply({mode:env.LLM_API_KEY&&env.LLM_ENDPOINT&&env.LLM_MODEL?'configured':'demo',asOf:AS_OF,authenticated:!!s.user,accounts:true,documents:false,identityMode:'supabase',track:'E'});
   if(route==='/api/session'&&!s.user)return reply({user:null,accounts:true});
   if(restricted.has(route)){
    if(!s.user)return reply({error:'Sign in required'},401);
    if(mutating&&!same(request.headers.get('x-csrf-token'),s.csrf))return reply({error:'CSRF check failed'},403);
    if(route==='/api/logout'){
     if(method!=='POST')return reply({error:'Method not allowed'},405);
     const result=await upstream('/auth/v1/logout',{method:'POST',headers:{...authHeaders(),authorization:'Bearer '+s.access}});if(!result.ok&&result.status!==401)throw new UpstreamError();set=clearCookies();return reply({ok:true});
    }
    const owner=url.searchParams.get('owner')||s.user.id,key=url.searchParams.get('key')||'shenzhen';
    if(!uuid(owner)||!profiles.some(p=>p.id===key))return reply({error:'Invalid workspace'},400);
    let action,values={p_owner:owner,p_key:key};
    if(route==='/api/session'&&method==='GET')action='list';
    else if(route==='/api/initialize'&&method==='POST'){action='initialize';values={...values,p_data:profiles.map(p=>seed(p.id))};}
    else if(route==='/api/business'&&method==='GET')action='get';
    else if(route==='/api/business'&&method==='PUT'){
     try{validateData(body.data);if(body.data.org!==key||JSON.stringify(body.data).length>1200000||!Number.isSafeInteger(body.revision))throw Error();}catch{return reply({error:'Invalid financial data'},400);}
     action='save';values={...values,p_data:body.data,p_revision:body.revision};
    }else if(route==='/api/members'&&['GET','POST','DELETE'].includes(method)){
     action=method==='GET'?'members':method==='POST'?'grant':'revoke';if(method!=='GET'){const email=String(body.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>120||email===s.user.email||method==='POST'&&!['accountant','viewer'].includes(body.role))return reply({error:'Invalid member'},400);values={...values,p_target:email,p_role:body.role||null};}
    }else if(route==='/api/cloud-audit'&&method==='GET')action='audit';else return reply({error:'Method not allowed'},405);
    const result=await rpc(s.user,action,values),{status,...payload}=result;
    return reply(route==='/api/session'||route==='/api/initialize'?{...payload,user:s.user,csrf:s.csrf,accounts:true}:payload,status);
   }
   // Never forward client-selected platform identity, IP or proxy headers into Worker authorization.
   const h=new Headers();if(mutating)h.set('content-type','application/json');if(origin)h.set('origin',origin);
   h.set('cf-connecting-ip',request.headers.get('x-finora-client-ip')||'anonymous');
   if(s.user){h.set('oai-authenticated-user-id',s.user.id);h.set('oai-authenticated-user-email',s.user.email);}
   const u=new URL(url.pathname+url.search,origin||app.origin);
   const response=await worker.fetch(new Request(u,{method:method==='HEAD'?'GET':method,headers:h,...(mutating?{body:JSON.stringify(body)}:{})}),{LLM_API_KEY:env.LLM_API_KEY,LLM_ENDPOINT:env.LLM_ENDPOINT,LLM_MODEL:env.LLM_MODEL});
   const headers=new Headers(response.headers);for(const c of set)headers.append('set-cookie',c);
   return new Response(method==='HEAD'?null:response.body,{status:response.status,headers});
  }catch(error){return reply({error:'Service temporarily unavailable. Your current browser records are retained.'},error instanceof UpstreamError?error.status:503);}
 };
}
