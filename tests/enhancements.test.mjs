import assert from 'node:assert/strict';
import {asset} from './helpers.mjs';
const {Reconnect,retryable}=await import(asset('core/reconnect.js'));
let jobs=[],attempts=[],allowed=true;
const retry=new Reconnect({connect:p=>attempts.push(p),allowed:()=>allowed,schedule:(fn,ms)=>{jobs.push({fn,ms});return jobs.length;},cancel:()=>{}});
retry.start('synthetic-peer');
assert.equal(retry.failed(-6101),false);assert.equal(retryable(-13015),false);
for(let i=0;i<3;i++){assert.equal(retry.failed(-6023),true);jobs.at(-1).fn();}
assert.deepEqual(jobs.map(j=>j.ms),[1000,3000,7000]);assert.equal(attempts.length,3);assert.equal(retry.failed(-6023),false);
retry.recovered();assert.equal(retry.failed(-6024),true);const stale=jobs.at(-1).fn;retry.stop();stale();assert.equal(attempts.length,3);
retry.start('synthetic-peer');allowed=false;assert.equal(retry.failed(-6023),false);

const {TouchSurface}=await import(asset('stream/touch.js'));
let clock=0,timer=null,events=[],zoom=1;
const touch=new TouchSurface({move:(...v)=>events.push(['move',...v]),button:(...v)=>events.push(['button',...v]),wheel:(...v)=>events.push(['wheel',...v]),zoom:z=>zoom=z,getZoom:()=>zoom,now:()=>clock,schedule:fn=>{timer=fn;return 1;},cancel:()=>{timer=null;}});
const e=(id,x,y)=>({pointerId:id,clientX:x,clientY:y,preventDefault(){}});
touch.down(e(1,0,0));clock=100;touch.up(e(1,0,0));assert.deepEqual(events.filter(v=>v[0]==='button'),[['button',1,true],['button',1,false]]);
events=[];touch.down(e(1,0,0));touch.down(e(2,30,0));clock+=100;touch.up(e(1,0,0));touch.up(e(2,30,0));assert.deepEqual(events.filter(v=>v[0]==='button'),[['button',3,true],['button',3,false]]);
events=[];touch.down(e(1,0,0));touch.down(e(2,30,0));touch.moveEvent(e(1,0,20));touch.moveEvent(e(2,30,20));touch.up(e(1,0,20));touch.up(e(2,30,20));assert.ok(events.some(v=>v[0]==='wheel'));assert.equal(events.some(v=>v[0]==='button'),false);
touch.down(e(1,0,0));touch.down(e(2,30,0));touch.moveEvent(e(2,80,0));assert.ok(zoom>1);touch.reset();
events=[];touch.down(e(1,0,0));timer();touch.moveEvent(e(1,60,0));touch.reset();assert.deepEqual(events.filter(v=>v[0]==='button'),[['button',1,true],['button',1,false]]);

const {hostData}=await import(asset('stream/host-data.js'));
function fixture(value){const body=new TextEncoder().encode(JSON.stringify(value)+'\0'),out=new Uint8Array(13+body.length);out.set(body,13);return {buffer:out.buffer,message:{type:17,data1:12,data0:body.length}};}
let f=fixture([{id:'display-a',name:'<img src=x>'},{id:4},{id:'bad\0id'}]);
assert.deepEqual(hostData(f.message,f.buffer),{displays:[{id:'display-a',name:'<img src=x>'}]});
assert.equal(hostData({...f.message,data0:999999},f.buffer),null);
const {textKeys}=await import(asset('features/keyboard.js'));
assert.deepEqual(textKeys('aA1\n'),[{code:'KeyA',shift:false},{code:'KeyA',shift:true},{code:'Digit1',shift:false},{code:'Enter',shift:false}]);assert.equal(textKeys('é'),null);
const {normalizeQuality,streamConfig}=await import(asset('core/preferences.js'));
assert.equal(normalizeQuality({resolution:'3840x2160',constantFps:true}).constantFps,true);assert.equal(streamConfig({constantFps:true}).full_fps,true);
const Msg=await import(asset('stream/msg.js'));let packet=Msg.config({full_fps:true,output:'display-a'});let body=JSON.parse(new TextDecoder().decode(new Uint8Array(packet,13,packet.byteLength-14)));assert.equal(body.video[0].fullFPS,true);assert.equal(body.video[0].output,'display-a');
console.log('Bounded retry, cancellation, touch gestures, display validation, text-key limits and constant-FPS payload passed.');
const {isAppleTouch}=await import(asset('browser/fullscreen.js'));
assert.equal(isAppleTouch({userAgent:'Mozilla iPad',maxTouchPoints:5}),true);
assert.equal(isAppleTouch({userAgent:'Mozilla Macintosh',maxTouchPoints:5}),true);
assert.equal(isAppleTouch({userAgent:'Mozilla Macintosh',maxTouchPoints:0}),false);
assert.equal(isAppleTouch({userAgent:'Mozilla Android',maxTouchPoints:5}),false);
