import { TouchSurface } from './touch.js';
import * as Msg from './msg.js';
import * as Enum from './enum.js';
import { PadBindings,normalizeBindings } from './pad-bindings.js';
import { GamepadManager } from './gamepad.js';
export class Input {
  constructor(video,send,onGamepadStatus=()=>{
  },diagnostic=()=>{}){
    this.diagnostic=diagnostic;
    this.rtValues=[0,0,0,0];
    this.rtPresses=0;
    this.rtReleases=0;
    this.focusLosses=0;
    this.rumbleTimes=[0,0,0,0];
    this.paused=false;this.blocked=false;
    this.bindings=new PadBindings(send);
    this.onGamepadStatus=onGamepadStatus;
    this.video=video;
    this.send=send;
    this.listeners=[];
    this.keys=new Set();
    this.buttons=new Set();
    this.gamepad=null;
    this.pointer={mode:'direct',sensitivity:1};
    this.onZoom=()=>{};this.getZoom=()=>1;
  }
  on(target,type,fn,opts){
    const original=fn;
    fn=event=>{
      if(target===this.video&&(this.paused||this.blocked))return;
      original(event);
    };
    target.addEventListener(type,fn,opts);
    this.listeners.push(()=>target.removeEventListener(type,fn,opts));
  }
  configurePointer(options){this.pointer={...this.pointer,...options};}
  button(button,down){
    if(down)this.buttons.add(button);else this.buttons.delete(button);
    this.send(Msg.mouse(button,down?1:0));
  }
  specialKey(code,down){
    if(this.paused||this.blocked)return;
    const key=Enum.Scancodes[code];if(!key)return;
    if(down)this.keys.add(key);else this.keys.delete(key);
    this.send(Msg.kb(key,0,down?1:0));
  }
  position(e){
    const r=this.video.getBoundingClientRect(),w=this.video.width,h=this.video.height;
    if(!w||!h)return;
    const scale=Math.min(r.width/w,r.height/h),left=r.left+(r.width-w*scale)/2,top=r.top+(r.height-h*scale)/2;
    this.send(Msg.motion(0,Math.round(Math.max(0,Math.min(w,(e.clientX-left)/scale))),Math.round(Math.max(0,Math.min(h,(e.clientY-top)/scale)))));
  }
  release(){
    this.touch?.reset();
    for(const k of this.keys)this.send(Msg.kb(k,0,0));
    for(const b of this.buttons)this.send(Msg.mouse(b,0));
    this.keys.clear();
    this.buttons.clear();
  }
  rumble(index,strong,weak){
    if(this.paused||this.blocked||document.hidden||!this.pointer.rumble||!Number.isInteger(index)||index<0||index>3)return;
    if(![strong,weak].every(value=>Number.isInteger(value)&&value>=0&&value<=65535))return;
    const now=performance.now();
    if((strong||weak)&&this.rumbleTimes[index]&&now-this.rumbleTimes[index]<40)return;
    this.rumbleTimes[index]=now;
    try{
      const pad=navigator.getGamepads?.()[index],actuator=pad?.vibrationActuator||pad?.hapticActuators?.[0];
      const effect=actuator?.playEffect?.('dual-rumble',{duration:120,startDelay:0,strongMagnitude:strong/65535,weakMagnitude:weak/65535});
      effect?.catch?.(()=>{});
    }catch{}
  }
  stopRumble(){
    try{for(const pad of navigator.getGamepads?.()||[]){const actuator=pad?.vibrationActuator||pad?.hapticActuators?.[0];actuator?.reset?.()?.catch?.(()=>{});}}catch{}
  }
  reset(){
    this.release();
    this.gamepad?.pause();
    this.send(Msg.release());
    this.syncGamepad();
  }
  attach(){
    const v=this.video;
    this.touch=new TouchSurface({
      move:(x,y,dx,dy,initial)=>{
        if(this.pointer.mode==='touchpad'){
          if(!initial)this.send(Msg.motion(1,Math.round(dx*this.pointer.sensitivity),Math.round(dy*this.pointer.sensitivity)));
        }else this.position({clientX:x,clientY:y});
      },
      button:(button,down)=>this.button(button,down),
      wheel:(x,y)=>this.send(Msg.mouseWheel(x,y)),
      zoom:value=>this.onZoom(value),getZoom:()=>this.getZoom()
    });
    v.setAttribute?.('inputmode','none');
    v.setAttribute?.('virtualkeyboardpolicy','manual');
    this.on(v,'pointerdown',e=>{
      if(e.pointerType==='touch'){v.setPointerCapture?.(e.pointerId);v.focus({preventScroll:true});this.touch.down(e);return;}
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
      if(e.pointerType==='touch'){this.touch.moveEvent(e);return;}
      if(document.pointerLockElement===v){this.send(Msg.motion(1,Math.round(e.movementX*this.pointer.sensitivity),Math.round(e.movementY*this.pointer.sensitivity)));return;}
      if(e.isPrimary)this.position(e);
    });
    this.on(v,'pointerup',e=>{
      if(e.pointerType==='touch'){this.touch.up(e);return;}
      if(!e.isPrimary)return;
      e.preventDefault();
      this.position(e);
      for(const b of [...this.buttons])this.button(b,false);
    });
    this.on(v,'pointercancel',()=>{this.touch.reset();this.release();});
    this.on(v,'lostpointercapture',e=>{if(e.pointerType!=='touch'||this.touch.points.has(e.pointerId)){this.touch.reset();this.release();}});
    this.on(v,'contextmenu',e=>e.preventDefault());
    this.on(v,'wheel',e=>{
      e.preventDefault();
      this.send(Msg.mouseWheel(-e.deltaX/2,-e.deltaY/2));
    },{
      passive:false
    });
    for(const type of ['keydown','keyup'])this.on(v,type,e=>{
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
      this.focusLosses++;
      this.reportController('controller-window-blur');
      this.syncGamepad();
    });
    this.on(document,'focusin',()=>{
      if(!this.paused)this.reportController('controller-focus-changed');
    });
    this.on(window,'focus',()=>this.syncGamepad());
    this.on(document,'visibilitychange',()=>{
      if(document.hidden){this.release();this.stopRumble();this.send(Msg.release());}
      this.syncGamepad();
    });
    // Browser focus is independent of gamepad delivery. Only explicit UI
    // suspension and page visibility decide whether gamepads are forwarded.
    this.on(document,'fullscreenchange',()=>this.syncGamepad());
    this.on(document,'webkitfullscreenchange',()=>this.syncGamepad());
    this.gamepad=new GamepadManager((i,b,value)=>{
      if(b===7){
        if(value>0&&!this.rtValues[i])this.rtPresses++;
        if(!value&&this.rtValues[i]>0)this.rtReleases++;
        this.rtValues[i]=value;
        this.reportController('controller-rt');
      }
      this.bindings.button(i,b,value);
    },(i,a,value)=>this.bindings.axis(i,a,value),i=>this.send(Msg.unplug(i)),this.onGamepadStatus,{
      paused:true
    });
    this.syncGamepad();
  }
  reportController(stage){
    this.diagnostic(stage,{
      rtPresses:this.rtPresses,rtReleases:this.rtReleases,
      rtValue:Math.max(...this.rtValues),focusLosses:this.focusLosses,
      pageFocused:document.hasFocus?.()??true,
      focusTarget:document.activeElement===this.video?0:
        /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)?1:
        document.activeElement?.tagName==='BUTTON'?2:3
    });
  }
  syncGamepad(){
    if(this.paused||this.blocked||document.hidden){
      this.gamepad?.pause();
    }else{
      this.gamepad?.resume();
    }
  }
  setBlocked(blocked){
    this.blocked=blocked;
    if(blocked){this.release();this.stopRumble();this.send(Msg.release());}
    this.syncGamepad();
  }
  setPaused(paused){
    this.paused=paused;
    if(paused){this.release();this.stopRumble();this.send(Msg.release());}
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
    this.stopRumble();
    for(const off of this.listeners)off();
    this.listeners=[];
    this.gamepad?.destroy();
    this.gamepad=null;
    this.video.style.cursor='';
  }
}
