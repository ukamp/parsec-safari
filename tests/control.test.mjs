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

const initial=Msg.init({server_resolution_x:1024,server_resolution_y:768});const initialBody=JSON.parse(new TextDecoder().decode(new Uint8Array(initial,13,initial.byteLength-14)));assert.equal(initialBody.resolutionX,0);assert.equal(initialBody.resolutionY,0);
const getDisplays=Msg.getDisplays(),getDisplaysView=new DataView(getDisplays);assert.equal(getDisplaysView.getUint8(12),17);assert.equal(getDisplaysView.getInt32(4),10);assert.equal(getDisplaysView.getInt32(0),1);assert.equal(getDisplays.byteLength,14);
const safePacket=Msg.config({skip_resolution:true},base),safeBody=JSON.parse(new TextDecoder().decode(new Uint8Array(safePacket,13,safePacket.byteLength-14)));assert.equal('resolutionX' in safeBody.video[0],false);assert.equal('resolutionY' in safeBody.video[0],false);assert.deepEqual(safeBody.video[1],base.video[1]);
console.log('Decoder init never resizes a default output; display GET framing and withheld unknown-target resolution passed.');

const slotBase={video:[{output:'one',resolutionX:1024,resolutionY:768,keep:1},{output:'two',resolutionX:1920,resolutionY:1080},{output:'three',resolutionX:2560,resolutionY:1440}]};const beforeSlot=JSON.stringify(slotBase);
const slotPacket=Msg.config({video_index:1,output:'two',server_resolution_x:2048,server_resolution_y:1536},slotBase),slotBody=JSON.parse(new TextDecoder().decode(new Uint8Array(slotPacket,13,slotPacket.byteLength-14)));
assert.deepEqual(slotBody.video[0],slotBase.video[0]);assert.deepEqual(slotBody.video[2],slotBase.video[2]);assert.equal(slotBody.video[1].resolutionX,2048);assert.equal(slotBody.video[1].resolutionY,1536);assert.equal(slotBody.video[1].output,'two');assert.equal(JSON.stringify(slotBase),beforeSlot);assert.throws(()=>Msg.config({video_index:9},slotBase));
console.log('Selecting slot 1 leaves slots 0 and 2 unchanged; invalid slot indices rejected.');

const outputOnly=Msg.selectOutput('two',slotBase),outputBody=JSON.parse(new TextDecoder().decode(new Uint8Array(outputOnly,13,outputOnly.byteLength-14)));assert.equal(outputBody.video[0].output,'two');for(const item of outputBody.video){assert.equal('resolutionX' in item,false);assert.equal('resolutionY' in item,false);}assert.equal(JSON.stringify(slotBase),beforeSlot);
const autoPacket=Msg.config({skip_all_resolutions:true,skip_resolution:true},slotBase),autoBody=JSON.parse(new TextDecoder().decode(new Uint8Array(autoPacket,13,autoPacket.byteLength-14)));for(const item of autoBody.video){assert.equal('resolutionX' in item,false);assert.equal('resolutionY' in item,false);}assert.equal(autoBody.video[0].output,'one');
console.log('Output-only phase and automatic mode never replay resolution fields for any video record.');
