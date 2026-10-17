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
let decodedSize={displayWidth:64,displayHeight:64};
globalThis.VideoDecoder=class{constructor(callbacks){this.callbacks=callbacks;this.state='unconfigured';this.decodeQueueSize=0;}configure(){this.state='configured';}decode(){this.callbacks.output({...decodedSize,close(){}});}close(){this.state='closed';}};
globalThis.EncodedVideoChunk=class{constructor(value){Object.assign(this,value);}};
const video={...target(),width:1280,height:720,getContext:()=>({drawImage(){},clearRect(){}})};
const events=[];const client=new Client(video,event=>events.push(event));
await client.connect('synthetic-private-token','synthetic-peer',{encoder_bitrate:8,server_resolution_x:1280,server_resolution_y:720});
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
assert.equal(settingsPackets().length,0);client.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,0);
client.rtc.channels[1].onmessage({data:sample.buffer});assert.ok(events.some(e=>e.type==='frame'));assert.equal(settingsPackets().length,0);
assert.equal(client.updateQuality({server_resolution_x:1920,server_resolution_y:1080,encoder_bitrate:12,video_codec:'hevc'}),false);assert.equal(settingsPackets().length,0);
assert.equal(client.selectDisplay('monitor-2'),true);assert.equal(settingsPackets().length,1);
const requested=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets()[0],13)).replace(/\0$/,''));assert.equal(requested.video[0].output,'monitor-2');assert.equal(requested.video[0].resolutionX,1280);assert.equal(requested.video[0].resolutionY,720);assert.equal(requested.video[0].encoderMaxBitrate,12);assert.equal(requested.virtualMicrophone,1);
client.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,1);
client.updateQuality({server_resolution_x:1920,server_resolution_y:1080,encoder_bitrate:15});assert.equal(client.config.server_resolution_x,1280);assert.equal(client.config.server_resolution_y,720);
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
const beforeLate=settingsPackets().length;h.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,beforeLate);h.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,beforeLate);h.destroy();
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

// Restore only after a decoded frame and validated metadata, in every arrival order.
const decodeSettings=buffer=>JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,13)).replace(/\0$/,''));
for(const order of ['list-config-frame','config-list-frame','frame-list-config','frame-config-list','list-frame-config','config-frame-list']){
 const restored=new Client(video,()=>{});await restored.connect('synthetic-token','peer',{output:'monitor-2',server_resolution_x:1024,server_resolution_y:768});restored.rtc.channels[0].onopen();restored.rtc.channels[1].onopen();const before=settingsPackets().length;
 const sequence=order.split('-');
 for(let i=0;i<sequence.length;i++){
  const part=sequence[i];
  if(part==='frame')restored.rtc.channels[1].onmessage({data:sample.buffer});
  else restored.rtc.channels[0].onmessage({data:(part==='list'?initialList:hostSettingsPacket).buffer});
  assert.equal(settingsPackets().length,before+(i===2?1:0),order+': no settings until frame and both metadata replies');
 }
 const restoredSettings=decodeSettings(settingsPackets().at(-1));assert.equal(restoredSettings.video[0].output,'monitor-2');assert.equal(restoredSettings.video[0].resolutionX,1024);assert.equal(restoredSettings.video[0].resolutionY,768);
 restored.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});restored.rtc.channels[0].onmessage({data:initialList.buffer});restored.rtc.channels[1].onmessage({data:sample.buffer});assert.equal(settingsPackets().length,before+1);assert.equal(restored.startupDisplayChoice,null);restored.destroy();
}
// Teardown before the first frame cannot replay a saved selection.
const stopped=new Client(video,()=>{});await stopped.connect('synthetic-token','peer',{output:'monitor-2',server_resolution_x:1024,server_resolution_y:768});stopped.rtc.channels[0].onopen();stopped.rtc.channels[1].onopen();stopped.rtc.channels[0].onmessage({data:initialList.buffer});stopped.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});const beforeStop=settingsPackets().length,lateVideo=stopped.rtc.channels[1].onmessage;stopped.destroy();lateVideo({data:sample.buffer});assert.equal(settingsPackets().length,beforeStop);
for(const output of [undefined,'removed-monitor']){
 const noRestore=new Client(video,()=>{});await noRestore.connect('synthetic-token','peer',{...(output?{output}:{}),server_resolution_x:1024,server_resolution_y:768});noRestore.rtc.channels[0].onopen();noRestore.rtc.channels[1].onopen();const before=settingsPackets().length;noRestore.rtc.channels[0].onmessage({data:initialList.buffer});noRestore.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});noRestore.rtc.channels[1].onmessage({data:sample.buffer});assert.equal(settingsPackets().length,before);assert.equal(noRestore.explicitOutputForConnection,false);noRestore.destroy();
}
const overridden=new Client(video,()=>{});await overridden.connect('synthetic-token','peer',{output:'monitor-1',server_resolution_x:1280,server_resolution_y:720});overridden.rtc.channels[0].onopen();overridden.rtc.channels[1].onopen();overridden.rtc.channels[0].onmessage({data:initialList.buffer});const beforeOverride=settingsPackets().length;assert.equal(overridden.selectDisplay('monitor-2'),true);assert.equal(settingsPackets().length,beforeOverride);overridden.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,beforeOverride+1);assert.equal(decodeSettings(settingsPackets().at(-1)).video[0].output,'monitor-2');overridden.destroy();
console.log('Saved output restores once after the first decoded frame in all six arrival orders; stale/missing IDs never resize; pending manual choice overrides saved selection.');

