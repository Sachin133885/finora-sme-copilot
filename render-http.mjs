import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const port=3417,origin='http://localhost:'+port;
const child=spawn(process.execPath,['scripts/render-server.mjs'],{env:{...process.env,PORT:String(port),FINORA_LOCAL:'1',APP_ORIGIN:origin,SUPABASE_URL:'https://rrbzfaznyytijabupxkv.supabase.co',SUPABASE_PUBLISHABLE_KEY:'test-public',SUPABASE_SECRET_KEY:'test-private',LLM_API_KEY:'',LLM_ENDPOINT:'',LLM_MODEL:''},stdio:['ignore','pipe','pipe']});
let output='';const ready=new Promise((resolve,reject)=>{child.stdout.on('data',x=>{output+=x;if(output.includes('server ready'))resolve();});child.on('exit',code=>reject(Error('Server exited '+code)));});
const timer=setTimeout(()=>child.kill(),12000);
try{await ready;const html=await fetch(origin);assert.equal(html.status,200);assert.match(await html.text(),/Finora/);assert.match(html.headers.get('content-security-policy'),/script-src 'self'/);
const status=await (await fetch(origin+'/api/status',{headers:{'oai-authenticated-user-id':'forged'}})).json();assert.equal(status.authenticated,false);assert.equal(status.identityMode,'supabase');
assert.equal((await fetch(origin+'/healthz')).status,200);
assert.equal((await fetch(origin+'/api/login',{method:'POST',headers:{origin:'https://evil.test','content-type':'application/json'},body:'{}'})).status,403);
console.log('PASS actual local Node HTTP serving, CSP, health endpoint, spoof denial and Origin protection; no live Supabase/provider calls');
}finally{clearTimeout(timer);child.kill();await new Promise(resolve=>child.once('exit',resolve));}
