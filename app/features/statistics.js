import { t } from '../core/i18n.js';
export class StreamStatistics {
  constructor(element){
    this.element=element;
    this.timer=null;
    this.previous=null;
  }
  start(client){
    this.stop();
    this.previous={
      time:performance.now(),decoded:0,bytes:0
    };
    this.timer=setInterval(()=>{
      if(client.closed)return;
      const v=client.videoPlayer.snapshot(),now=performance.now(),seconds=(now-this.previous.time)/1000;
      if(seconds<=0)return;
      const fps=Math.max(0,(v.decoded-this.previous.decoded)/seconds),mbps=Math.max(0,(v.receivedBytes-this.previous.bytes)*8/seconds/1e6);
      this.element.textContent=`${v.width||'—'} × ${v.height||'—'} · ${fps.toFixed(0)}${t("text.decodedFPS")}${mbps.toFixed(1)} Mbit/s Video · ${v.dropped}${t("text.droppedPackets")}`;
      this.previous={
        time:now,decoded:v.decoded,bytes:v.receivedBytes
      };
    },1000);
  }
  stop(){
    clearInterval(this.timer);
    this.timer=null;
    this.element.textContent=t("stream.noActiveStream");
  }
}
