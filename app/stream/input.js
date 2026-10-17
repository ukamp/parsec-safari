import {actuatorFor,vibrate} from '../browser/input-capabilities.js';
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
    this.pointer={mode:'direct',sensitivity:1,showCursor:true};
    this.pointerIdle=true;this.pointerIdleTimer=null;
    this.cursor={x:.5,y:.5};this.touchPointer=false;this.onPointer=()=>{};this.onHapticStatus=()=>{};
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
  configurePointer(options){if(options.mode&&options.mode!==this.pointer.mode)this.touch?.reset();if(this.pointer.rumble&&options.rumble===false)this.stopRumble();this.pointer={...this.pointer,...options};this.renderPointer();}
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
  geometry(){
    const r=this.video.getBoundingClientRect(),w=this.video.width,h=this.video.height;
    if(!w||!h||!r.width||!r.height)return null;
    const scale=Math.min(r.width/w,r.height/h);
    return {w,h,scale,left:r.left+(r.width-w*scale)/2,top:r.top+(r.height-h*scale)/2};
  }
  pointerActivity(){
    clearTimeout(this.pointerIdleTimer);this.pointerIdle=false;
    this.pointerIdleTimer=setTimeout(()=>{this.pointerIdle=true;this.renderPointer();},2500);
    this.pointerIdleTimer?.unref?.();
    this.renderPointer();
  }
  renderPointer(){
    this.onPointer({x:this.cursor.x,y:this.cursor.y,visible:!this.pointerIdle&&this.pointer.showCursor!==false&&(this.touchPointer||this.hostCursorHidden)&&!this.paused&&!this.blocked&&!document.hidden&&document.pointerLockElement!==this.video});
  }
  position(e){
    const g=this.geometry();if(!g)return;
    this.cursor.x=Math.max(0,Math.min(1,(e.clientX-g.left)/(g.scale*g.w)));
    this.cursor.y=Math.max(0,Math.min(1,(e.clientY-g.top)/(g.scale*g.h)));
    this.sendCursor();
  }
  sendCursor(){
    this.send(Msg.motion(0,Math.min(Math.max(0,this.video.width-1),Math.round(this.cursor.x*this.video.width)),Math.min(Math.max(0,this.video.height-1),Math.round(this.cursor.y*this.video.height))));
    this.renderPointer();
  }
  moveTouchpad(dx,dy,initial){
    const g=this.geometry();if(!g)return;
    if(!initial){
      this.cursor.x=Math.max(0,Math.min(1,this.cursor.x+dx*this.pointer.sensitivity/(g.scale*g.w)));
      this.cursor.y=Math.max(0,Math.min(1,this.cursor.y+dy*this.pointer.sensitivity/(g.scale*g.h)));
    }
    // Absolute host coordinates emulate a desktop touchpad without Pointer Lock.
    // Finger-down synchronizes the last local position instead of jumping there.
    this.sendCursor();
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
      const actuator=actuatorFor(navigator.getGamepads?.()[index]);
      if(!actuator){this.onHapticStatus('unavailable');return;}
      vibrate(actuator,strong/65535,weak/65535).then(result=>this.onHapticStatus(result===false||result==='preempted'?'failed':'requested')).catch(()=>this.onHapticStatus('failed'));
    }catch{this.onHapticStatus('failed');}
  }
  stopRumble(){
    try{for(const pad of navigator.getGamepads?.()||[]){const actuator=actuatorFor(pad);const result=typeof actuator?.reset==='function'?actuator.reset():typeof actuator?.pulse==='function'?actuator.pulse(0,0):typeof actuator?.playEffect==='function'?actuator.playEffect('dual-rumble',{duration:0,strongMagnitude:0,weakMagnitude:0}):null;result?.catch?.(()=>{});}}catch{}
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
          this.moveTouchpad(dx,dy,initial);
        }else this.position({clientX:x,clientY:y});
      },
      button:(button,down)=>this.button(button,down),
      wheel:(x,y)=>this.send(Msg.mouseWheel(x,y)),
      zoom:value=>this.onZoom(value),getZoom:()=>this.getZoom()
    });
    v.setAttribute?.('inputmode','none');
    v.setAttribute?.('virtualkeyboardpolicy','manual');
    this.on(v,'pointerdown',e=>{
      this.pointerActivity();
      if(e.pointerType==='touch'){this.touchPointer=true;v.setPointerCapture?.(e.pointerId);v.focus({preventScroll:true});this.touch.down(e);return;}
      if(!e.isPrimary)return;
      this.touchPointer=false;this.renderPointer();
      e.preventDefault();
      v.focus();
      v.setPointerCapture(e.pointerId);
      this.position(e);
      const b=e.button===2?3:e.button===1?2:1;
      this.buttons.add(b);
      this.send(Msg.mouse(b,1));
    });
    this.on(v,'pointermove',e=>{
      this.pointerActivity();
      if(e.pointerType==='touch'){this.touch.moveEvent(e);return;}
      this.touchPointer=false;this.renderPointer();
      if(document.pointerLockElement===v){this.send(Msg.motion(1,Math.round(e.movementX*this.pointer.sensitivity),Math.round(e.movementY*this.pointer.sensitivity)));return;}
      if(e.isPrimary)this.position(e);
    });
    this.on(v,'pointerup',e=>{
      this.pointerActivity();
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
      this.pointerActivity();
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
    this.on(document,'fullscreenchange',()=>{this.syncGamepad();this.renderPointer();});
    this.on(document,'webkitfullscreenchange',()=>{this.syncGamepad();this.renderPointer();});
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
    this.renderPointer();
    this.on(window,'resize',()=>this.renderPointer());
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
    this.renderPointer();
    if(blocked){this.release();this.stopRumble();this.send(Msg.release());}
    this.syncGamepad();
  }
  setPaused(paused){
    this.paused=paused;
    this.renderPointer();
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
    this.hostCursorHidden=!!hidden;this.renderPointer();
  }
  setCursor(){
  }
  detach(){
    clearTimeout(this.pointerIdleTimer);this.pointerIdleTimer=null;this.pointerIdle=true;
    this.release();
    this.stopRumble();
    for(const off of this.listeners)off();
    this.listeners=[];
    this.gamepad?.destroy();
    this.gamepad=null;
    this.video.style.cursor='';
    this.touchPointer=false;this.hostCursorHidden=false;this.renderPointer();
  }
}
