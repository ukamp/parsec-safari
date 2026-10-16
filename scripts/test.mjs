import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
for(const file of (await readdir(new URL('../tests/',import.meta.url))).filter(name=>name.endsWith('.test.mjs')).sort()){
  const result=spawnSync(process.execPath,[new URL('../tests/'+file,import.meta.url).pathname],{stdio:'inherit',env:process.env,timeout:20000});
  if(result.status!==0)process.exit(result.status||1);
}
console.log('All application regression tests passed.');
