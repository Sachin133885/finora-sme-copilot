import http from 'node:http';
import fs from 'node:fs';
import {createRenderHandler} from '../src/render-adapter.mjs';
const worker=(await import('data:text/javascript;base64,'+fs.readFileSync('dist/server/index.js').toString('base64'))).default;
const handle=createRenderHandler(process.env,{worker});
const port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
const server=http.createServer(async(req,res)=>{
 try{
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1500000){res.writeHead(413,{'content-type':'application/json','cache-control':'no-store'});res.end('{"error":"Request too large"}');return;}chunks.push(chunk);}
  const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value!==undefined&&!['host','content-length','x-finora-client-ip'].includes(key))headers.set(key,Array.isArray(value)?value.join(','):value);
  // Do not trust visitor-supplied proxy/IP headers. Auth throttling is keyed by
  // normalized account plus a global per-instance ceiling, not an alleged client IP.
  headers.set('x-finora-client-ip',String(req.socket.remoteAddress||'unknown').slice(0,100));
  const origin=process.env.APP_ORIGIN||process.env.RENDER_EXTERNAL_URL;
  const response=await handle(new Request(new URL(req.url,origin),{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})}));
  const output=Object.fromEntries([...response.headers].filter(([k])=>k!=='set-cookie'));const cookies=response.headers.getSetCookie();if(cookies.length)output['set-cookie']=cookies;
  res.writeHead(response.status,output);res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(503,{'content-type':'application/json','cache-control':'no-store'});res.end('{"error":"Service temporarily unavailable"}');}
});
server.requestTimeout=30000;server.headersTimeout=15000;
server.listen(port,'0.0.0.0',()=>console.log('Finora Render server ready'));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
