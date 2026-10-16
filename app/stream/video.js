// Annex-B H.264 over the negotiated browser video channel (mediaContainer 0).
// Protocol reference: nomi-san/lowlat, MIT; see LICENSE-lowlat.
export function inspectAnnexB(data) {
  let key=false,codec=null,nals=0;
  for(let i=0;
  i+3<data.length;
  i++){
    if(data[i]!==0||data[i+1]!==0)continue;
    let at;
    if(data[i+2]===1)at=i+3;
    else if(data[i+2]===0&&data[i+3]===1)at=i+4;
    else continue;
    if(at>=data.length)break;
    const type=data[at]&31;
    nals++;
    if(type===5)key=true;
    if(type===7&&at+3<data.length)codec='avc1.'+Array.from(data.subarray(at+1,at+4),x=>x.toString(16).padStart(2,'0')).join('');
    i=at;
  }
  return {
    key,codec,nals
  };
}
export class VideoPlayer {
  constructor(canvas,onFatal,onDiagnostic=()=>{
  },onFrame=()=>{
  },onNeedKeyframe=()=>{
  }) {
    Object.assign(this,{
      canvas,onFatal,onDiagnostic,onFrame,onNeedKeyframe
    });
    this.context=canvas.getContext('2d',{
      alpha:false
    });
    if(!this.context)throw Error('canvas unavailable');
    this.decoder=null;
    this.codec=null;
    this.waiting=true;
    this.closed=false;
    this.generation=0;
    this.packets=0;
    this.receivedBytes=0;
    this.submitted=0;
    this.decoded=0;
    this.dropped=0;
    this.width=0;
    this.height=0;
    this.lastRequest=-Infinity;
    this.lastTimestamp=-1;
    this.recoveries=0;
    this.seen=new Set();
  }
  diag(stage,metrics={
  }){
    if(this.seen.has(stage))return;
    this.seen.add(stage);
    this.onDiagnostic(stage,metrics);
  }
  requestKeyframe(){
    const now=performance.now();
    if(this.closed||now-this.lastRequest<1000)return;
    this.lastRequest=now;
    this.onNeedKeyframe();
  }
  configure(codec) {
    if(this.decoder&&this.decoder.state!=='closed')this.decoder.close();
    const generation=++this.generation;
    this.codec=codec;
    this.waiting=true;
    this.decoder=new VideoDecoder({
      output:frame=>{
        try{
          if(this.closed||generation!==this.generation)return;
          this.width=frame.displayWidth;
          this.height=frame.displayHeight;
          if(this.canvas.width!==this.width)this.canvas.width=this.width;
          if(this.canvas.height!==this.height)this.canvas.height=this.height;
          this.context.drawImage(frame,0,0,this.width,this.height);
          this.decoded++;
          this.diag('video-frame-presented',{
            width:this.width,height:this.height
          });
          if(this.decoded===1)this.onFrame();
        }catch{
          this.diag('video-render-error');
          this.onFatal();
        }finally{
          frame.close();
        }
      },error:()=>{
        if(!this.closed&&generation===this.generation)this.recover();
      }
    });
    this.decoder.configure({
      codec,optimizeForLatency:true
    });
    this.diag('video-decoder-configured');
  }
  recover(){
    this.diag('video-decoder-error');
    if(this.closed)return;
    if(++this.recoveries>2){
      this.onFatal();
      return;
    }
    try{
      this.configure(this.codec||'avc1.42001e');
      this.requestKeyframe();
    }catch{
      this.onFatal();
    }
  }
  push(data) {
    if(this.closed)return;
    if(!(data instanceof ArrayBuffer)||!data.byteLength||data.byteLength>4*1024*1024){
      this.diag('video-invalid-packet');
      this.onFatal();
      return;
    }
    const bytes=new Uint8Array(data);
    this.packets++;
    this.receivedBytes+=bytes.byteLength;
    this.diag('video-packet-received',{
      firstPacketBytes:bytes.byteLength
    });
    const info=inspectAnnexB(bytes);
    if(!info.nals){
      this.diag('video-unrecognized-format');
      this.requestKeyframe();
      return;
    }
    this.diag('video-annexb-received');
    try {
      if(!this.decoder||info.codec&&info.codec!==this.codec)this.configure(info.codec||'avc1.42001e');
      if(this.decoder.decodeQueueSize>6){
        this.dropped++;
        this.configure(this.codec);
        this.requestKeyframe();
      }
      if(this.waiting&&!info.key){
        this.dropped++;
        this.diag('video-awaiting-keyframe');
        this.requestKeyframe();
        return;
      }
      this.waiting=false;
      const timestamp=Math.max(this.lastTimestamp+1,Math.round(performance.now()*1000));
      this.lastTimestamp=timestamp;
      this.decoder.decode(new EncodedVideoChunk({
        type:info.key?'key':'delta',timestamp,data
      }));
      this.submitted++;
      this.diag('video-decode-submitted');
    }catch{
      this.recover();
    }
  }
  snapshot(){
    return {
      packets:this.packets,receivedBytes:this.receivedBytes,submitted:this.submitted,decoded:this.decoded,dropped:this.dropped,waitingForKeyframe:this.waiting,decodeQueueSize:this.decoder?.state==='configured'?this.decoder.decodeQueueSize:0,width:this.width,height:this.height
    };
  }
  destroy(clear=true){
    if(this.closed)return;
    this.closed=true;
    this.generation++;
    if(this.decoder&&this.decoder.state!=='closed')this.decoder.close();
    this.decoder=null;
    if(clear)this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
  }
}
