import assert from 'node:assert/strict';
import {asset} from './helpers.mjs';
const {Input}=await import(asset('stream/input.js'));
const target=()=>({events:{},style:{},addEventListener(k,fn){this.events[k]=fn},removeEventListener(){},setAttribute(){},focus(){},setPointerCapture(){},getBoundingClientRect:()=>({left:100,top:50,width:640,height:360}),width:1280,height:720});
globalThis.window=target();globalThis.document={...target(),hidden:false};Object.defineProperty(navigator,'getGamepads',{value:()=>[],configurable:true});
const event=(id,x,y)=>({pointerType:'touch',pointerId:id,clientX:x,clientY:y,preventDefault(){}});
function fixture(mode){const video=target(),sent=[],points=[];const input=new Input(video,buf=>{const v=new DataView(buf);sent.push([v.getUint8(12),v.getInt32(0),v.getInt32(4),v.getInt32(8)]);});input.onPointer=p=>points.push(p);input.configurePointer({mode});input.attach();return {video,input,sent,points,motion:()=>sent.filter(m=>m[0]===3).at(-1)};}
const direct=fixture('direct');direct.video.events.pointerdown(event(1,200,100));assert.deepEqual(direct.motion(),[3,0,200,100]);direct.video.events.pointerup(event(1,200,100));direct.video.events.pointerdown(event(2,500,300));assert.deepEqual(direct.motion(),[3,0,800,500]);direct.input.detach();
const pad=fixture('touchpad');pad.video.events.pointerdown(event(1,200,100));assert.deepEqual(pad.motion(),[3,0,640,360]);pad.video.events.pointermove(event(1,210,110));assert.deepEqual(pad.motion(),[3,0,660,380]);pad.video.events.pointerup(event(1,210,110));
pad.video.events.pointerdown(event(2,500,300));assert.deepEqual(pad.motion(),[3,0,660,380]);assert.equal(pad.points.at(-1).visible,true);
pad.input.configurePointer({mode:'touchpad',rumble:false});assert.equal(pad.input.touch.points.size,1); // Capability refresh must not cancel a gesture.
pad.input.setPaused(true);assert.equal(pad.points.at(-1).visible,false);pad.input.setPaused(false);assert.equal(pad.points.at(-1).visible,true);
pad.input.configurePointer({showCursor:false});assert.equal(pad.points.at(-1).visible,false);pad.input.detach();
console.log('Direct touch jumps; scaled touchpad retains a virtual pointer across lifts; helper visibility and capability refresh passed.');

const {setupViewport}=await import(asset('features/viewport.js'));
const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,{...target(),hidden:false,value:'',checked:false,textContent:''});return elements.get(id)};
let paused=true,closed=0,opened=0;const client={input:{configurePointer(){},release(){},renderPointer(){}}};
const viewport=setupViewport({$,getClient:()=>client,closeMenu(){closed++;paused=false},openMenu(){opened++;paused=true}});
assert.equal($('pointerLock').disabled,true);assert.equal($('allowRumble').disabled,true);assert.equal($('testRumble').disabled,true);
$('video').requestPointerLock=async()=>{assert.equal(paused,false);document.pointerLockElement=$('video');};viewport.refreshCapabilities();assert.equal($('pointerLock').disabled,false);
await $('pointerLock').onclick();assert.equal(closed,1);assert.equal(opened,0);assert.match($('pointerLockStatus').textContent,/aktiv/);
document.pointerLockElement=null;$('video').requestPointerLock=async()=>{throw Error('denied')};await $('pointerLock').onclick();assert.equal(opened,1);assert.equal(paused,true);assert.match($('pointerLockStatus').textContent,/nicht gewährt/);
let pulse;Object.defineProperty(navigator,'getGamepads',{value:()=>[{hapticActuators:[{pulse:(strength,duration)=>{pulse={strength,duration};return Promise.resolve(true)}}]}],configurable:true});viewport.refreshCapabilities();assert.equal($('testRumble').disabled,false);await $('testRumble').onclick();assert.deepEqual(pulse,{strength:.5,duration:120});assert.match($('rumbleTestStatus').textContent,/angefordert/);
console.log('Pointer Lock closes the pausing overlay before requesting, denied requests reopen it, missing APIs disable controls and pulse-only haptics are tested honestly.');

let resolveGrant,exited=0;document.exitPointerLock=()=>{exited++;document.pointerLockElement=null;};
$('video').requestPointerLock=()=>new Promise(resolve=>resolveGrant=resolve);
const pending=$('pointerLock').onclick();viewport.cleanup();document.pointerLockElement=$('video');resolveGrant();await pending;assert.equal(exited,1);assert.equal(document.pointerLockElement,null);
console.log('Late Pointer Lock grant after teardown is exited instead of attaching to a stale stream.');

const idle=fixture('touchpad');idle.video.events.pointerdown(event(3,200,100));idle.video.events.pointerup(event(3,200,100));assert.equal(idle.points.at(-1).visible,true);
await new Promise(resolve=>setTimeout(resolve,2600));assert.equal(idle.points.at(-1).visible,false);
idle.input.configurePointer({mode:'touchpad'});idle.input.renderPointer();assert.equal(idle.points.at(-1).visible,false);
idle.video.events.pointerdown(event(4,220,110));assert.equal(idle.points.at(-1).visible,true);idle.input.detach();assert.equal(idle.points.at(-1).visible,false);
const {showControllerFullscreenWarning}=await import(asset('browser/controller-fullscreen-warning.js'));
const warning={hidden:true};document.fullscreenElement=null;showControllerFullscreenWarning(warning,true);assert.equal(warning.hidden,true);
document.fullscreenElement={};showControllerFullscreenWarning(warning,false);assert.equal(warning.hidden,true);showControllerFullscreenWarning(warning,true);assert.equal(warning.hidden,false);
document.fullscreenElement=null;showControllerFullscreenWarning(warning,true);assert.equal(warning.hidden,true);
console.log('Pointer idles, refresh cannot wake it, real input wakes it; controller warning requires actual native fullscreen.');
