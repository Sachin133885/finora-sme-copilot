import fs from 'node:fs';
const names=['engine.js','mobile-engine.js','business-ai.js','readiness.js','rescue.js','cloud-accounts.js','app.js'];
const sources=Object.fromEntries(names.map(n=>[n,fs.readFileSync('src/'+n,'utf8')]));
for(const n of ['typography.js','theme-init.js','pdf-receipts.js','tour.js','vendor/pdf.min.mjs','vendor/pdf.worker.min.mjs','experience.css'])sources[n]=fs.readFileSync('src/'+n,'utf8');
const imageAssets=Object.fromEntries(fs.readdirSync('src/assets').filter(n=>n.endsWith('.png')).map(n=>['assets/'+n,fs.readFileSync('src/assets/'+n).toString('base64')]));
const fontAssets=Object.fromEntries(fs.readdirSync('src/fonts').filter(n=>n.endsWith('.woff2')).map(n=>['fonts/'+n,fs.readFileSync('src/fonts/'+n).toString('base64')]));
const worker=names.filter(n=>n!=='app.js').map(n=>sources[n].replace(/^import[^\n]*\n/gm,'')).join('\n')+'\nconst imageAssets='+JSON.stringify(imageAssets)+';\nconst fontAssets='+JSON.stringify(fontAssets)+';\nconst sources='+JSON.stringify(sources)+';\nconst page='+JSON.stringify(fs.readFileSync('src/index.html','utf8'))+';\n'+fs.readFileSync('src/server.js','utf8');
fs.mkdirSync('worker',{recursive:true});fs.writeFileSync('worker/index.js',worker);fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});fs.writeFileSync('dist/server/index.js',worker);fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');console.log('Built Finora Worker: '+Buffer.byteLength(worker)+' bytes');
