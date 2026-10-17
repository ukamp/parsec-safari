export const isAppleTouch=nav=>/iPad|iPhone|Mac/.test(nav.userAgent||'')&&nav.maxTouchPoints>1;
import { t } from '../core/i18n.js';
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
    this.mode=null;
    const changed=()=>{
      if(this.mode==='switching'||this.mode==='exiting')return;
      const native=this.native();
      if(native===this.screen&&!this.expanded){
        this.leaveNative();
        return;
      }if(native===this.screen&&this.mode!=='native'){
        this.leaveNative();
        return;
      }if(native===this.screen){
        clearTimeout(this.timer);
        this.pending=false;
        this.notice.hidden=true;
        this.report('fullscreen-native');
      }else if(this.expanded&&!this.pending&&this.mode==='native')this.restore();
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
    this.mode=stage==='fullscreen-controller'?'controller':'viewport';
    this.notice.hidden=false;
    this.notice.textContent=t("text.expandedViewBrowserBarsMayRemainVisible");
    this.report(stage);
  }
  async leaveNative(){
    try{
      if(this.native()!==this.screen)return true;
      if(this.doc.exitFullscreen)await this.doc.exitFullscreen();
      else if(this.doc.webkitExitFullscreen)this.doc.webkitExitFullscreen();
      // Safari's prefixed API returns before its fullscreen animation ends.
      if(this.native()===this.screen)await new Promise(resolve=>{
        const started=Date.now();
        const timer=setInterval(()=>{
          if(this.native()!==this.screen||Date.now()-started>=1800){
            clearInterval(timer);
            resolve();
          }
        },25);
      });
    }catch{}
    return this.native()!==this.screen;
  }
  async browser(){
    if(!this.expanded)return this.enter();
    if(this.native()===this.screen||this.pending&&this.mode==='native')return;
    const operation=++this.operation;
    this.pending=true;this.mode='native';this.notice.hidden=true;
    try{
      if(this.screen.requestFullscreen){
        await this.screen.requestFullscreen({navigationUI:'hide'});
        if(operation!==this.operation){if(this.native()===this.screen)await this.leaveNative();return;}
        this.pending=false;if(this.native()!==this.screen)this.fallback();
      }else if(this.screen.webkitRequestFullscreen){
        this.screen.webkitRequestFullscreen();
        this.timer=setTimeout(()=>{if(operation===this.operation&&this.native()!==this.screen)this.fallback();},1000);
      }else this.fallback();
    }catch{if(operation===this.operation)this.fallback();}
  }
  async controller(){
    if(!this.expanded)return this.enter({native:false});
    const operation=++this.operation;
    this.pending=true;
    this.mode='switching';
    const left=await this.leaveNative();
    if(operation!==this.operation)return;
    if(!left){
      this.pending=false;
      this.mode='native';
      this.report('fullscreen-exit-blocked');
      return;
    }
    // Keep the same opaque stream surface; no restore/re-entry flash.
    this.fallback('fullscreen-controller');
    this.canvas.focus({preventScroll:true});
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
    this.mode=native?'native':'controller';
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
    this.mode=null;
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
    if(this.native()===this.screen){
      this.mode='exiting';
      if(!await this.leaveNative()){
        this.pending=false;
        this.mode='native';
        this.report('fullscreen-exit-blocked');
        return;
      }
    }
    this.restore();
  }
  toggle(){
    return this.expanded?this.exit():this.enter();
  }
}
