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
await client.connect('synthetic-private-token','synthetic-peer',{encoder_bitrate:8});
client.rtc.channels[0].onopen();client.rtc.channels[1].onopen();
assert.equal(new DataView(sent[0]).getUint8(12),24);
assert.ok(sent.slice(1).some(buffer=>{const v=new DataView(buffer);return v.getUint8(12)===5&&v.getInt32(0)===5&&v.getInt32(4)===32767;}));
client.rtc.channels[1].onmessage({data:sample.buffer});assert.ok(events.some(e=>e.type==='frame'));
const body=new TextEncoder().encode(JSON.stringify([{id:'monitor-1',name:'Synthetic monitor'}])+'\0');const packet=new Uint8Array(13+body.length);const view=new DataView(packet.buffer);view.setUint8(12,17);view.setInt32(0,body.length);view.setInt32(4,12);packet.set(body,13);
client.rtc.channels[0].onmessage({data:packet.buffer});assert.ok(events.some(e=>e.type==='displays'));
assert.equal(client.selectDisplay('not-reported'),false);assert.equal(client.selectDisplay('monitor-1'),true);
const last=sent.at(-1);const config=JSON.parse(new TextDecoder().decode(new Uint8Array(last,13,last.byteLength-14)));assert.equal(config.video[0].output,'monitor-1');
const encode=new ArrayBuffer(13);const e=new DataView(encode);e.setUint8(12,21);e.setInt32(0,1);e.setInt32(4,4200);client.rtc.channels[0].onmessage({data:encode});assert.equal(client.hostEncodeMs,4.2);assert.equal(await client.transportStats(),12.5);
client.destroy(0);assert.equal(client.closed,true);assert.equal(client.input.gamepad,null);
assert.equal(JSON.stringify(events.filter(e=>e.type==='diagnostic')).includes('synthetic-private-token'),false);
console.log('Client integration: reset before held RT, first frame, validated monitor request, encode/RTT metrics and teardown passed.');
