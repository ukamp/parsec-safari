import { translations } from './translations.js';
export function detectLanguage(saved,system='de'){
  return saved==='de'||saved==='en'?saved:/^en(?:-|$)/i.test(system)?'en':'de';
}
let saved;
try{saved=globalThis.localStorage?.getItem('parsec-language');}catch{}
export const language=detectLanguage(saved,globalThis.navigator?.language);
export function t(key){return translations[key]?.[language]??translations[key]?.en??key;}
export function resolveText(text){
  return text.replace(/\{\{([a-zA-Z0-9.]+)\}\}/g,(_,key)=>t(key));
}
// Resolve explicit template markers only, never host names or user data.
export function setupLanguage(doc=document,win=window){
  doc.documentElement.lang=language;
  const walker=doc.createTreeWalker(doc.body,4);
  let node;
  while((node=walker.nextNode())){
    if(['SCRIPT','STYLE','CODE'].includes(node.parentElement?.tagName))continue;
    node.nodeValue=resolveText(node.nodeValue);
  }
  for(const element of doc.querySelectorAll('[placeholder],[aria-label],[title]')){
    for(const attribute of ['placeholder','aria-label','title']){
      const value=element.getAttribute(attribute);
      if(value)element.setAttribute(attribute,resolveText(value));
    }
  }
  doc.documentElement.style.setProperty('--menu-label',JSON.stringify(t('stream.menuSuffix')));
  const select=doc.getElementById('language');
  select.value=language;
  select.onchange=()=>{
    const next=select.value;
    if(next!=='de'&&next!=='en')return;
    try{win.localStorage.setItem('parsec-language',next);}catch{
      select.value=language;
      return;
    }
    win.location.reload();
  };
  doc.documentElement.setAttribute?.('data-localized','true');
}
