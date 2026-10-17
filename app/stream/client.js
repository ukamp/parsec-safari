import { supportsHevc } from './hevc.js';
import { hostData } from './host-data.js';
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
    this.displays=[];this.hostEncodeMs=null;
    this.audioPlayer=new AudioPlayer((stage,metrics)=>this.diagnostic(stage,metrics));
    this.videoPlayer=new VideoPlayer(video,()=>{if(!this.fallbackH264())this.destroy(-6106);},(stage,metrics)=>this.diagnostic(stage,metrics),()=>{this.input?.renderPointer();clearTimeout(this.codecTimer);this.onEvent({type:'frame'});},()=>{
      if(this.connected)this.rtc?.send(Msg.reinit(this.config),0);
    });
    this.input=new Input(video,buf=>{
      if(this.connected)this.rtc?.send(buf,0);
    },status=>this.onEvent({
      type:'gamepad',status
    }),(stage,metrics)=>this.diagnostic(stage,metrics));
    this.visible=()=>{
      if(this.connected&&!document.hidden)this.rtc?.send(Msg.reinit(this.config),0);
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
    cfg={...cfg};
    if(cfg.video_codec==='hevc'&&!await supportsHevc()){
      cfg.video_codec='h264';this.diagnostic('hevc-browser-unavailable');this.onEvent({type:'codec',state:'unavailable'});
    }
    if(this.closed)return;
    this.config=cfg;this.hevcAttempt=cfg.video_codec==='hevc';this.fellBack=false;
    this.videoPlayer.setHevc(this.hevcAttempt);
    this.signal=new Signal(code=>this.destroy(code),stage=>this.once(stage));
    this.rtc=new RTC(peer,this.signal.getAttemptId(),candidate=>this.signal?.send(token,candidate),code=>this.destroy(code));
    this.stream=new StreamRequest({
      send:buf=>this.rtc.send(buf,0),config:cfg,diagnostic:(s,m)=>this.diagnostic(s,m),hasVideo:()=>this.videoPlayer.packets>0,blocked:()=>document.hidden||this.shutter,onFatal:code=>this.destroy(code)
    });
    this.rtc.addChannel('control',0,()=>{
      if(this.closed)return;
      this.connected=true;
      this.signal.connected();
      this.rtc.send(Msg.release(),0);
      this.input.attach();
      this.onEvent({
        type:'connect'
      });
      this.stream.open('control');
      if(this.hevcAttempt)this.codecTimer=setTimeout(()=>this.fallbackH264(),8000);
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
          this.input.syncHostCursor(message);
        }
        else if(type===16){
          this.shutter=!!code;
          this.input.setBlocked(this.shutter);
          this.once(this.shutter?'host-input-blocked':'host-input-enabled');
        }
        else if(type===17){
          const data=hostData(message,e.data);
          if(data?.videoConfig)this.sendInitialSettings();
          if(data?.displays){this.displays=data.displays;this.onEvent({type:'displays',displays:this.displays});}
        }
        else if(type===20)this.input.rumble(message.data0,message.data1,message.data2);
        else if(type===21){
          if(code===1&&message.data1>=0&&message.data1<=1000000)this.hostEncodeMs=message.data1/1000;
          this.once('host-encode-report');
        }
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
      if(!this.sendInitialSettings())return;
      this.videoPlayer.push(e.data);
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
  fallbackH264(){
    if(this.closed||!this.connected||!this.hevcAttempt||this.fellBack)return false;
    this.fellBack=true;this.hevcAttempt=false;clearTimeout(this.codecTimer);
    this.config={...this.config,video_codec:'h264'};
    if(this.stream)this.stream.config=this.config;
    this.videoPlayer.fallbackH264();
    this.diagnostic('hevc-fallback-requested');this.onEvent({type:'codec',state:'fallback'});
    try{if(!this.rtc.send(Msg.reinit(this.config),0))throw Error('closed');}catch{this.destroy(-6108);return true;}
    const decoded=this.videoPlayer.decoded;
    this.codecTimer=setTimeout(()=>{if(!this.closed&&this.videoPlayer.decoded===decoded)this.destroy(-6106);},8000);
    return true;
  }
  sendInitialSettings(){
    if(this.configured)return true;
    if(!this.connected||this.closed)return false;
    try{
      if(this.rtc.send(Msg.config(this.config),0)!==true)throw Error('control closed');
      this.configured=true;
      this.diagnostic('stream-settings-sent',{requestedWidth:this.config.server_resolution_x??0,requestedHeight:this.config.server_resolution_y??0});
      return true;
    }catch{this.destroy(-6108);return false;}
  }
  updateQuality(config){
    if(!this.connected||this.closed)return false;
    // Resolution and codec changes remain deferred until reconnect.
    const {video_codec,server_resolution_x,server_resolution_y,...live}=config;
    this.config={...this.config,...live};
    return this.rtc.send(Msg.config(this.config),0);
  }
  selectDisplay(id){
    if(!this.displays.some(display=>display.id===id))return false;
    return this.updateQuality({output:id});
  }
  async transportStats(){
    try{
      const reports=await this.rtc?.rtc.getStats?.();
      let rtt=null;
      reports?.forEach(report=>{
        if(report.type==='candidate-pair'&&report.state==='succeeded'&&(report.nominated||report.selected)&&Number.isFinite(report.currentRoundTripTime))rtt=report.currentRoundTripTime*1000;
      });
      return rtt;
    }catch{return null;}
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
      if(this.connected){this.rtc?.send(Msg.release(),0);this.rtc?.send(Msg.abort(),0);}
    }catch{
    }this.closed=true;
    clearTimeout(this.codecTimer);
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
