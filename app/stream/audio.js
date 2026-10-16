import opusModule from './wasm/opus.js';
const WASM_URL=new URL('./wasm/opus.wasm',import.meta.url).href;
// Opus packet duration in 48 kHz samples; also bounds the legacy WASM's
// 8 KiB stereo float output allocation before it is called.
export function opusFrames(packet) {
  if(!packet.length)return 0;
  const config=packet[0]>>3;
  const frame=config>=16?120*(1<<(config&3)):config>=12?480*(1<<(config&1)):[480,960,1920,2880][config&3];
  const code=packet[0]&3,count=code===0?1:code===3?(packet.length>1?packet[1]&63:0):2;
  const total=frame*count;
  return count&&total<=5760?total:0;
}
export class AudioPlayer {
  constructor(diagnostic=()=>{
  },options={
  }) {
    this.diagnostic=diagnostic;
    this.closed=false;
    this.ready=false;
    this.native=false;
    this.decoder=null;
    this.opus=null;
    this.sources=new Set();
    this.nextTime=0;
    this.timestamp=0;
    this.seen=new Set();
    this.generation=0;
    this.packets=0;
    this.decodedPackets=0;
    this.scheduledFrames=0;
    this.droppedPackets=0;
    this.decodeErrors=0;
    this.unsupportedPackets=0;
    this.nonSilentBuffers=0;
    const Context=options.Context||window.AudioContext||window.webkitAudioContext;
    try{
      this.ctx=new Context();
      this.gain=this.ctx.createGain?.();
      if(this.gain)this.gain.connect(this.ctx.destination);
      this.ctx.onstatechange=()=>{
        if(this.closed)return;
        this.state();
        if(this.ctx.state==='running')this.nextTime=0;
      };
    }catch{
      this.ctx=null;
      this.once('audio-context-unavailable');
    }
    this.readyPromise=this.initialize(options);
  }
  setVolume(value){
    if(this.gain)this.gain.gain.value=Math.max(0,Math.min(1,Number(value)||0));
  }
  once(stage){
    if(this.seen.has(stage))return;
    this.seen.add(stage);
    this.diagnostic(stage,{
    });
  }
  state(){
    const state=this.ctx?.state;
    this.once(['running','suspended','interrupted','closed'].includes(state)?'audio-context-'+state:'audio-context-unknown');
  }
  async initialize(options) {
    if(!this.ctx)return false;
    const Decoder=options.Decoder===null?null:options.Decoder||globalThis.AudioDecoder;
    if(Decoder){
      try{
        const config={
          codec:'opus',sampleRate:48000,numberOfChannels:2
        };
        const support=await Decoder.isConfigSupported(config);
        if(this.closed)return false;
        if(support.supported){
          const generation=++this.generation;
          this.decoder=new Decoder({
            output:data=>{
              try{
                if(this.closed||generation!==this.generation)return;
                if(data.numberOfChannels!==2||data.sampleRate!==48000||data.numberOfFrames>5760){
                  this.unsupportedPackets++;
                  this.once('audio-format-unsupported');
                  return;
                }
                const planes=[new Float32Array(data.numberOfFrames),new Float32Array(data.numberOfFrames)];
                for(let ch=0;
                ch<2;
                ch++)data.copyTo(planes[ch],{
                  planeIndex:ch,format:'f32-planar'
                });
                this.decodedPackets++;
                this.once('audio-opus-decoded');
                this.schedule(planes,48000);
              }catch{
                this.decodeErrors++;
                this.once('audio-copy-failed');
              }finally{
                data.close();
              }
            },error:()=>{
              if(!this.closed&&generation===this.generation){
                this.decodeErrors++;
                this.once('audio-native-decoder-failed');
                this.ready=false;
                this.readyPromise=this.fallback(options);
              }
            }
          });
          this.decoder.configure(config);
          this.native=true;
          this.ready=true;
          this.once('audio-native-opus-ready');
          return true;
        }
      }catch{
        this.once('audio-native-opus-unavailable');
      }
    }
    return this.fallback(options);
  }
  async fallback(options={
  }) {
    if(this.closed)return false;
    this.generation++;
    if(this.decoder&&this.decoder.state!=='closed')this.decoder.close();
    this.decoder=null;
    this.native=false;
    try{
      const fetcher=options.fetcher||fetch,response=await fetcher(WASM_URL,{
        cache:'force-cache'
      });
      if(!response.ok)throw Error('wasm download');
      const bytes=await response.arrayBuffer();
      if(this.closed)return false;
      return await new Promise(resolve=>{
        let module;
        module=opusModule({
          wasmBinary:bytes,locateFile:()=>WASM_URL,print(){
          },printErr(){
          },onAbort:()=>{
            this.once('audio-wasm-load-failed');
            resolve(false);
          },onRuntimeInitialized:()=>queueMicrotask(()=>{
            if(this.closed){
              resolve(false);
              return;
            }
            try{
              if(module.ccall('init','number')!==0)throw Error('init');
              this.opus=module;
              this.inputPointer=module.ccall('encode_buf','number');
              this.outputPointer=module.ccall('decode_buf','number');
              this.ready=true;
              this.once('audio-wasm-opus-ready');
              resolve(true);
            }catch{
              this.once('audio-wasm-init-failed');
              resolve(false);
            }
          })
        });
      });
    }catch{
      this.once('audio-wasm-load-failed');
      return false;
    }
  }
  async unlock() {
    if(!this.ctx||this.closed)return false;
    try{
      if(globalThis.navigator?.audioSession){
        navigator.audioSession.type='playback';
        this.once('audio-session-playback');
      }
    }catch{
      this.once('audio-session-default');
    }
    try{
      // Start a silent source and resume within the button's user gesture.
      const source=this.ctx.createBufferSource();
      source.buffer=this.ctx.createBuffer(1,1,48000);
      source.connect(this.gain||this.ctx.destination);
      source.onended=()=>source.disconnect();
      source.start(0);
      const resume=this.ctx.resume();
      let timer;
      try{
        await Promise.race([resume,new Promise(resolve=>{
          timer=setTimeout(resolve,1500);
        })]);
      }finally{
        clearTimeout(timer);
      }
    }catch{
      this.once('audio-resume-failed');
    }
    this.state();
    return this.ctx.state==='running';
  }
  queueData(buffer) {
    if(this.closed)return;
    this.packets++;
    if(!this.ready){
      this.droppedPackets++;
      this.once('audio-waiting-for-decoder');
      return;
    }
    if(!(buffer instanceof ArrayBuffer)||!buffer.byteLength||buffer.byteLength>4096){
      this.unsupportedPackets++;
      this.once('audio-packet-invalid');
      return;
    }
    if(this.ctx.state!=='running'){
      this.droppedPackets++;
      this.state();
      return;
    }
    const packet=new Uint8Array(buffer),frames=opusFrames(packet);
    if(!frames){
      this.unsupportedPackets++;
      this.once('audio-packet-invalid');
      return;
    }
    try{
      if(this.native){
        if(this.decoder.decodeQueueSize>10){
          this.droppedPackets++;
          return;
        }
        this.decoder.decode(new EncodedAudioChunk({
          type:'key',timestamp:this.timestamp,data:packet
        }));
        this.timestamp+=Math.round(frames/48000*1000000);
      }else{
        if(frames>960){
          this.unsupportedPackets++;
          this.once('audio-wasm-packet-duration-unsupported');
          return;
        }
        const m=this.opus;
        new Uint8Array(m.HEAPU8.buffer,this.inputPointer,4096).set(packet);
        const count=m.ccall('decode','number',['number'],[packet.byteLength]);
        if(count<=0||count>960){
          this.decodeErrors++;
          this.once('audio-opus-decode-failed');
          return;
        }
        const pcm=new Float32Array(m.HEAPF32.buffer,this.outputPointer,count*2),planes=[new Float32Array(count),new Float32Array(count)];
        for(let i=0;
        i<count;
        i++){
          planes[0][i]=pcm[i*2];
          planes[1][i]=pcm[i*2+1];
        }
        this.decodedPackets++;
        this.once('audio-opus-decoded');
        this.schedule(planes,48000);
      }
    }catch{
      this.decodeErrors++;
      this.once('audio-opus-decode-failed');
    }
  }
  schedule(planes,sampleRate) {
    if(this.closed||this.ctx.state!=='running'){
      this.droppedPackets++;
      return;
    }
    const now=this.ctx.currentTime;
    if(this.nextTime-now>0.200){
      this.droppedPackets++;
      return;
    }
    const frames=planes[0].length,buffer=this.ctx.createBuffer(2,frames,sampleRate);
    let audible=false;
    for(let ch=0;
    ch<2;
    ch++){
      const dest=buffer.getChannelData(ch);
      for(let i=0;
      i<frames;
      i++){
        const sample=Number.isFinite(planes[ch][i])?Math.max(-1,Math.min(1,planes[ch][i])):0;
        dest[i]=sample;
        if(Math.abs(sample)>0.0001)audible=true;
      }
    }
    if(audible)this.nonSilentBuffers++;
    const source=this.ctx.createBufferSource();
    source.buffer=buffer;
    source.connect(this.gain||this.ctx.destination);
    source.onended=()=>{
      this.sources.delete(source);
      source.disconnect();
    };
    this.sources.add(source);
    const start=Math.max(now+0.040,this.nextTime);
    source.start(start);
    this.nextTime=start+frames/sampleRate;
    this.scheduledFrames+=frames;
    this.once('audio-buffer-scheduled');
  }
  snapshot(){
    return {
      audioReceivedPackets:this.packets,audioDecodedPackets:this.decodedPackets,audioScheduledFrames:this.scheduledFrames,audioDroppedPackets:this.droppedPackets,audioDecodeErrors:this.decodeErrors,audioUnsupportedPackets:this.unsupportedPackets,audioNonSilentBuffers:this.nonSilentBuffers,audioDecoderReady:this.ready,audioNativeDecoder:this.native,audioContextRunning:this.ctx?.state==='running'
    };
  }
  destroy(){
    if(this.closed)return;
    this.closed=true;
    this.generation++;
    if(this.decoder&&this.decoder.state!=='closed')this.decoder.close();
    this.decoder=null;
    if(this.opus&&this.ready)try{
      this.opus.ccall('cleanup');
    }catch{
    }
    for(const s of this.sources){
      try{
        s.stop();
      }catch{
      }s.disconnect();
    }this.sources.clear();
    if(this.ctx){
      this.ctx.onstatechange=null;
      this.ctx.close().catch(()=>{
      });
    }this.ready=false;
  }
}
