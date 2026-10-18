import fs from 'node:fs';
const engine=fs.readFileSync('src/engine.js','utf8').replace(/^export /gm,''),app=fs.readFileSync('src/app.js','utf8').replace(/^import[^\n]*\n/gm,''),shell=fs.readFileSync('src/index.html','utf8').replace(/\/fonts\/([a-z0-9-]+\.woff2)/g,(_,n)=>'data:font/woff2;base64,'+fs.readFileSync('src/fonts/'+n).toString('base64'));
const mobile=fs.readFileSync('src/mobile-engine.js','utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'');
const extra=['typography.js','business-ai.js','readiness.js','rescue.js','pdf-receipts.js','tour.js'].map(n=>fs.readFileSync('src/'+n,'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'')).join('\n');
const code=('globalThis.FINORA_OFFLINE=true;\n'+engine+'\n'+mobile+'\n'+extra+'\n'+app).replace(/<\/script/gi,'<\\/script');
fs.writeFileSync('Finora-mobile.html',shell.replace('<script type="module" src="/typography.js"></script>','').replace('<script src="/theme-init.js"></script>','<script>'+fs.readFileSync('src/theme-init.js','utf8')+'</script>').replace('<script type="module" src="/app.js"></script>','<script type="module">\n'+code+'\n</script>'));
fs.writeFileSync('/tmp/finora-standalone-check.mjs',code);
console.log('Built standalone Finora-mobile.html');
