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
await client.connect('synthetic-private-token','synthetic-peer',{encoder_bitrate:8,server_resolution_x:1280,server_resolution_y:720});
client.rtc.channels[0].onopen();client.rtc.channels[1].onopen();
assert.equal(new DataView(sent[0]).getUint8(12),24);
assert.ok(sent.slice(1).some(buffer=>{const v=new DataView(buffer);return v.getUint8(12)===5&&v.getInt32(0)===5&&v.getInt32(4)===32767;}));
const hostSettingsBody=new TextEncoder().encode(JSON.stringify({virtualMicrophone:1,video:[{resolutionX:1920,resolutionY:1080,output:'existing-monitor'},{output:'secondary'}]})+'\0');
const hostSettingsPacket=new Uint8Array(13+hostSettingsBody.length),hostSettingsView=new DataView(hostSettingsPacket.buffer);
hostSettingsView.setUint8(12,17);hostSettingsView.setInt32(0,hostSettingsBody.length);hostSettingsView.setInt32(4,11);hostSettingsPacket.set(hostSettingsBody,13);
const settingsPackets=()=>sent.filter(buffer=>{const v=new DataView(buffer);return v.getUint8(12)===17&&v.getInt32(4)===11;});
assert.ok(sent.some(buffer=>{const v=new DataView(buffer);return v.getUint8(12)===17&&v.getInt32(4)===9;}));
assert.equal(settingsPackets().length,0);client.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,1);
const requested=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets()[0],13)).replace(/\0$/,''));assert.equal(requested.video[0].resolutionX,1280);assert.equal(requested.video[0].resolutionY,720);assert.equal(requested.video[0].output,'existing-monitor');assert.equal(requested.video.length,2);assert.equal(requested.virtualMicrophone,1);
client.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,1);
client.rtc.channels[1].onmessage({data:sample.buffer});assert.ok(events.some(e=>e.type==='frame'));assert.equal(settingsPackets().length,1);
client.updateQuality({server_resolution_x:1920,server_resolution_y:1080,encoder_bitrate:12,video_codec:'hevc'});assert.equal(client.config.server_resolution_x,1280);assert.equal(client.config.server_resolution_y,720);assert.equal(client.config.encoder_bitrate,12);
const liveRequest=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets().at(-1),13)).replace(/\0$/,''));assert.equal(liveRequest.video[0].resolutionX,1280);assert.equal(liveRequest.video[0].encoderMaxBitrate,12);

const body=new TextEncoder().encode(JSON.stringify([{id:'monitor-1',name:'Synthetic monitor'}])+'\0');const packet=new Uint8Array(13+body.length);const view=new DataView(packet.buffer);view.setUint8(12,17);view.setInt32(0,body.length);view.setInt32(4,12);packet.set(body,13);
client.rtc.channels[0].onmessage({data:packet.buffer});assert.ok(events.some(e=>e.type==='displays'));
assert.equal(client.selectDisplay('not-reported'),false);assert.equal(client.selectDisplay('monitor-1'),true);
const last=sent.at(-1);const config=JSON.parse(new TextDecoder().decode(new Uint8Array(last,13,last.byteLength-14)));assert.equal(config.video[0].output,'monitor-1');
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