const readback=new Client(video,()=>{});await readback.connect('synthetic-token','peer',{server_resolution_x:1024,server_resolution_y:768});readback.rtc.channels[0].onopen();readback.rtc.channels[1].onopen();readback.hostVideoConfig={video:[{output:'monitor-1',resolutionX:1024,resolutionY:768}]};readback.displays=[{id:'monitor-2'}];
const readTimers=[];try{globalThis.setTimeout=(fn,ms)=>{const t={fn,ms,cancelled:false,unref(){}};readTimers.push(t);return t;};globalThis.clearTimeout=t=>{if(t&&typeof t==='object'&&'cancelled' in t)t.cancelled=true;else realClearTimeout(t);};
 assert.equal(readback.selectDisplay('monitor-2'),true);const firstRead=readTimers.at(-1);assert.equal(firstRead.ms,300);assert.equal(readback.selectDisplay('monitor-2'),true);assert.equal(firstRead.cancelled,true);
 const afterSets=settingsPackets().length;readTimers.at(-1).fn();assert.equal(new DataView(sent.at(-1)).getInt32(4),9);assert.equal(settingsPackets().length,afterSets);
 readback.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,afterSets);assert.equal(readback.hostVideoConfig.video[0].output,'monitor-1');
 readback.requestDisplayReadback();const pendingRead=readTimers.at(-1);readback.destroy();assert.equal(pendingRead.cancelled,true);const afterStop=sent.length;pendingRead.fn();assert.equal(sent.length,afterStop);
}finally{globalThis.setTimeout=realSetTimeout;globalThis.clearTimeout=realClearTimeout;readback.destroy();}
console.log('Manual selection readback is debounced, refreshes metadata without SET loops and cannot send after teardown.');

const waitingEvents=[],waiting=new Client(video,e=>waitingEvents.push(e));await waiting.connect('synthetic-token','peer',{server_resolution_x:1024,server_resolution_y:768});waiting.rtc.channels[0].onopen();waiting.rtc.channels[1].onopen();waiting.rtc.channels[0].onmessage({data:initialList.buffer});
const retryJobs=[];try{
 globalThis.setTimeout=(fn,ms)=>{const timer={fn,ms,cancelled:false,unref(){}};retryJobs.push(timer);return timer;};globalThis.clearTimeout=t=>{if(t&&typeof t==='object'&&'cancelled' in t)t.cancelled=true;else realClearTimeout(t);};
 const before=settingsPackets().length;waiting.rtc.channels[1].onmessage({data:sample.buffer});assert.ok(waitingEvents.some(e=>e.stage==='host-video-config-retry-0'));assert.equal(settingsPackets().length,before);
 assert.equal(waiting.selectDisplay('monitor-1'),true);const older=retryJobs.at(-1);assert.equal(waiting.selectDisplay('monitor-2'),true);assert.equal(older.cancelled,true);assert.equal(waiting.pendingDisplayChoice,'monitor-2');assert.equal(settingsPackets().length,before);
 const retryTimer=retryJobs.at(-1);waiting.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(retryTimer.cancelled,true);assert.equal(waiting.pendingDisplayChoice,null);assert.equal(settingsPackets().length,before+1);const queuedSettings=JSON.parse(new TextDecoder().decode(new Uint8Array(settingsPackets().at(-1),13)).replace(/\0$/,''));assert.equal(queuedSettings.video[0].output,'monitor-2');waiting.rtc.channels[0].onmessage({data:hostSettingsPacket.buffer});assert.equal(settingsPackets().length,before+1);waiting.destroy();
}finally{globalThis.setTimeout=realSetTimeout;globalThis.clearTimeout=realClearTimeout;waiting.destroy();}
const unavailableEvents=[],unavailable=new Client(video,e=>unavailableEvents.push(e));await unavailable.connect('synthetic-token','peer',{});unavailable.rtc.channels[0].onopen();unavailable.rtc.channels[1].onopen();const boundedJobs=[];try{
 globalThis.setTimeout=(fn,ms)=>{const timer={fn,ms,cancelled:false,unref(){}};boundedJobs.push(timer);return timer;};globalThis.clearTimeout=t=>{if(t&&typeof t==='object'&&'cancelled' in t)t.cancelled=true;else realClearTimeout(t);};
 const before=sent.length;unavailable.loadHostConfig();boundedJobs[0].fn();boundedJobs[1].fn();boundedJobs[2].fn();assert.equal(sent.length,before+3);assert.ok(unavailableEvents.some(e=>e.type==='host-config-unavailable'));
 unavailable.loadHostConfig();const late=boundedJobs.at(-1);unavailable.destroy();assert.equal(late.cancelled,true);const after=sent.length;late.fn();assert.equal(sent.length,after);
}finally{globalThis.setTimeout=realSetTimeout;globalThis.clearTimeout=realClearTimeout;unavailable.destroy();}
console.log('Missing config is requested after first frame; latest queued choice sends once on a real reply; retries are bounded and teardown-safe.');

