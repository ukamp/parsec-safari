import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const {Input} = await import(asset('stream/input.js'));
const {defaultBindings} = await import(asset('stream/pad-bindings.js'));
function target(){return {events:{},addEventListener(type,fn){this.events[type]=fn;},removeEventListener(){},style:{},focus(){},getBoundingClientRect(){return {left:0,top:0,width:1280,height:720};},width:1280,height:720,setPointerCapture(){}};}
globalThis.window=target();globalThis.document={...target(),hidden:false};Object.defineProperty(navigator,'getGamepads',{value:()=>[],configurable:true});
const video=target(),messages=[];const input=new Input(video,b=>{const v=new DataView(b);messages.push([v.getUint8(12),v.getInt32(0),v.getInt32(4),v.getInt32(8)]);});
input.attach();const key={code:'KeyA',preventDefault(){}};video.events.keydown(key);assert.deepEqual(messages.at(-1),[0,4,0,1]);input.setPaused(true);assert.deepEqual(messages.at(-1),[0,4,0,0]);let before=messages.length;video.events.keydown(key);video.events.pointerdown({isPrimary:true});window.events.focus();assert.equal(messages.length,before);assert.equal(input.gamepad.paused,true);
input.setPaused(false);video.events.keydown(key);assert.deepEqual(messages.at(-1),[0,4,0,1]);
let tabPrevented=false;
video.events.keydown({code:'Tab',preventDefault(){tabPrevented=true;}});
assert.equal(tabPrevented,true);assert.deepEqual(messages.at(-1),[0,43,0,1]);
video.events.keyup({code:'Tab',preventDefault(){}});assert.deepEqual(messages.at(-1),[0,43,0,0]);
const settings=defaultBindings();input.setBindings(settings);settings.buttons[0]=1;assert.equal(input.bindings.settings.buttons[0],0);input.detach();assert.equal(input.gamepad,null);
console.log('Menu input pause releases held keys, blocks canvas input, survives focus and copies remapping preferences before teardown.');

let focused=true;document.hasFocus=()=>focused;const controllerVideo=target();let focusCalls=0,blurCalls=0;controllerVideo.focus=()=>focusCalls++;controllerVideo.setAttribute=()=>{};const text={tagName:'INPUT',type:'password',blur(){blurCalls++}};document.activeElement=text;
const pad={connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({value:0,pressed:false}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[pad],configurable:true});const forwarded=[];const controllerInput=new Input(controllerVideo,buffer=>{const v=new DataView(buffer);forwarded.push([v.getUint8(12),v.getInt32(0),v.getInt32(4)])});controllerInput.attach();
for(const mode of ['normal','native','webkit','viewport']){
 document.fullscreenElement=mode==='native'?{contains:element=>element===controllerVideo}:null;document.webkitFullscreenElement=mode==='webkit'?{contains:element=>element===controllerVideo}:null;controllerVideo.parentElement={classList:{contains:()=>mode==='viewport'}};
 forwarded.length=0;
 for(let press=0;press<2;press++){
  pad.buttons[7]={value:1,pressed:true};controllerInput.gamepad._poll();focused=false;window.events.blur();assert.equal(controllerInput.gamepad.paused,false);pad.buttons[7]={value:0,pressed:false};controllerInput.gamepad._poll();
 }
 assert.deepEqual(forwarded.filter(m=>m[0]===5&&m[1]===5),[[5,5,32767],[5,5,0],[5,5,32767],[5,5,0]],mode);
 assert.equal(focusCalls,0,mode);assert.equal(blurCalls,0,mode);assert.equal(document.activeElement,text,mode);
}
controllerInput.setPaused(true);window.events.focus();document.events.fullscreenchange();assert.equal(controllerInput.gamepad.paused,true);controllerInput.setPaused(false);document.hidden=true;document.events.visibilitychange();assert.equal(controllerInput.gamepad.paused,true);document.hidden=false;document.events.visibilitychange();assert.equal(controllerInput.gamepad.paused,false);controllerInput.detach();
console.log('Double RT presses forward analog down/up without DOM focus or blur in normal/native/WebKit/controller views; menu/background still suspend.');
