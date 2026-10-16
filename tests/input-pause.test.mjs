import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const {Input} = await import(asset('stream/input.js'));
const {defaultBindings} = await import(asset('stream/pad-bindings.js'));
function target(){return {events:{},addEventListener(type,fn){this.events[type]=fn;},removeEventListener(){},style:{},focus(){},getBoundingClientRect(){return {left:0,top:0,width:1280,height:720};},width:1280,height:720,setPointerCapture(){}};}
globalThis.window=target();globalThis.document={...target(),hidden:false};Object.defineProperty(navigator,'getGamepads',{value:()=>[],configurable:true});
const video=target(),messages=[];const input=new Input(video,b=>{const v=new DataView(b);messages.push([v.getUint8(12),v.getInt32(0),v.getInt32(4),v.getInt32(8)]);});
input.attach();const key={code:'KeyA',preventDefault(){}};video.events.keydown(key);assert.deepEqual(messages.at(-1),[0,4,0,1]);input.setPaused(true);assert.deepEqual(messages.at(-1),[0,4,0,0]);let before=messages.length;video.events.keydown(key);video.events.pointerdown({isPrimary:true});window.events.focus();assert.equal(messages.length,before);assert.equal(input.gamepad.paused,true);
input.setPaused(false);video.events.keydown(key);assert.deepEqual(messages.at(-1),[0,4,0,1]);
const settings=defaultBindings();input.setBindings(settings);settings.buttons[0]=1;assert.equal(input.bindings.settings.buttons[0],0);input.detach();assert.equal(input.gamepad,null);
console.log('Menu input pause releases held keys, blocks canvas input, survives focus and copies remapping preferences before teardown.');
