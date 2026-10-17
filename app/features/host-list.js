import { avatarUrl } from './account.js';
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
    this.hosts=hosts.filter(h=>h&&typeof h.peer_id==='string').map(h=>({
      peer_id:h.peer_id,name:String(h.name||'Parsec-Host').slice(0,160),
      online:typeof h.online==='boolean'?h.online:null,
      description:typeof h.description==='string'?h.description.slice(0,240):'',
      build:typeof h.build==='string'?h.build.slice(0,80):'',
      owner:typeof h.user?.name==='string'?h.user.name.slice(0,160):'',
      ownerId:Number.isSafeInteger(h.user?.id)?h.user.id:null
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
      text.textContent=t("text.computerReportedByParsec");
      const button=this.doc.createElement('button');
      button.type='button';
      button.textContent=t("text.connect");
      button.setAttribute('aria-label',host.name+' · '+t("text.connect"));
      button.disabled=host.online===false;
      button.onclick=()=>{if(host.online!==false)this.onConnect(host.peer_id);};
      card.append(title,text,button);
      const metadata=this.doc.createElement('p');
      metadata.textContent=[host.online===true?t('hosts.onlineReported'):host.online===false?t('hosts.offlineReported'):t('hosts.statusUnknown'),host.owner,host.build?t('hosts.build')+' '+host.build:'',host.description].filter(Boolean).join(' · ');
      card.appendChild(metadata);
      const url=this.showAvatars&&avatarUrl(host.ownerId);
      if(url){const image=this.doc.createElement('img');image.src=url;image.alt='';image.width=48;image.height=48;image.loading='lazy';image.referrerPolicy='no-referrer';card.appendChild(image);}
      this.container.appendChild(card);
    }
    if(!visible.length)this.container.textContent=this.hosts.length?t("text.noComputersMatchYourSearch"):t("text.noComputersReportedCheckThatYourExistingParsecHost");
  }
}
