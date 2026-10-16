import { t } from '../core/i18n.js';
const titles={
  computers:t("computers.title"),stream:t("stream.title"),settings:t("navigation.settings"),diagnostics:t("navigation.diagnostics"),help:t("navigation.help")
};
export function createRouter(doc=document,win=window){
  function show(){
    const page=Object.hasOwn(titles,win.location.hash.slice(1))?win.location.hash.slice(1):'computers';
    for(const view of doc.querySelectorAll('[data-view]')){
      view.hidden=view.dataset.view!==page;
      view.inert=view.hidden;
    }
    for(const link of doc.querySelectorAll('[data-page]')){
      if(link.dataset.page===page)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    }
    doc.getElementById('pageTitle').textContent=titles[page];
    doc.title='Parsec Safari · '+titles[page];
  }
  win.addEventListener('hashchange',show);
  show();
  return {
    go(page){
      if(!Object.hasOwn(titles,page))return;
      win.location.hash=page;
      show();
    }
  };
}
