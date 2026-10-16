import * as Msg from './msg.js';
// Do not request frames until both required data channels are usable.
export class StreamRequest {
  constructor({
    send,config,diagnostic,hasVideo,blocked,onFatal,schedule=setTimeout,cancel=clearTimeout
  }) {
    Object.assign(this,{
      send,config,diagnostic,hasVideo,blocked,onFatal,schedule,cancel
    });
    this.control=false;
    this.video=false;
    this.started=false;
    this.closed=false;
    this.timer=null;
  }
  transmit(message,stage) {
    try {
      if(this.send(message)!==true)throw Error('channel not open');
      this.diagnostic(stage,{
      });
      return true;
    } catch {
      this.diagnostic('stream-request-send-failed',{
      });
      this.onFatal(-6108);
      return false;
    }
  }
  open(channel) {
    if(this.closed)return;
    if(channel==='control')this.control=true;
    if(channel==='video')this.video=true;
    if(this.started||!this.control||!this.video)return;
    this.started=true;
    if(!this.transmit(Msg.init(this.config),'stream-init-json-sent'))return;
    // The historical client uses Reinit to request a fresh stream. Retry once,
    // only if no video arrived and the host has not reported a shutter.
    this.timer=this.schedule(()=>{
      this.timer=null;
      if(this.closed||this.hasVideo()||this.blocked())return;
      this.transmit(Msg.reinit(),'stream-reinit-sent');
    },5000);
  }
  close() {
    this.closed=true;
    if(this.timer!==null)this.cancel(this.timer);
    this.timer=null;
  }
}
