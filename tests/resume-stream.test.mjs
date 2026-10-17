import assert from 'node:assert/strict';
import {asset} from './helpers.mjs';
const target=()=>({style:{},children:[],value:'',hidden:false,textContent:'',attrs:{},addEventListener(){},removeEventListener(){},setAttribute(k,v){this.attrs[k]=v},focus(){},appendChild(c){this.children.push(c)},append(...c){this.children.push(...c)}});
const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,{...target(),id,getContext:()=>({drawImage(){},clearRect(){}})});return elements.get(id)};
globalThis.document={...target(),hidden:false,documentElement:{lang:'de'},querySelectorAll:()=>[],getElementById:$,createElement:()=>target()};
globalThis.window={...target(),location:{hash:'#computers'}};
globalThis.fetch=async url=>{if(!String(url).startsWith('https://kessel-api.parsec.app'))throw Error('fixture only');return {status:200,json:async()=>String(url).endsWith('/v1/auth')?{data:{id:'synthetic-session'}}:String(url).includes('/v2/hosts')?{data:[{peer_id:'synthetic-peer',name:'Synthetic host'}]}:{data:[]}};};
globalThis.RTCPeerConnection=window.RTCPeerConnection=class{
 constructor(){this.channels={};RTCPeerConnection.last=this;}
 createDataChannel(name,{id}){return this.channels[id]={readyState:'open',send(){},close(){}};}
 async createOffer(){return {sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=mid:0\r\na=ice-ufrag:u\r\na=ice-pwd:p\r\na=fingerprint:sha-256 AA\r\n'};}
 close(){}
};
globalThis.WebSocket=class{static OPEN=1;constructor(){this.readyState=1}send(){}close(){}};
globalThis.VideoDecoder=window.VideoDecoder=class{
 static async isConfigSupported(){return {supported:false};}
 constructor(c){this.c=c;this.state='unconfigured';this.decodeQueueSize=0}configure(){this.state='configured'}decode(){this.c.output({displayWidth:64,displayHeight:64,close(){}})}close(){this.state='closed'}
};
globalThis.EncodedVideoChunk=window.EncodedVideoChunk=class{constructor(v){Object.assign(this,v)}};
await import(asset('application.js'));assert.equal($('resumeStream').hidden,true);
$('email').value='synthetic@example.invalid';$('password').value='synthetic-password';$('tfa').value='';await $('auth').onsubmit({preventDefault(){}});
$('hosts').children[0].children[2].onclick();await new Promise(setImmediate);
let rtc=RTCPeerConnection.last;assert.ok(rtc);rtc.channels[0].onopen();rtc.channels[1].onopen();
const {sample}=await import(asset('features/video-sample.js'));rtc.channels[1].onmessage({data:sample.buffer});assert.equal($('streamEmpty').hidden,true);
$('stop').onclick();assert.equal($('resumeStream').hidden,false);assert.equal($('resumeStream').disabled,false);assert.equal($('streamEmpty').hidden,false);
$('resumeStream').onclick();await new Promise(setImmediate);assert.notEqual(RTCPeerConnection.last,rtc);assert.equal($('streamEmpty').hidden,true);
$('logout').onclick();assert.equal($('resumeStream').hidden,true);assert.equal($('authPanel').hidden,false);
console.log('Last successful host reconnects after explicit disconnect; logout clears the in-memory target (synthetic peer).');
