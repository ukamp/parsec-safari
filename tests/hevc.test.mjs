import assert from 'node:assert/strict';
import {asset} from './helpers.mjs';
const {inspectHevc,nalUnits,supportsHevc}=await import(asset('stream/hevc.js'));
const {VideoPlayer}=await import(asset('stream/video.js'));
const {hevcSample}=await import(asset('features/hevc-sample.js'));
const {sample}=await import(asset('features/video-sample.js'));
const Msg=await import(asset('stream/msg.js'));
const info=inspectHevc(hevcSample);
assert.equal(info.key,true);assert.match(info.codec,/^hvc1\.1\.6\.L\d+\.90$/);
assert.throws(()=>inspectHevc(new Uint8Array([0,0,1,0x42,1,0])));
const body=cfg=>JSON.parse(new TextDecoder().decode(new Uint8Array(Msg.init(cfg),13,Msg.init(cfg).byteLength-14)));
assert.equal(body({video_codec:'hevc'})._flags,9);assert.equal(body({video_codec:'h264'})._flags,8);
assert.equal(new DataView(Msg.reinit({video_codec:'hevc'})).getInt32(4),9);assert.equal(new DataView(Msg.reinit()).getInt32(4),8);
let chunks=[],renders=0,failed=0;
globalThis.VideoDecoder=class{
 static async isConfigSupported(){return {supported:true};}
 constructor(callbacks){this.callbacks=callbacks;this.state='unconfigured';this.decodeQueueSize=0;VideoDecoder.last=this;}
 configure(cfg){this.cfg=cfg;this.state='configured';}
 decode(chunk){chunks.push(chunk);this.callbacks.output({displayWidth:64,displayHeight:64,close(){}});}
 close(){this.state='closed';}
};
globalThis.EncodedVideoChunk=class{constructor(data){Object.assign(this,data);}};
const canvas={getContext:()=>({drawImage(){renders++},clearRect(){}})};
const player=new VideoPlayer(canvas,()=>failed++);player.setHevc(true);
// Parameter sets in independent packets must be retained for the keyframe.
for(const unit of nalUnits(hevcSample)){
 const bytes=new Uint8Array(unit.bytes.length+4);bytes.set([0,0,0,1]);bytes.set(unit.bytes,4);player.push(bytes.buffer);
}
assert.equal(renders,1);assert.equal(chunks[0].type,'key');assert.ok(inspectHevc(new Uint8Array(chunks[0].data)).codec);
assert.equal(player.snapshot().codec,info.codec);assert.equal(failed,0);
player.fallbackH264();player.push(hevcSample.buffer);assert.equal(renders,1);
player.push(sample.buffer);assert.equal(renders,2);assert.match(player.snapshot().codec,/^avc1\./);
player.destroy();assert.equal(await supportsHevc(),true);
VideoDecoder.isConfigSupported=async()=>({supported:false});assert.equal(await supportsHevc(),false);
console.log('HEVC SPS/profile parsing, keyframe/parameter retention, H.264 switch and codec flags passed (decoder mocked).');
