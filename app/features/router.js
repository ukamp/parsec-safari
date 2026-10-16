const titles={
  computers:'Deine Computer',stream:'Dein Stream',settings:'Einstellungen',diagnostics:'Diagnose',help:'Hilfe & Funktionen'
};
export function createRouter(doc=document,win=window){
  function show(){
    const page=Object.hasOwn(titles,win.location.hash.slice(1))?win.location.hash.slice(1):'computers';
    for(const view of doc.querySelectorAll('[data-view]'))view.hidden=view.dataset.view!==page;
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
