import * as Msg from './msg.js';
import { AudioPlayer } from './audio.js';
import { Input } from './input.js';
import { RTC } from './rtc.js';
import { Signal } from './signal.js';
import { VideoPlayer } from './video.js';
import { StreamRequest } from './stream-request.js';
export class Client {
  constructor(video,onEvent) {
    this.onEvent=onEvent;
    this.closed=false;
    this.connected=false;
    this.rtc=null;
    this.signal=null;
    this.configured=false;
    this.controlPackets=0;
    this.audioPackets=0;
    this.audioBytes=0;
    this.shutter=false;
    this.seen=new Set();
    this.audioPlayer=new AudioPlayer((stage,metrics)=>this.diagnostic(stage,metrics));
    this.videoPlayer=new VideoPlayer(video,()=>this.destroy(-6106),(stage,metrics)=>this.diagnostic(stage,metrics),()=>this.onEvent({
      type:'frame'
    }),()=>{
      if(this.connected)this.rtc?.send(Msg.reinit(),0);
    });
    this.input=new Input(video,buf=>{
      if(this.connected)this.rtc?.send(buf,0);
    },status=>this.onEvent({
      type:'gamepad',status
    }),(stage,metrics)=>this.diagnostic(stage,metrics));
    this.visible=()=>{
      if(this.connected&&!document.hidden)this.rtc?.send(Msg.reinit(),0);
    };
    document.addEventListener('visibilitychange',this.visible);
  }
  diagnostic(stage,metrics={
  }) {
    this.onEvent({
      type:'diagnostic',stage,metrics
    });
  }
  once(stage,metrics={
  }) {
    if(this.seen.has(stage))return;
    this.seen.add(stage);
    this.diagnostic(stage,metrics);
  }
  async unlockAudio(){
    return this.audioPlayer.unlock();
  }
  async connect(token,peer,cfg={
  }) {
    this.signal=new Signal(code=>this.destroy(code),stage=>this.once(stage));
    this.rtc=new RTC(peer,this.signal.getAttemptId(),candidate=>this.signal?.send(token,candidate),code=>this.destroy(code));
    this.stream=new StreamRequest({
      send:buf=>this.rtc.send(buf,0),config:cfg,diagnostic:(s,m)=>this.diagnostic(s,m),hasVideo:()=>this.videoPlayer.packets>0,blocked:()=>document.hidden||this.shutter,onFatal:code=>this.destroy(code)
    });
    this.rtc.addChannel('control',0,()=>{
      if(this.closed)return;
      this.connected=true;
      this.signal.connected();
      this.input.attach();
      this.onEvent({
        type:'connect'
      });
      this.stream.open('control');
    },e=>{
      if(this.closed)return;
      try {
        this.controlPackets++;
        this.once('host-control-received');
        const message=Msg.unpack(e.data),type=message.type,code=message.data0;
        if(type===10){
          this.diagnostic('host-abort',{
            hostCode:code
          });
          this.destroy(code);
        }
        else if(type===9){
          this.input.setMouseMode(message.relative,message.hidden);
        }
        else if(type===16){
          this.shutter=!!code;
          this.once(this.shutter?'host-input-blocked':'host-input-enabled');
        }
        else if(type===21)this.once('host-encode-report');
        // No host text, chat, cursor pixels, credentials or IPs are logged.
        else this.once('host-control-type-'+type);
      } catch {
        this.destroy(-6107);
      }
    });
    this.rtc.addChannel('video',1,()=>{
      if(this.closed)return;
      this.diagnostic('video-channel-open');
      this.stream.open('video');
    },e=>{
      if(this.closed)return;
      if(!this.configured){
        this.configured=true;
        try{
          if(this.rtc.send(Msg.config(cfg),0))this.diagnostic('stream-settings-sent');
        }catch{
          this.destroy(-6108);
          return;
        }
      }this.videoPlayer.push(e.data);
    });
    this.rtc.addChannel('audio',2,()=>{
      if(!this.closed)this.diagnostic('audio-channel-open');
    },e=>{
      if(this.closed)return;
      this.audioPackets++;
      this.audioBytes+=e.data.byteLength;
      this.once('audio-packet-received');
      this.audioPlayer.queueData(e.data);
    });
    const creds=await this.rtc.createOffer();
    if(this.closed)return;
    this.signal.connect('kessel-ws.parsec.app',443,token,peer,creds,(c,k)=>this.rtc?.setCandidate(c,k));
  }
  updateQuality(config){
    if(!this.connected||this.closed)return false;
    return this.rtc.send(Msg.config(config),0);
  }
  reportAudio(){
    this.diagnostic('audio-summary',this.audioPlayer.snapshot());
  }
  destroy(code=0) {
    if(this.closed)return;
    this.diagnostic('audio-summary',this.audioPlayer.snapshot());
    this.diagnostic('video-summary',this.videoPlayer.snapshot());
    this.diagnostic('transport-summary',{
      controlPackets:this.controlPackets,audioPackets:this.audioPackets,audioBytes:this.audioBytes,streamRequested:!!this.stream?.started,shutter:this.shutter
    });
    try{
      if(this.connected)this.rtc?.send(Msg.abort(),0);
    }catch{
    }this.closed=true;
    this.stream?.close();
    this.input.detach();
    document.removeEventListener('visibilitychange',this.visible);
    this.connected=false;
    this.signal?.close();
    this.rtc?.close();
    this.videoPlayer.destroy();
    try{
      this.audioPlayer.destroy();
    }catch{
    }
    this.onEvent({
      type:'exit',code
    });
  }
}
