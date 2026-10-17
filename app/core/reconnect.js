// Retry only failures generated locally by the signaling/RTC adapters.
// Host rejections, unknown host codes and authentication failures are not retried.
export const retryable=code=>[-3000,-3001,-3003,-6023,-6024].includes(code);
export class Reconnect {
  constructor({connect,allowed=()=>true,status=()=>{},schedule=setTimeout,cancel=clearTimeout}){
    Object.assign(this,{connect,allowed,status,schedule,cancel});
    this.attempts=0;this.peer=null;this.timer=null;this.epoch=0;
  }
  start(peer){this.stop();this.peer=peer;}
  recovered(){this.attempts=0;}
  failed(code){
    if(this.timer!==null||!this.peer||!retryable(code)||this.attempts>=3||!this.allowed())return false;
    const delay=[1000,3000,7000][this.attempts++],epoch=this.epoch;
    this.status(this.attempts);
    this.timer=this.schedule(()=>{
      this.timer=null;
      if(epoch===this.epoch&&this.peer&&this.allowed())void this.connect(this.peer);
    },delay);
    return true;
  }
  stop(){this.epoch++;if(this.timer!==null)this.cancel(this.timer);this.timer=null;this.peer=null;this.attempts=0;}
}
