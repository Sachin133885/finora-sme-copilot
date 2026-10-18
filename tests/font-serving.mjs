import assert from 'node:assert/strict';import fs from 'node:fs';
const code=fs.readFileSync('worker/index.js','utf8');const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
for(const file of ['source-sans-3-latin.woff2','source-han-sans-sc-regular.woff2','source-han-sans-sc-bold.woff2']){
 const response=await worker.fetch(new Request('https://finora.test/fonts/'+file));assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'font/woff2');assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync('src/fonts/'+file));
}
const response=await worker.fetch(new Request('https://finora.test/typography.js'));assert.match(await response.text(),/mixedScriptParts/);
console.log('Worker serves exact local font bytes and typography module.');
