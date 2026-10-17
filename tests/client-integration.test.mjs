import assert from 'node:assert/strict';
import {asset} from './helpers.mjs';
const {Client}=await import(asset('stream/client.js'));
const {sample}=await import(asset('features/video-sample.js'));
const target=()=>({style:{},addEventListener(){},removeEventListener(){},setAttribute(){},focus(){}});
globalThis.document={...target(),hidden:false,activeElement:null};globalThis.window=target();
const pad={mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},(_,i)=>({value:i===7?1:0,pressed:i===7}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[pad],configurable:true});
let sent=[];
globalThis.RTCPeerConnection=class{
 createDataChannel(name){return {readyState:'open',send:buffer=>sent.push(buffer),close(){}};}
 async createOffer(){return {type:'offer',sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=mid:0\r\na=ice-ufrag:u\r\na=ice-pwd:p\r\na=fingerprint:sha-256 AA\r\n'};}
 async getStats(){return new Map([['p',{type:'candidate-pair',state:'succeeded',nominated:true,currentRoundTripTime:.0125,localAddress:'192.0.2.1'}]]);}
 close(){}
};
globalThis.WebSocket=class{static OPEN=1;constructor(){this.readyState=1;}send(){}close(){}};
globalThis.VideoDecoder=class{constructor(callbacks){this.callbacks=callbacks;this.state='unconfigured';this.decodeQueueSize=0;}configure(){this.state='configured';}decode(){this.callbacks.output({displayWidth:64,displayHeight:64,close(){}});}close(){this.state='closed';}};
globalThis.EncodedVideoChunk=class{constructor(value){Object.assign(this,value);}};
const video={...target(),width:1280,height:720,getContext:()=>({drawImage(){},clearRect(){}})};
const events=[];const client=new Client(video,event=>events.push(event));
await client.connect('synthetic-private-token','synthetic-peer',{encoder_bitrate:8,server_resolution_x:1280,server_resolution_y:720,output:'monitor-1'});
client.rtc.channels[0].onopen();client.rtc.channels[1].onopen();
assert.equal(new DataView(sent[0]).getUint8(12),24);
assert.ok(sent.slice(1).some(buffer=>{const v=new DataView(buffer);return v.getUint8(12)===5&&v.getInt32(0)===5&&v.getInt32(4)===32767;}));
const hostSettingsBody=new TextEncoder().encode(JSON.stringify({virtualMicrophone:1,video:[{resolutionX:1920,resolutionY:1080,output:'monitor-1'},{output:'monitor-2',resolutionX:2560,resolutionY:1440}]})+'\0');
const hostSettingsPacket=new Uint8Array(13+hostSettingsBody.length),hostSettingsView=new DataView(hostSettingsPacket.buffer);
hostSettingsView.setUint8(12,17);hostSettingsView.setInt32(0,hostSettingsBody.length);hostSettingsView.setInt32(4,11);hostSettingsPacket.set(hostSettingsBody,13);
const settingsPackets=()=>sent.filter(buffer=>{const v=new DataView(buffer);return v.getUint8(12)===17&&v.getInt32(4)===11;});
assert.ok(sent.some(buffer=>{const v=new DataView(buffer);return v.getUint8(12)===17&&v.getInt32(4)===9;}));
assert.ok(sent.some(buffer=>{const v=new DataView(buffer);return v.getUint8(12)===17&&v.getInt32(4)===10;}));
const initialListBody=new TextEncoder().encode(JSON.stringify([{id:'monitor-1',name:'One'},{id:'monitor-2',name:'Two'}])+'\0'),initialList=new Uint8Array(13+initialListBody.length),initialListView=new DataView(initialList.buffer);initialListView.setUint8(12,17);initialListView.setInt32(0,initialListBody.length);initialListView.setInt32(4,12);initialList.set(initialListBody,13);client.rtc.channels[0].onmessage({data:initialList.buffer});
assert.equal(settingsPackets().length,0);client.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,1);
const selectionBody=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets()[0],13)).replace(/\0$/,''));assert.equal(selectionBody.video[0].output,'monitor-1');for(const item of selectionBody.video){assert.equal('resolutionX' in item,false);assert.equal('resolutionY' in item,false);}assert.equal(client.confirmedOutput,null);
client.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,2);
const requested=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets()[1],13)).replace(/\0$/,''));assert.equal(requested.video[0].resolutionX,1280);assert.equal(requested.video[0].resolutionY,720);assert.equal(requested.video[0].output,'monitor-1');assert.equal(requested.video.length,2);assert.equal(requested.virtualMicrophone,1);assert.equal(client.confirmedOutput,'monitor-1');
client.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,2);
client.rtc.channels[1].onmessage({data:sample.buffer});assert.ok(events.some(e=>e.type==='frame'));assert.equal(settingsPackets().length,2);
client.updateQuality({server_resolution_x:1920,server_resolution_y:1080,encoder_bitrate:12,video_codec:'hevc'});assert.equal(client.config.server_resolution_x,1280);assert.equal(client.config.server_resolution_y,720);assert.equal(client.config.encoder_bitrate,12);
const liveRequest=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets().at(-1),13)).replace(/\0$/,''));assert.equal(liveRequest.video[0].resolutionX,1280);assert.equal(liveRequest.video[0].encoderMaxBitrate,12);

