import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const {StreamRequest} = await import(asset('stream/stream-request.js'));
function fixture(overrides={}){
 const sent=[],events=[],cancelled=[];let callback;let video=false,blocked=false,fatal=null;
 const r=new StreamRequest({send:message=>{sent.push(message);return true;},config:{encoder_bitrate:8},diagnostic:(stage,metrics)=>events.push({stage,metrics}),hasVideo:()=>video,blocked:()=>blocked,onFatal:code=>fatal=code,schedule:(fn,ms)=>{assert.equal(ms,5000);callback=fn;return 42;},cancel:id=>cancelled.push(id),...overrides});
 return {r,sent,events,cancelled,tick:()=>callback?.(),video:()=>video=true,block:()=>blocked=true,fatal:()=>fatal};
}
for(const order of [['control','video'],['video','control']]){
 const f=fixture();f.r.open(order[0]);assert.equal(f.sent.length,0);f.r.open(order[1]);
 assert.deepEqual(f.sent.map(b=>new DataView(b).getUint8(12)),[11]);
 assert.ok(new TextDecoder().decode(f.sent[0]).includes('mediaContainer'));
 f.r.open('control');f.r.open('video');assert.equal(f.sent.length,1);
 f.tick();assert.deepEqual(f.sent.map(b=>new DataView(b).getUint8(12)),[11,13]);
 f.r.close();assert.equal(f.fatal(),null);
}
for(const condition of ['video','block']){const f=fixture();f.r.open('control');f.r.open('video');f[condition]();f.tick();assert.equal(f.sent.length,1);}
const stopped=fixture();stopped.r.open('control');stopped.r.open('video');stopped.r.close();stopped.tick();assert.deepEqual(stopped.cancelled,[42]);assert.equal(stopped.sent.length,1);
const failure=fixture({send:()=>false});failure.r.open('control');failure.r.open('video');assert.equal(failure.fatal(),-6108);assert.equal(failure.events.some(e=>e.stage==='stream-init-json-sent'),false);
const thrown=fixture({send:()=>{throw Error('synthetic');}});thrown.r.open('video');thrown.r.open('control');assert.equal(thrown.fatal(),-6108);
console.log('Stream startup ordering, single recovery, video/shutter suppression, teardown and send failure checks passed.');