// Owner 1.3.14 report: saved settings already 1024x768 for the selected output,
// but actual decoded frames remain 1920x1080. Do not switch to another output.
const settingsReply=video=>{const body=new TextEncoder().encode(JSON.stringify({video,virtualMicrophone:1})+'\0'),packet=new Uint8Array(13+body.length),view=new DataView(packet.buffer);view.setUint8(12,17);view.setInt32(0,body.length);view.setInt32(4,11);packet.set(body,13);return packet.buffer;};
const sameOutputSettings=settingsReply([{output:'monitor-1',resolutionX:1024,resolutionY:768},{output:'monitor-2',resolutionX:2560,resolutionY:1440}]);
const resetReply=settingsReply([{output:'monitor-1',resolutionX:1920,resolutionY:1080},{output:'monitor-2',resolutionX:2560,resolutionY:1440}]);
decodedSize={displayWidth:1920,displayHeight:1080};
for(const outcome of ['ack','timeout','manual','destroy']){
 const transition=new Client(video,()=>{});await transition.connect('synthetic-token','peer',{output:'monitor-1',server_resolution_x:1024,server_resolution_y:768});transition.rtc.channels[0].onopen();transition.rtc.channels[1].onopen();
 transition.rtc.channels[0].onmessage({data:initialList.buffer});transition.rtc.channels[0].onmessage({data:sameOutputSettings});
 const jobs=[];
 try{
  globalThis.setTimeout=(fn,ms)=>{const t={fn,ms,cancelled:false,unref(){}};jobs.push(t);return t;};globalThis.clearTimeout=t=>{if(t&&typeof t==='object'&&'cancelled' in t)t.cancelled=true;else realClearTimeout(t);};
  const before=settingsPackets().length;
  transition.rtc.channels[1].onmessage({data:sample.buffer});
  assert.equal(settingsPackets().length,before+1);
  const reset=decodeSettings(settingsPackets().at(-1));assert.equal(reset.video[0].output,'monitor-1');assert.equal(reset.video[0].resolutionX,1920);assert.equal(reset.video[0].resolutionY,1080);assert.equal(reset.video[1].resolutionX,2560);assert.equal(transition.config.server_resolution_x,1024);
  assert.equal(transition.updateQuality({encoder_bitrate:14}),false);assert.equal(settingsPackets().length,before+1);
  transition.rtc.channels[0].onmessage({data:sameOutputSettings});assert.equal(settingsPackets().length,before+1,'stale metadata cannot advance the transition');
  const timeout=jobs.find(j=>j.ms===3000);assert.ok(timeout);
  if(outcome==='ack'){
   transition.rtc.channels[0].onmessage({data:resetReply});assert.equal(settingsPackets().length,before+2);const desired=decodeSettings(settingsPackets().at(-1));assert.equal(desired.video[0].output,'monitor-1');assert.equal(desired.video[0].resolutionX,1024);assert.equal(desired.video[0].resolutionY,768);assert.equal(desired.video[0].encoderMaxBitrate,14);assert.equal(timeout.cancelled,true);
   transition.rtc.channels[0].onmessage({data:resetReply});assert.equal(settingsPackets().length,before+2);
  }else if(outcome==='manual'){
   assert.equal(transition.selectDisplay('monitor-2'),true);assert.equal(timeout.cancelled,true);const count=settingsPackets().length;transition.rtc.channels[0].onmessage({data:resetReply});assert.equal(settingsPackets().length,count);assert.equal(transition.config.output,'monitor-2');
  }else if(outcome==='timeout'){
   timeout.fn();const count=settingsPackets().length;transition.rtc.channels[0].onmessage({data:resetReply});assert.equal(settingsPackets().length,count);
  }else{
   const late=transition.rtc.channels[0].onmessage;transition.destroy();assert.equal(timeout.cancelled,true);const count=settingsPackets().length;late({data:resetReply});timeout.fn();assert.equal(settingsPackets().length,count);
  }
  assert.equal(transition.startupResolutionTransition,null);
 }finally{globalThis.setTimeout=realSetTimeout;globalThis.clearTimeout=realClearTimeout;transition.destroy();}
}
console.log('Persisted resolution mismatch uses the same output, waits for matching reset readback, preserves target/preferences/other slots and cancels on timeout, manual override or teardown.');
