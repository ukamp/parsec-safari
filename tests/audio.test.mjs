import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {AudioPlayer,opusFrames} = await import(asset('stream/audio.js'));
const {audioSamples} = await import(asset('features/audio-sample.js'));
class Context {
 constructor(){this.state='suspended';this.currentTime=0;this.destination={};this.starts=[];this.stops=0;}
 createBuffer(channels,frames,rate){const planes=Array.from({length:channels},()=>new Float32Array(frames));return {duration:frames/rate,getChannelData:ch=>planes[ch]};}
 createBufferSource(){const ctx=this;return {connect(){},disconnect(){},start(t){ctx.starts.push({time:t,buffer:this.buffer});},stop(){ctx.stops++;}};}
 resume(){this.state='running';this.onstatechange?.();return Promise.resolve();}close(){this.state='closed';return Promise.resolve();}
}
class Decoder {
 static async isConfigSupported(){return {supported:true};}
 constructor(c){this.callbacks=c;this.state='unconfigured';this.decodeQueueSize=0;}
 configure(c){this.config=c;this.state='configured';}
 decode(){this.callbacks.output({numberOfChannels:2,numberOfFrames:240,sampleRate:48000,copyTo(dest){dest.fill(.25);},close(){}});}
 close(){this.state='closed';}
}
globalThis.window={location:{href:'https://test.invalid/'}};globalThis.document={currentScript:null};globalThis.EncodedAudioChunk=class{constructor(c){Object.assign(this,c);}};
assert.equal(opusFrames(new Uint8Array([0])),480);assert.equal(opusFrames(new Uint8Array([8])),960);assert.equal(opusFrames(new Uint8Array([24])),2880);assert.equal(opusFrames(new Uint8Array([128])),120);assert.equal(opusFrames(new Uint8Array([131,0])),0);
const events=[];const p=new AudioPlayer(stage=>events.push(stage),{Context,Decoder});await p.readyPromise;
p.queueData(new Uint8Array(audioSamples[0]).buffer);assert.equal(p.droppedPackets,1);
Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true});assert.equal(await p.unlock(),true);assert.equal(navigator.audioSession.type,'playback');p.queueData(new Uint8Array(audioSamples[0]).buffer);
assert.equal(p.decodedPackets,1);assert.equal(p.scheduledFrames,240);assert.equal(p.nonSilentBuffers,1);assert.equal(p.ctx.starts.at(-1).buffer.duration,.005);
p.decoder.decodeQueueSize=11;p.queueData(new Uint8Array(audioSamples[0]).buffer);assert.equal(p.droppedPackets,2);p.decoder.decodeQueueSize=0;
p.ctx.state='interrupted';Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true});assert.equal(await p.unlock(),true);assert.equal(navigator.audioSession.type,'playback');
p.nextTime=1;p.queueData(new Uint8Array(audioSamples[0]).buffer);assert.equal(p.scheduledFrames,240);assert.equal(p.droppedPackets,3);
p.nextTime=0;const snapshot=p.snapshot();assert.equal(snapshot.audioContextRunning,true);assert.equal(snapshot.audioNativeDecoder,true);assert.ok(events.includes('audio-buffer-scheduled'));
p.destroy();assert.equal(p.ctx.state,'closed');assert.ok(p.ctx.stops>0);
const bytes=await readFile(new URL(asset('stream/wasm/opus.wasm')));
const fallback=new AudioPlayer(()=>{},{Context,Decoder:null,fetcher:async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)})});
assert.equal(await fallback.readyPromise,true);assert.equal(fallback.native,false);assert.equal(await fallback.unlock(),true);
for(const packet of audioSamples)fallback.queueData(new Uint8Array(packet).buffer);
assert.ok(fallback.decodedPackets>0);assert.ok(fallback.scheduledFrames>0);assert.ok(fallback.nonSilentBuffers>0);assert.equal(fallback.decodeErrors,0);
fallback.queueData(new Uint8Array([24,0]).buffer);assert.equal(fallback.unsupportedPackets,1);fallback.destroy();
console.log('Audio: variable frame scheduling, gesture unlock, interruption, backlog limits, cleanup and actual WASM Opus decoding of a synthetic tone passed.');
