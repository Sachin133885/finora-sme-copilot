import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const tests=fs.readdirSync('tests').filter(n=>n.endsWith('.mjs')).sort();let failed=0;
for(const name of tests){const r=spawnSync(process.execPath,['tests/'+name],{encoding:'utf8'});console.log(`${r.status===0?'PASS':'FAIL'} tests/${name}`);if(r.status!==0){failed++;console.error(r.stdout+r.stderr);}}
console.log(`${tests.length-failed}/${tests.length} test suites passed. DOM checks are not browser layout checks.`);process.exitCode=failed?1:0;
