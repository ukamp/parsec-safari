const API='https://kessel-api.parsec.app';
export function createApi(getSignal=()=>null,fetcher=fetch){
  return async function request(path,options={
  }){
    if(!path.startsWith('/')||path.startsWith('//'))throw Error('api path');
    const own=new AbortController(),timer=setTimeout(()=>own.abort(),12000),parent=getSignal();
    const abort=()=>own.abort();
    parent?.addEventListener('abort',abort,{
      once:true
    });
    if(parent?.aborted)own.abort();
    try{
      const response=await fetcher(API+path,{
        ...options,mode:'cors',credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer',signal:own.signal
      });
      let body=null;
      try{
        body=await response.json();
      }catch{
      }
      return {
        status:response.status,data:body?.data,hasMore:body?.has_more===true
      };
    }finally{
      clearTimeout(timer);
      parent?.removeEventListener('abort',abort);
    }
  };
}
