export class FullscreenView {
  constructor({
    screen,canvas,exitButton,notice,report=()=>{
    },doc=document,win=window
  }) {
    Object.assign(this,{
      screen,canvas,exitButton,notice,report,doc,win
    });
    this.expanded=false;
    this.pending=false;
    this.timer=null;
    this.operation=0;
    const changed=()=>{
      const native=this.native();
      if(native===this.screen&&!this.expanded){
        this.leaveNative();
        return;
      }if(native===this.screen){
        clearTimeout(this.timer);
        this.pending=false;
        this.notice.hidden=true;
        this.report('fullscreen-native');
      }else if(this.expanded&&!this.pending)this.restore();
    };
    doc.addEventListener('fullscreenchange',changed);
    doc.addEventListener('webkitfullscreenchange',changed);
    doc.addEventListener('fullscreenerror',()=>{
      if(this.expanded)this.fallback();
    });
    doc.addEventListener('webkitfullscreenerror',()=>{
      if(this.expanded)this.fallback();
    });
    doc.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&this.expanded&&!this.native())this.exit();
    });
    exitButton.onclick=()=>this.exit();
  }
  native(){
    return this.doc.fullscreenElement||this.doc.webkitFullscreenElement||null;
  }
  fallback(stage='fullscreen-viewport'){
    if(!this.expanded)return;
    clearTimeout(this.timer);
    this.pending=false;
    this.notice.hidden=false;
    this.notice.textContent='Bildschirmansicht · Browserleisten können sichtbar bleiben';
    this.report(stage);
  }
  async leaveNative(){
    try{
      if(this.doc.exitFullscreen)await this.doc.exitFullscreen();
      else if(this.doc.webkitExitFullscreen)this.doc.webkitExitFullscreen();
    }catch{
    }
  }
  isolateBackground(){
    this.background=[];
    // In CSS fullscreen, covered controls still belong to the focus tree.
    // Isolate sibling branches, leaving the stream menu and exit usable.
    let branch=this.screen;
    while(branch?.parentElement){
      const parent=branch.parentElement;
      for(const sibling of parent.children){
        if(sibling===branch)continue;
        this.background.push([sibling,sibling.inert]);
        sibling.inert=true;
      }
      if(parent===this.doc.body)break;
      branch=parent;
    }
  }
  restoreBackground(){
    for(const [element,inert] of this.background||[])element.inert=inert;
    this.background=[];
  }
  async enter({native=true}={}) {
    if(this.expanded)return;
    const operation=++this.operation;
    this.scroll=[this.win.scrollX||0,this.win.scrollY||0];
    this.overflow=this.doc.body.style.overflow;
    this.pending=true;
    this.expanded=true;
    this.doc.body.style.overflow='hidden';
    this.screen.classList.add('screen-expanded');
    this.isolateBackground();
    this.exitButton.hidden=false;
    this.notice.hidden=true;
    this.canvas.focus({
      preventScroll:true
    });
    try{
      if(!native){this.fallback('fullscreen-controller');return;}
      if(this.screen.requestFullscreen){
        await this.screen.requestFullscreen({
          navigationUI:'hide'
        });
        if(operation!==this.operation){
          if(this.native()===this.screen)await this.leaveNative();
          return;
        }this.pending=false;
        if(this.native()!==this.screen)this.fallback();
      }
      else if(this.screen.webkitRequestFullscreen){
        this.screen.webkitRequestFullscreen();
        this.timer=setTimeout(()=>{
          if(this.native()!==this.screen)this.fallback();
        },1000);
      }
      else this.fallback();
    }catch{
      this.fallback();
    }
  }
  restore(){
    if(!this.expanded)return;
    clearTimeout(this.timer);
    this.pending=false;
    this.expanded=false;
    this.screen.classList.remove('screen-expanded');
    this.restoreBackground();
    this.exitButton.hidden=true;
    this.notice.hidden=true;
    this.doc.body.style.overflow=this.overflow;
    this.win.scrollTo(...this.scroll);
    this.canvas.focus({
      preventScroll:true
    });
    this.report('fullscreen-exited');
  }
  async exit(){
    if(!this.expanded)return;
    this.operation++;
    this.pending=true;
    try{
      if(this.native()===this.screen){
        if(this.doc.exitFullscreen)await this.doc.exitFullscreen();
        else if(this.doc.webkitExitFullscreen)this.doc.webkitExitFullscreen();
      }
    }catch{
    }
    this.restore();
  }
  toggle(){
    return this.expanded?this.exit():this.enter();
  }
}
