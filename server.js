// Financial calculations stay deterministic. Platform identity gates cloud storage and paid live-AI calls.
const security={'x-content-type-options':'nosniff','referrer-policy':'same-origin','x-frame-options':'DENY','cache-control':'no-store','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{...security,'content-type':'application/json;charset=utf-8'}});
const attempts=new Map();
export default {async fetch(request,env={}){
 const url=new URL(request.url),authenticated=!!request.headers.get('oai-authenticated-user-id'),configured=!!(env.LLM_API_KEY&&env.LLM_ENDPOINT&&env.LLM_MODEL);
 if(request.method==='GET'){
  if(url.pathname==='/')return new Response(page,{headers:{...security,'content-type':'text/html;charset=utf-8'}});
  const file=url.pathname.slice(1);if(imageAssets[file])return new Response(Uint8Array.from(atob(imageAssets[file]),c=>c.charCodeAt(0)),{headers:{...security,'content-type':'image/png','cache-control':'public,max-age=86400'}});if(fontAssets[file])return new Response(Uint8Array.from(atob(fontAssets[file]),c=>c.charCodeAt(0)),{headers:{...security,'content-type':'font/woff2','cache-control':'public,max-age=86400'}});if(sources[file])return new Response(sources[file],{headers:{...security,'content-type':file.endsWith('.css')?'text/css;charset=utf-8':'text/javascript;charset=utf-8'}});
  if(url.pathname==='/api/status')return json({mode:configured?'configured':'demo',asOf:AS_OF,authenticated,accounts:!!env.DB,documents:false,identityMode:'chatgpt',track:'E'});
 }
 if(!['GET','POST','PUT','DELETE'].includes(request.method))return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'Origin rejected'},403);
 if(request.method!=='GET'&&!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
 if(Number(request.headers.get('content-length')||0)>1500000)return json({error:'Request too large'},413);
 try{
  const raw=request.method==='GET'?'':await request.text();if(raw.length>1500000)return json({error:'Request too large'},413);const parsed=raw?JSON.parse(raw):{};
  const account=await cloudAccountRoute(request,env,parsed);if(account)return account;
  if(request.method!=='POST'||!['/api/analyze','/api/compare','/api/check-ai'].includes(url.pathname))return json({error:'Not found'},404);
  const who=request.headers.get('oai-authenticated-user-id')||request.headers.get('cf-connecting-ip')||'anonymous',minute=Math.floor(Date.now()/60000),k=who+':'+minute,count=(attempts.get(k)||0)+1;attempts.set(k,count);if(attempts.size>2000)attempts.clear();if(count>30)return json({error:'Try again later'},429);
  if(url.pathname==='/api/compare')return json(compareActions(parsed.data,parsed.input,parsed.scenario||{}));
  let {data,question,lang,context='',reportPeriod,scenario=null}=parsed;
  const check=url.pathname==='/api/check-ai';if(check){data=seed('shenzhen');question='Will I have enough cash?';lang=lang==='zh'?'zh':'en';}
  if(!['en','zh'].includes(lang)||typeof context!=='string'||context.length>30||typeof question!=='string'||question.length>2000)return json({error:'Invalid input'},400);
  if(reportPeriod&&(!/^\d{4}-\d{2}-\d{2}$/.test(reportPeriod.start)||!/^\d{4}-\d{2}-\d{2}$/.test(reportPeriod.end)||reportPeriod.start>reportPeriod.end||reportPeriod.end>AS_OF))throw Error('period');
  let result=businessAnalysis(data,question,lang,context,reportPeriod||null,scenario);result.mode='demo';
  if(parsed.live||check){
   const reason=!configured?'not_configured':!authenticated?'sign_in_required':parsed.consent!==true?'consent_required':null;
   if(reason)return check?json({ok:false,reason}):json({...result,liveBlocked:reason,providerUnavailable:true,providerReason:reason});
   const hourKey='live:'+who+':'+Math.floor(Date.now()/3600000),used=(attempts.get(hourKey)||0)+1;attempts.set(hourKey,used);if(used>10)return check?json({ok:false,reason:'hourly_limit'}):json({...result,liveBlocked:'hourly_limit',providerUnavailable:true});
   try{result=await explainBusiness(env,data,question,lang,context,reportPeriod||null,scenario,Array.isArray(parsed.history)?parsed.history.slice(-4):[]);return check?json({ok:true,mode:'live',model:env.LLM_MODEL}):json(result);}catch(e){const allowed=['provider_busy','provider_quota','provider_auth','provider_model_not_found','provider_request_invalid','tool','arguments','unverified prose','model_output_invalid'];const reason=allowed.includes(e.message)?e.message:'provider_error';return check?json({ok:false,reason}):json({...result,providerUnavailable:true,providerReason:reason});}
  }
  if(configured&&!authenticated)result.providerUnavailable=true;
  return json(result);
 }catch{return json({error:'Invalid financial data or question'},400);}
}};
