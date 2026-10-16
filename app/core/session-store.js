const KEY='parsec-safari.session.v1';
// Opt-in bearer session only. Never store passwords or one-time codes.
export function createSessionStore(storage=()=>globalThis.localStorage,now=()=>Date.now()){
  const clear=()=>{try{storage()?.removeItem(KEY);}catch{}};
  return {
    clear,
    save(token){
      try{
        if(typeof token!=='string'||!token.length||token.length>4096)return false;
        storage().setItem(KEY,JSON.stringify({token,expires:now()+30*24*60*60*1000}));
        return true;
      }catch{return false;}
    },
    load(){
      try{
        const value=JSON.parse(storage()?.getItem(KEY)||'null');
        if(typeof value?.token==='string'&&value.token.length>0&&value.token.length<=4096&&Number.isFinite(value.expires)&&value.expires>now())return value.token;
      }catch{}
      clear();
      return null;
    }
  };
}
