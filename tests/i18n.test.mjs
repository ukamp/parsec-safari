import assert from 'node:assert/strict';
import {asset} from './helpers.mjs';
const saved=new Map([['parsec-language','en']]);
globalThis.localStorage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
const {detectLanguage,language,t,setupLanguage}=await import(asset('core/i18n.js'));
assert.equal(detectLanguage(null,'en-US'),'en');
assert.equal(detectLanguage(null,'en-GB'),'en');
assert.equal(detectLanguage(null,'de-DE'),'de');
assert.equal(detectLanguage(null,'fr-FR'),'de');
assert.equal(detectLanguage('de','en-US'),'de');
assert.equal(detectLanguage('en','de-DE'),'en');
assert.equal(detectLanguage('invalid','en-US'),'en');
assert.equal(language,'en');assert.equal(t('stream.disconnect'),'Disconnect');
assert.equal(t('unknown-safe-host'),'unknown-safe-host');
const nodes=[{nodeValue:'  {{stream.disconnect}}  ',parentElement:{tagName:'BUTTON'}},{nodeValue:'my-private-PC',parentElement:{tagName:'H3'}},{nodeValue:'{{stream.disconnect}}',parentElement:{tagName:'CODE'}}];
let index=0,reloads=0;
const select={value:''};const attributes={placeholder:'{{computers.searchPlaceholder}}','aria-label':'{{stream.openMenu}}'};
const doc={documentElement:{style:{setProperty(){}}},body:{},createTreeWalker:()=>({nextNode:()=>nodes[index++]}),querySelectorAll:()=>[{getAttribute:k=>attributes[k],setAttribute:(k,v)=>attributes[k]=v}],getElementById:()=>select};
setupLanguage(doc,{localStorage,location:{reload(){reloads++}}});
assert.equal(doc.documentElement.lang,'en');assert.equal(select.value,'en');
assert.equal(nodes[0].nodeValue,'  Disconnect  ');assert.equal(nodes[1].nodeValue,'my-private-PC');assert.equal(nodes[2].nodeValue,'{{stream.disconnect}}');
assert.equal(attributes.placeholder,'Computer name');assert.equal(attributes['aria-label'],'Open Parsec menu');
select.value='de';select.onchange();assert.equal(saved.get('parsec-language'),'de');assert.equal(reloads,1);
console.log('System language defaults, saved override, English controls, static accessibility labels and safe user text passed.');

// Every source reference must exist in both languages; catch missing keys in CI.
const {readFile,readdir}=await import('node:fs/promises');
const {translations}=await import(asset('core/translations.js'));
for(const [key,value] of Object.entries(translations)){
 assert.match(key,/^[a-zA-Z][a-zA-Z0-9.]+$/);
 assert.equal(typeof value.de,'string',key);assert.ok(value.de.length,key);
 assert.equal(typeof value.en,'string',key);assert.ok(value.en.length,key);
}
async function checkDirectory(directory){
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const url=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
  if(entry.isDirectory()){await checkDirectory(url);continue;}
  if(!/\.(js|html)$/.test(entry.name)||entry.name==='translations.js')continue;
  const content=await readFile(url,'utf8');
  const keys=[...content.matchAll(/\bt\(['"]([^'"]+)['"]\)/g),...content.matchAll(/\{\{([a-zA-Z0-9.]+)\}\}/g)].map(match=>match[1]);
  for(const key of keys)assert.ok(Object.hasOwn(translations,key),url.pathname+': '+key);
 }
}
await checkDirectory(new URL('../app/',import.meta.url));
console.log('All symbolic UI references exist in the shared German/English catalog.');
