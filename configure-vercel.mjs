import fs from 'node:fs';
const url=new URL(process.argv[2]||'');
if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/'||!url.hostname.endsWith('.onrender.com'))throw Error('Supply the verified HTTPS Render service origin');
const config={version:2,framework:null,buildCommand:'node scripts/export-web.mjs',outputDirectory:'public',rewrites:[{source:'/api/:path*',destination:url.origin+'/api/:path*'}],headers:[{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'X-Frame-Options',value:'DENY'},{key:'Referrer-Policy',value:'same-origin'},{key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"}]}]};
fs.writeFileSync('vercel.json',JSON.stringify(config,null,2)+'\n');console.log('Configured Vercel API rewrite for '+url.origin);
