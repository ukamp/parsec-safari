import { t } from '../core/i18n.js';
export function avatarUrl(id){
  return Number.isSafeInteger(id)&&id>0?'https://parsecusercontent.com/cors-resize-image/w=64,h=64,fit=crop,background=white,q=90,f=jpeg/avatars/'+id+'/avatar':null;
}
const name=value=>typeof value==='string'?value.slice(0,160):'';
export class AccountView {
  constructor({$,request,getSession}){Object.assign(this,{$,request,getSession});this.epoch=0;}
  clear(){
    this.epoch++;this.$('accountPanel').hidden=true;
    this.$('accountInfo').textContent='';this.$('friends').textContent='';
  }
  async load(){
    const token=this.getSession();if(!token)return;
    const epoch=++this.epoch;
    this.$('accountPanel').hidden=false;
    this.$('accountInfo').textContent=t('account.loading');this.$('friends').textContent=t('account.loading');
    const load=async(path,id,format)=>{
      try{
        const r=await this.request(path,{headers:{Authorization:'Bearer '+token}});
        if(epoch!==this.epoch||token!==this.getSession())return;
        this.$(id).textContent=r.status===200?format(r.data)+(r.hasMore?' '+t('account.moreAvailable'):''):t('account.unavailable')+' (HTTP '+r.status+')';
      }catch{
        if(epoch===this.epoch&&token===this.getSession())this.$(id).textContent=t('account.networkUnavailable');
      }
    };
    await Promise.all([
      load('/me','accountInfo',data=>data&&typeof data==='object'&&name(data.name)?name(data.name)+(Number.isSafeInteger(data.id)?' #'+data.id:''):t('account.unavailable')),
      load('/friendships','friends',data=>{
        if(!Array.isArray(data))return t('account.unavailable');
        const names=data.slice(0,500).filter(x=>x&&name(x.user_name)).map(x=>name(x.user_name));
        return names.length?names.join('\n'):t('friends.empty');
      })
    ]);
  }
}
