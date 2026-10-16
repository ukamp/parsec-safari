import { english } from './translations.js';
export function detectLanguage(saved,system='de'){
  return saved==='de'||saved==='en'?saved:/^en(?:-|$)/i.test(system)?'en':'de';
}
let saved;
try{saved=globalThis.localStorage?.getItem('parsec-language');}catch{}
export const language=detectLanguage(saved,globalThis.navigator?.language);
export function t(text){return language==='en'?(english[text]??text):text;}
// Translate only the initial static shell. Host names and user data never enter
// this dictionary or an automatic DOM observer.
export function setupLanguage(doc=document,win=window){
  doc.documentElement.lang=language;
  if(language==='en'){
    const walker=doc.createTreeWalker(doc.body,4);
    let node;
    while((node=walker.nextNode())){
      if(['SCRIPT','STYLE','CODE'].includes(node.parentElement?.tagName))continue;
      const trimmed=node.nodeValue.trim();
      if(english[trimmed])node.nodeValue=node.nodeValue.replace(trimmed,english[trimmed]);
    }
    for(const element of doc.querySelectorAll('[placeholder],[aria-label]')){
      for(const attribute of ['placeholder','aria-label']){
        const value=element.getAttribute(attribute);
        if(value)element.setAttribute(attribute,t(value));
      }
    }
  }
  doc.documentElement.style.setProperty('--menu-label',language==='en'?'" Menu"':'" Menü"');
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
}
