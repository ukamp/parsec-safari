import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const Msg = await import(asset('stream/msg.js'));
const init=Msg.init({server_resolution_x:1280,server_resolution_y:720});
const v=new DataView(init);assert.equal(v.getUint8(12),11);assert.equal(v.getInt32(0),init.byteLength-13);assert.equal(v.getInt32(4),0);assert.equal(v.getInt32(8),0);assert.equal(new Uint8Array(init).at(-1),0);
const body=JSON.parse(new TextDecoder().decode(new Uint8Array(init,13,init.byteLength-14)));
assert.deepEqual(Object.keys(body),['_version','_max_w','_max_h','_flags','resolutionX','resolutionY','mediaContainer','refreshRate']);
assert.equal(body._version,1);assert.equal(body.mediaContainer,0);assert.equal(body._flags,8);
assert.deepEqual([...new Uint8Array(Msg.motion(1,258,-2))],[0,0,0,1,0,0,1,2,255,255,255,254,3]);
assert.deepEqual([...new Uint8Array(Msg.reinit())],[0,0,0,0,0,0,0,8,0,0,0,1,13]);
const settings=Msg.config({encoder_bitrate:8});assert.equal(new DataView(settings).getUint8(12),17);assert.equal(new DataView(settings).getInt32(4),11);
const status=new Uint8Array([255,255,255,248,0,0,0,0,0,0,0,0,10]);assert.equal(Msg.unpack(status.buffer).data0,-8);assert.equal(Msg.unpack(status.buffer).type,10);
const cursor=new ArrayBuffer(34);new DataView(cursor).setUint8(12,9);new DataView(cursor).setUint16(32,768);assert.equal(Msg.unpack(cursor).hidden,true);assert.equal(Msg.unpack(cursor).relative,true);
assert.throws(()=>Msg.unpack(new ArrayBuffer(12)));new DataView(cursor).setInt32(16,1);assert.throws(()=>Msg.unpack(cursor));
console.log('Modern wire fixtures: opcode offset, argument order, NUL-terminated init JSON, settings, refresh, cursor bounds and host status passed.');

for(const [x,y] of [[0,0],[1280,720],[2048,1536]]){
 const packet=Msg.config({server_resolution_x:x,server_resolution_y:y,encoder_bitrate:8}),view=new DataView(packet);
 assert.equal(view.getUint8(12),17);assert.equal(view.getInt32(4),11);assert.equal(view.getInt32(0),packet.byteLength-13);assert.equal(new Uint8Array(packet).at(-1),0);
 const value=JSON.parse(new TextDecoder().decode(new Uint8Array(packet,13,packet.byteLength-14)));assert.equal(value.video[0].resolutionX,x);assert.equal(value.video[0].resolutionY,y);
}
console.log('Host video settings include resolutionX/Y for Host, fixed and client sizes, with correct sub-ID and NUL framing.');
const get=Msg.getVideoConfig(),gv=new DataView(get);assert.equal(gv.getUint8(12),17);assert.equal(gv.getInt32(4),9);assert.equal(gv.getInt32(0),1);assert.equal(get.byteLength,14);assert.equal(new Uint8Array(get)[13],0);
const base={virtualMicrophone:1,unknownHostSetting:{keep:true},video:[{output:'existing-monitor',hostOS:1,resolutionX:1920,resolutionY:1080,unknownVideoFlag:7},{output:'second-monitor',resolutionX:2560,resolutionY:1440}]};
const original=JSON.stringify(base);const mergedPacket=Msg.config({server_resolution_x:1280,server_resolution_y:720,encoder_bitrate:10},base);const merged=JSON.parse(new TextDecoder().decode(new Uint8Array(mergedPacket,13,mergedPacket.byteLength-14)));
assert.equal(merged.video[0].resolutionX,1280);assert.equal(merged.video[0].resolutionY,720);assert.equal(merged.video[0].output,'existing-monitor');assert.equal(merged.video[0].unknownVideoFlag,7);assert.deepEqual(merged.video[1],base.video[1]);assert.deepEqual(merged.unknownHostSetting,{keep:true});assert.equal(merged.virtualMicrophone,1);assert.equal(JSON.stringify(base),original);
console.log('GET settings framing and immutable host-config merge preserve output, other monitors and unknown fields.');
