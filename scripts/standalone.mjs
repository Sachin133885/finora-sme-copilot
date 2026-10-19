import fs from 'node:fs';
const engine=fs.readFileSync('src/engine.js','utf8').replace(/^export /gm,''),app=fs.readFileSync('src/app.js','utf8').replace(/^import[^\n]*\n/gm,''),shell=fs.readFileSync('src/index.html','utf8').replace(/\/fonts\/([a-z0-9-]+\.woff2)/g,(_,n)=>'data:font/woff2;base64,'+fs.readFileSync('src/fonts/'+n).toString('base64'));
const mobile=fs.readFileSync('src/mobile-engine.js','utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'');
const extra=['typography.js','business-ai.js','readiness.js','rescue.js','pdf-receipts.js','tour.js'].map(n=>fs.readFileSync('src/'+n,'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'')).join('\n');
const dragonData='data:image/png;base64,'+fs.readFileSync('src/assets/finora-dragon.png').toString('base64');
const walkData='data:image/png;base64,'+fs.readFileSync('src/assets/dragon-walk.png').toString('base64');
const code=('globalThis.FINORA_OFFLINE=true;globalThis.FINORA_DRAGON_ASSET='+JSON.stringify(dragonData)+';globalThis.FINORA_WALK_ASSET='+JSON.stringify(walkData)+';\n'+engine+'\n'+mobile+'\n'+extra+'\n'+app).replace(/<\/script/gi,'<\\/script');
fs.writeFileSync('Finora-mobile.html',shell.replace('<link rel="stylesheet" href="/experience.css">','<style>'+fs.readFileSync('src/experience.css','utf8')+'</style>').replace('<script type="module" src="/typography.js"></script>','').replace('<script src="/theme-init.js"></script>','<script>'+fs.readFileSync('src/theme-init.js','utf8')+'</script>').replace('<script type="module" src="/app.js"></script>','<script type="module">\n'+code+'\n</script>'));
fs.writeFileSync('/tmp/finora-standalone-check.mjs',code);
console.log('Built standalone Finora-mobile.html');

fs.writeFileSync('Finora-updated.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=Finora-mobile.html"><title>Open Finora</title><a href="Finora-mobile.html">Open the current Finora application</a></html>');
