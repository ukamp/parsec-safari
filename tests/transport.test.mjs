import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const {RTC} = await import(asset('stream/rtc.js'));
const {Signal} = await import(asset('stream/signal.js'));
const offer='v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=mid:0\r\na=ice-ufrag:local\r\na=ice-pwd:local-password\r\na=fingerprint:sha-256 AA:BB\r\n';
const options=[];
globalThis.RTCPeerConnection=class{
 constructor(){this.candidates=[];}
 createDataChannel(name,config){options.push({name,...config});return {readyState:'open',send(){},close(){}};}
 async createOffer(){return {type:'offer',sdp:offer};}async setLocalDescription(d){this.localDescription=d;}async setRemoteDescription(d){this.remoteDescription=d;}async addIceCandidate(c){this.candidates.push(c);}close(){}
};
let fatal=null;const sent=[];const r=new RTC('synthetic-peer','synthetic-attempt',c=>sent.push(c),c=>fatal=c);
for(const [id,name] of [[0,'control'],[1,'video'],[2,'audio']])r.addChannel(name,id,()=>{},()=>{});
assert.deepEqual(options.map(x=>[x.id,x.negotiated,x.ordered]),[[0,true,true],[1,true,true],[2,true,true]]);
const creds=await r.createOffer();
r.setCandidate({candidate_ip:'192.0.2.1',candidate_port:5000,sync:0,from_stun:0},{ice_ufrag:'remote',ice_pwd:'remote-password',fingerprint:'sha-256 CC:DD'});await r.queue;
assert.equal(fatal,null);assert.ok(r.rtc.remoteDescription.sdp.includes('a=max-message-size:4194304'));
r.rtc.onicecandidate({candidate:null});assert.equal(sent.length,1);assert.equal(sent[0].sync,1);r.rtc.onicecandidate({candidate:null});assert.equal(sent.length,1);
assert.equal(r.send(new ArrayBuffer(13),0),true);r.channels[0].readyState='closing';assert.equal(r.send(new ArrayBuffer(13),0),false);r.close();
globalThis.WebSocket=class{static OPEN=1;constructor(url,protocol){this.url=url;this.protocol=protocol;this.readyState=1;this.sent=[];}send(m){this.sent.push(JSON.parse(m));}close(){}};
const signal=new Signal(c=>fatal=c);signal.connect('',0,'synthetic-token','synthetic-peer',creds,()=>{});signal.ws.onopen();signal.send('synthetic-token',{candidate_ip:'192.0.2.2',candidate_port:5001,from_stun:0,lan:1,sync:0});
assert.ok(!signal.ws.url.includes('synthetic-token'));assert.equal(signal.ws.sent[1].payload.data.versions.control,1);signal.close();
console.log('Negotiated ordered channels, compact SDP, completion marker, send acknowledgement and credential-free URL checks passed.');
