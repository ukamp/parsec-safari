import { t,language } from '../core/i18n.js';
export class HostList {
  constructor(container,search,onConnect,doc=document){
    Object.assign(this,{
      container,search,onConnect,doc
    });
    this.hosts=[];
    search.addEventListener('input',()=>this.render());
  }
  set(hosts){
    this.hosts=hosts.filter(h=>typeof h.peer_id==='string').map(h=>({
      peer_id:h.peer_id,name:String(h.name||'Parsec-Host').slice(0,160)
    }));
    this.render();
  }
  clear(){
    this.hosts=[];
    this.search.value='';
    this.container.textContent='';
  }
  render(){
    this.container.textContent='';
    const query=this.search.value.toLocaleLowerCase(language).trim();
    const visible=this.hosts.filter(h=>h.name.toLocaleLowerCase(language).includes(query)).sort((a,b)=>a.name.localeCompare(b.name,language));
    for(const host of visible){
      const card=this.doc.createElement('article');
      card.className='host-card';
      const title=this.doc.createElement('h3');
      title.textContent=host.name;
      const text=this.doc.createElement('p');
      text.textContent=t('Von Parsec gemeldeter Computer');
      const button=this.doc.createElement('button');
      button.type='button';
      button.textContent=t('Verbinden');
      button.setAttribute('aria-label',host.name+' · '+t('Verbinden'));
      button.onclick=()=>this.onConnect(host.peer_id);
      card.append(title,text,button);
      this.container.appendChild(card);
    }
    if(!visible.length)this.container.textContent=this.hosts.length?t('Kein Computer passt zu deiner Suche.'):t('Keine Computer gemeldet. Prüfe, ob dein vorhandener Parsec-Host läuft.');
  }
}
