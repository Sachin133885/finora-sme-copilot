import assert from 'node:assert/strict';import fs from 'node:fs';
const code=fs.readFileSync('worker/index.js','utf8');const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
for(const file of ['source-sans-3-latin.woff2','source-han-sans-sc-regular.woff2','source-han-sans-sc-bold.woff2']){
 const response=await worker.fetch(new Request('https://finora.test/fonts/'+file));assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'font/woff2');assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync('src/fonts/'+file));
}
const response=await worker.fetch(new Request('https://finora.test/typography.js'));assert.match(await response.text(),/mixedScriptParts/);
console.log('Worker serves exact local font bytes and typography module.');

const mascot=await worker.fetch(new Request('https://finora.test/assets/finora-dragon.png'));
assert.equal(mascot.status,200);assert.equal(mascot.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await mascot.arrayBuffer()),fs.readFileSync('src/assets/finora-dragon.png'));
const styles=await worker.fetch(new Request('https://finora.test/experience.css'));
assert.equal(styles.status,200);assert.equal(styles.headers.get('content-type'),'text/css;charset=utf-8');assert.equal(await styles.text(),fs.readFileSync('src/experience.css','utf8'));
console.log('Worker serves exact mascot bytes and the current stylesheet with correct content types.');

const walk=await worker.fetch(new Request('https://finora.test/assets/dragon-walk.png'));
assert.equal(walk.status,200);assert.equal(walk.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await walk.arrayBuffer()),fs.readFileSync('src/assets/dragon-walk.png'));
console.log('Worker serves exact six-frame dragon sprite bytes.');