const body=new TextEncoder().encode(JSON.stringify([{id:'monitor-1',name:'Synthetic monitor'}])+'\0');const packet=new Uint8Array(13+body.length);const view=new DataView(packet.buffer);view.setUint8(12,17);view.setInt32(0,body.length);view.setInt32(4,12);packet.set(body,13);
client.rtc.channels[0].onmessage({data:packet.buffer});assert.ok(events.some(e=>e.type==='displays'));
assert.equal(client.selectDisplay('not-reported'),false);assert.equal(client.selectDisplay('monitor-1'),true);
const last=settingsPackets().at(-1);const config=JSON.parse(new TextDecoder().decode(new Uint8Array(last,13,last.byteLength-14)));assert.equal(config.video[0].output,'monitor-1');
const encode=new ArrayBuffer(13);const e=new DataView(encode);e.setUint8(12,21);e.setInt32(0,1);e.setInt32(4,4200);client.rtc.channels[0].onmessage({data:encode});assert.equal(client.hostEncodeMs,4.2);assert.equal(await client.transportStats(),12.5);
client.destroy(0);assert.equal(client.closed,true);assert.equal(client.input.gamepad,null);
assert.equal(JSON.stringify(events.filter(e=>e.type==='diagnostic')).includes('synthetic-private-token'),false);
console.log('Client integration: reset before held RT, first frame, validated monitor request, encode/RTT metrics and teardown passed.');

VideoDecoder.isConfigSupported=async()=>({supported:true});
const hevcEvents=[];const h=new Client(video,e=>hevcEvents.push(e));
await h.connect('synthetic-private-token','synthetic-peer',{video_codec:'hevc'});
h.rtc.channels[0].onopen();h.rtc.channels[1].onopen();
assert.equal(h.config.video_codec,'hevc');
h.videoPlayer.onFatal();assert.equal(h.fellBack,true);assert.equal(h.fallbackH264(),false);
assert.equal(new DataView(sent.at(-1)).getUint8(12),13);assert.equal(new DataView(sent.at(-1)).getInt32(4),8);
assert.equal(h.config.video_codec,'h264');assert.equal(h.stream.config.video_codec,'h264');
h.rtc.channels[1].onmessage({data:sample.buffer});assert.match(h.videoPlayer.snapshot().codec,/avc1/);
assert.ok(hevcEvents.some(e=>e.type==='codec'&&e.state==='fallback'));
assert.equal(h.configured,false);
const beforeLate=settingsPackets().length;h.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,beforeLate+1);h.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,beforeLate+1);
assert.ok(hevcEvents.some(e=>e.stage==='host-video-config-merged-sent'));h.destroy();
VideoDecoder.isConfigSupported=async()=>({supported:false});
const unsupported=[];const u=new Client(video,e=>unsupported.push(e));await u.connect('synthetic-private-token','synthetic-peer',{video_codec:'hevc'});
assert.equal(u.config.video_codec,'h264');assert.ok(unsupported.some(e=>e.type==='codec'&&e.state==='unavailable'));u.destroy();
console.log('HEVC request, one-shot H.264 fallback, real H.264 frame confirmation, teardown and unsupported-browser guard passed.');

VideoDecoder.isConfigSupported=async()=>({supported:true});
const timeoutClient=new Client(video,()=>{});await timeoutClient.connect('synthetic-private-token','synthetic-peer',{video_codec:'hevc'});
const realSetTimeout=globalThis.setTimeout,realClearTimeout=globalThis.clearTimeout,timers=[];
try{
 globalThis.setTimeout=(fn,ms)=>{const timer={fn,ms,cancelled:false};timers.push(timer);return timer;};
 globalThis.clearTimeout=timer=>{if(timer&&typeof timer==='object'&&'cancelled' in timer)timer.cancelled=true;else realClearTimeout(timer);};
 timeoutClient.rtc.channels[0].onopen();timeoutClient.rtc.channels[1].onopen();
 const initial=timers.find(t=>t.ms===8000);assert.ok(initial);initial.fn();
 assert.equal(timeoutClient.fellBack,true);const fallback=timers.filter(t=>t.ms===8000).at(-1);assert.notEqual(fallback,initial);
 fallback.fn();assert.equal(timeoutClient.closed,true);
}finally{globalThis.setTimeout=realSetTimeout;globalThis.clearTimeout=realClearTimeout;timeoutClient.destroy();}
console.log('Missing HEVC video triggers H.264 after eight seconds; failed fallback disconnects after eight more seconds.');

