export class ScreenAwake {
  constructor({
    provider=globalThis.navigator?.wakeLock,doc=document,status=()=>{
    }
  }={
  }) {
    Object.assign(this,{
      provider,doc,status
    });
    this.wanted=false;
    this.lock=null;
    this.pending=null;
    this.generation=0;
    doc.addEventListener('visibilitychange',()=>{
      if(doc.hidden){
        this.release();
        if(this.wanted)this.status('waiting');
      }else if(this.wanted)this.acquire();
    });
  }
  setActive(active){
    if(this.wanted!==active){
      this.wanted=active;
      this.generation++;
    }if(active)return this.acquire();
    this.release();
    this.status('inactive');
    return Promise.resolve();
  }
  async acquire(){
    if(!this.wanted)return;
    if(!this.provider?.request){
      this.status('unavailable');
      return;
    }
    if(this.doc.hidden){
      this.status('waiting');
      return;
    }
    if(this.lock&&!this.lock.released){
      this.status('active');
      return;
    }
    if(this.pending)return this.pending;
    const generation=this.generation;
    this.pending=Promise.resolve().then(async()=>{
      try{
        const lock=await this.provider.request('screen');
        if(!this.wanted||this.doc.hidden||generation!==this.generation){
          await lock.release();
          return;
        }
        this.lock=lock;
        lock.addEventListener('release',()=>{
          if(this.lock===lock){
            this.lock=null;
            this.status(this.wanted?'released':'inactive');
          }
        });
        this.status(lock.released?'released':'active');
      }catch{
        if(this.wanted&&generation===this.generation)this.status('denied');
      }
      finally{
        this.pending=null;
        if(this.wanted&&generation!==this.generation&&!this.doc.hidden)this.acquire();
      }
    });
    return this.pending;
  }
  release(){
    const lock=this.lock;
    this.lock=null;
    if(lock&&!lock.released)try{
      Promise.resolve(lock.release()).catch(()=>{
      });
    }catch{
    }
  }
}
