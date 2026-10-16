import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const root=new URL('../_site/',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
assert.match(html,/id="auth"/);
assert.match(html,/href="compatibility\/"/);
for(const match of html.matchAll(/(?:src|href)="(assets-[^"]+)"/g))await access(new URL(match[1],root));
for(const route of ['app','personal-test','client']){
 const redirect=await readFile(new URL(route+'/index.html',root),'utf8');
 assert.match(redirect,/location\.replace/);assert.match(redirect,/target\.hash=location\.hash/);
 assert.match(redirect,/href="\.\.\/"/);
}
await access(new URL('compatibility/index.html',root));
await access(new URL('.nojekyll',root));
const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
const origin='https://ukamp.github.io/parsec-safari/';
assert.equal(new URL(manifest.start_url,origin).href,origin);
assert.equal(new URL(manifest.scope,origin).href,origin);
assert.equal(new URL(manifest.id,origin).href,origin+'app/');
const legacy=JSON.parse(await readFile(new URL('app/manifest.webmanifest',root),'utf8'));
assert.equal(new URL(legacy.start_url,origin+'app/').href,origin);
assert.equal(new URL(legacy.id,origin+'app/').href,origin+'app/');
for(const icon of legacy.icons)await access(new URL(icon.src,new URL('app/',root)));
console.log('Root app assets, legacy redirects, capability test and installed app identity passed.');