const targeted=new Client(video,()=>{});await targeted.connect('synthetic-token','peer',{server_resolution_x:2048,server_resolution_y:1536,output:'monitor-2'});targeted.rtc.channels[0].onopen();targeted.rtc.channels[1].onopen();
const beforeTarget=settingsPackets().length;targeted.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,beforeTarget);assert.equal(targeted.configured,false);
const listBody=new TextEncoder().encode(JSON.stringify([{id:'monitor-1',name:'One'},{id:'monitor-2',name:'Two'}])+'\0'),listPacket=new Uint8Array(13+listBody.length),listView=new DataView(listPacket.buffer);listView.setUint8(12,17);listView.setInt32(0,listBody.length);listView.setInt32(4,12);listPacket.set(listBody,13);
targeted.rtc.channels[0].onmessage({data:listPacket.buffer});assert.equal(settingsPackets().length,beforeTarget+1);let targetBody=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets().at(-1),13)).replace(/\0$/,''));assert.equal(targetBody.video[0].output,'monitor-2');for(const item of targetBody.video)assert.equal('resolutionX' in item,false);assert.equal(targeted.configured,false);
// An old/mismatching host reply cannot permit a resolution SET.
targeted.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,beforeTarget+1);assert.equal(targeted.confirmedOutput,null);
const ackBody=new TextEncoder().encode(JSON.stringify({video:[{output:'monitor-2',resolutionX:1024,resolutionY:768},{output:'none',resolutionX:0,resolutionY:0}]})+'\0'),ack=new Uint8Array(13+ackBody.length),av=new DataView(ack.buffer);av.setUint8(12,17);av.setInt32(0,ackBody.length);av.setInt32(4,11);ack.set(ackBody,13);
targeted.rtc.channels[0].onmessage({data:ack.buffer});assert.equal(settingsPackets().length,beforeTarget+2);targetBody=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets().at(-1),13)).replace(/\0$/,''));assert.equal(targetBody.video[0].output,'monitor-2');assert.equal(targetBody.video[0].resolutionX,2048);assert.equal(targetBody.video[0].resolutionY,1536);assert.equal(targeted.configured,true);assert.equal(targeted.confirmedOutput,'monitor-2');const lateReply=targeted.rtc.channels[0].onmessage;targeted.destroy();assert.equal(targeted.outputTimer,null);const afterDestroy=settingsPackets().length;lateReply({data:ack.buffer});assert.equal(settingsPackets().length,afterDestroy);
const unmapped=new Client(video,()=>{});await unmapped.connect('synthetic-token','peer',{server_resolution_x:2048,server_resolution_y:1536});unmapped.rtc.channels[0].onopen();unmapped.rtc.channels[1].onopen();unmapped.hostVideoConfig={video:[{output:'none',resolutionX:1024,resolutionY:768}]};unmapped.sendInitialSettings(true);targetBody=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets().at(-1),13)).replace(/\0$/,''));assert.equal('resolutionX' in targetBody.video[0],false);assert.equal('resolutionY' in targetBody.video[0],false);unmapped.destroy();
console.log('Saved monitor is explicitly selected without resolution, mismatching replies block resize, matching acknowledgement permits resize, teardown cancels pending work, automatic mode withholds resolution.');

const pendingEvents=[],pendingClient=new Client(video,e=>pendingEvents.push(e));await pendingClient.connect('synthetic-token','peer',{output:'monitor-2',server_resolution_x:1280,server_resolution_y:720});pendingClient.rtc.channels[0].onopen();pendingClient.rtc.channels[1].onopen();pendingClient.hostVideoConfig={video:[{output:'monitor-1',resolutionX:1024,resolutionY:768}]};pendingClient.displays=[{id:'monitor-2'}];
let selectionDeadline;try{globalThis.setTimeout=(fn,ms)=>{if(ms===2500)selectionDeadline=fn;return {unref(){}};};const count=settingsPackets().length;assert.equal(pendingClient.beginOutputSelection(),true);assert.equal(settingsPackets().length,count+1);selectionDeadline();assert.equal(settingsPackets().length,count+1);assert.ok(pendingEvents.some(e=>e.stage==='display-selection-unconfirmed'));assert.equal(pendingClient.confirmedOutput,null);}finally{globalThis.setTimeout=realSetTimeout;pendingClient.destroy();}
const eventCount=pendingEvents.length;selectionDeadline();assert.equal(pendingEvents.length,eventCount);
console.log('Missing output acknowledgement cannot resize; expired/teardown selection callbacks cannot send late changes.');
