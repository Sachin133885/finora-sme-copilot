import fs from 'node:fs';
fs.rmSync('public',{recursive:true,force:true});fs.mkdirSync('public',{recursive:true});
for(const file of ['index.html','engine.js','mobile-engine.js','business-ai.js','readiness.js','rescue.js','cloud-accounts.js','app.js','typography.js','theme-init.js','pdf-receipts.js','tour.js'])fs.copyFileSync('src/'+file,'public/'+file);
for(const folder of ['fonts','vendor'])fs.cpSync('src/'+folder,'public/'+folder,{recursive:true});
console.log('Exported Finora static frontend without server code or credentials');
