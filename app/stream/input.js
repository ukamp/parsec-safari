import * as Msg from './msg.js';
import * as Enum from './enum.js';
import { PadBindings,normalizeBindings } from './pad-bindings.js';
import { GamepadManager } from './gamepad.js';
export class Input {
  constructor(video,send,onGamepadStatus=()=>{
  }){
    this.paused=false;
    this.bindings=new PadBindings(send);
    this.onGamepadStatus=onGamepadStatus;
    this.video=video;
    this.send=send;
    this.listeners=[];
    this.keys=new Set();
    this.buttons=new Set();
    this.gamepad=null;
  }
  on(target,type,fn,opts){
    const original=fn;
    fn=event=>{
      if(target===this.video&&this.paused)return;
      original(event);
    };
    target.addEventListener(type,fn,opts);
    this.listeners.push(()=>target.removeEventListener(type,fn,opts));
  }
  position(e){
    const r=this.video.getBoundingClientRect(),w=this.video.width,h=this.video.height;
    if(!w||!h)return;
    const scale=Math.min(r.width/w,r.height/h),left=r.left+(r.width-w*scale)/2,top=r.top+(r.height-h*scale)/2;
    this.send(Msg.motion(0,Math.round(Math.max(0,Math.min(w,(e.clientX-left)/scale))),Math.round(Math.max(0,Math.min(h,(e.clientY-top)/scale)))));
  }
  release(){
    for(const k of this.keys)this.send(Msg.kb(k,0,0));
    for(const b of this.buttons)this.send(Msg.mouse(b,0));
    this.keys.clear();
    this.buttons.clear();
  }
  attach(){
    const v=this.video;
    this.on(v,'pointerdown',e=>{
      if(!e.isPrimary)return;
      e.preventDefault();
      v.focus();
      v.setPointerCapture(e.pointerId);
      this.position(e);
      const b=e.button===2?3:e.button===1?2:1;
      this.buttons.add(b);
      this.send(Msg.mouse(b,1));
    });
    this.on(v,'pointermove',e=>{
      if(e.isPrimary)this.position(e);
    });
    this.on(v,'pointerup',e=>{
      if(!e.isPrimary)return;
      e.preventDefault();
      this.position(e);
      this.release();
    });
    this.on(v,'pointercancel',()=>this.release());
    this.on(v,'contextmenu',e=>e.preventDefault());
    this.on(v,'wheel',e=>{
      e.preventDefault();
      this.send(Msg.mouseWheel(-e.deltaX/2,-e.deltaY/2));
    },{
      passive:false
    });
    for(const type of ['keydown','keyup'])this.on(v,type,e=>{
      if(e.code==='Tab')return;
      const key=Enum.Scancodes[e.code];
      if(!key)return;
      e.preventDefault();
      if(type==='keydown')this.keys.add(key);
      else this.keys.delete(key);
      this.send(Msg.kb(key,0,type==='keydown'?1:0));
    });
    this.on(v,'blur',()=>this.release());
    this.on(window,'blur',()=>{
      this.release();
      this.syncGamepad();
    });
    this.on(window,'focus',()=>this.syncGamepad());
    this.on(document,'visibilitychange',()=>{
      if(document.hidden)this.release();
      this.syncGamepad();
    });
    // Safari may blur the window while entering native fullscreen without
    // emitting a matching window focus. Fullscreen itself owns the stream.
    this.on(document,'fullscreenchange',()=>this.syncGamepad());
    this.on(document,'webkitfullscreenchange',()=>this.syncGamepad());
    this.gamepad=new GamepadManager((i,b,value)=>this.bindings.button(i,b,value),(i,a,value)=>this.bindings.axis(i,a,value),i=>this.send(Msg.unplug(i)),this.onGamepadStatus,{
      paused:true
    });
    this.syncGamepad();
  }
  streamFullscreen(){
    const element=document.fullscreenElement||document.webkitFullscreenElement;
    return element===this.video||!!element?.contains?.(this.video)||
      !!this.video.parentElement?.classList.contains('screen-expanded');
  }
  syncGamepad(){
    const focused=typeof document.hasFocus!=='function'||document.hasFocus();
    if(this.paused||document.hidden||(!focused&&!this.streamFullscreen())){
      this.gamepad?.pause();
    }else{
      this.gamepad?.resume();
    }
  }
  setPaused(paused){
    this.paused=paused;
    if(paused)this.release();
    this.syncGamepad();
  }
  setBindings(settings){
    this.gamepad?.pause();
    this.bindings.settings=normalizeBindings(settings);
    this.syncGamepad();
  }
  setMouseMode(relative,hidden){
    this.video.style.cursor=hidden?'none':'';
  }
  setCursor(){
  }
  detach(){
    this.release();
    for(const off of this.listeners)off();
    this.listeners=[];
    this.gamepad?.destroy();
    this.gamepad=null;
    this.video.style.cursor='';
  }
}
