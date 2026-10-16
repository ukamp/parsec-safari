export class RTC {
  constructor(peer,attempt,onCandidate,onFatal){
    this.peer=peer;
    this.attempt=attempt;
    this.onCandidate=onCandidate;
    this.onFatal=onFatal;
    this.channels={
    };
    this.closed=false;
    this.started=false;
    this.queue=Promise.resolve();
    this.rtc=new RTCPeerConnection({
      iceServers:[{
        urls:'stun:stun.parsec.gg:3478'
      }]
    });
    this.rtc.onicecandidate=e=>{
      if(this.closed)return;
      if(!e.candidate){
        this.sync();
        return;
      }const a=e.candidate.candidate.split(' ');
      if(a.length<8||a[2].toLowerCase()!=='udp'||a[4].endsWith('.local'))return;
      onCandidate({
        action:'candidate_exchange',subject:'server',to:peer,attempt_id:attempt,candidate_ip:a[4],candidate_port:Number(a[5]),sync:0,from_stun:a[7]==='srflx'?1:0,lan:a[7]==='host'?1:0
      });
    };
    this.rtc.onconnectionstatechange=()=>{
      if(!this.closed&&this.rtc.connectionState==='failed')this.onFatal(-6023);
    };
  }
  addChannel(name,id,onOpen,onMessage){
    const c=this.rtc.createDataChannel(name,{
      id,negotiated:true,ordered:true
    });
    c.binaryType='arraybuffer';
    c.onopen=onOpen;
    c.onmessage=onMessage;
    c.onclose=()=>{
      if(!this.closed&&id===0)this.onFatal(-6024);
    };
    this.channels[id]=c;
  }
  async createOffer(){
    this.offer=await this.rtc.createOffer();
    const lines=this.offer.sdp.split(/\r?\n/);
    const get=key=>{
      const l=lines.find(s=>s.startsWith('a='+key+':'));
      return l?l.slice(key.length+3):null;
    };
    this.mid=get('mid')||'0';
    this.media=lines.find(s=>s.startsWith('m=application '));
    const result={
      ice_ufrag:get('ice-ufrag'),ice_pwd:get('ice-pwd'),fingerprint:get('fingerprint')
    };
    if(!result.ice_ufrag||!result.ice_pwd||!result.fingerprint||!this.media)throw Error('sdp');
    return result;
  }
  setCandidate(c,creds){
    this.queue=this.queue.then(()=>this.apply(c,creds)).catch(()=>{
      if(!this.closed)this.onFatal(-6025);
    });
  }
  async apply(c,k){
    if(this.closed)return;
    if(!this.started){
      if(!k||!Object.values(k).every(v=>typeof v!=='string'||!/[\r\n]/.test(v)))throw Error('credentials');
      await this.rtc.setLocalDescription(this.offer);
      const modern=this.media.includes('UDP/DTLS/SCTP');
      const s=['v=0','o=- 1 2 IN IP4 127.0.0.1','s=-','t=0 0','a=group:BUNDLE '+this.mid,'a=msid-semantic: WMS *',modern?'m=application 9 UDP/DTLS/SCTP webrtc-datachannel':'m=application 9 DTLS/SCTP 5000','c=IN IP4 0.0.0.0','a=ice-ufrag:'+k.ice_ufrag,'a=ice-pwd:'+k.ice_pwd,'a=ice-options:trickle','a=fingerprint:'+k.fingerprint,'a=setup:active','a=mid:'+this.mid,'a=sendrecv',modern?'a=sctp-port:5000':'a=sctpmap:5000 webrtc-datachannel 256','a=max-message-size:4194304',''].join('\r\n');
      await this.rtc.setRemoteDescription({
        type:'answer',sdp:s
      });
      this.started=true;
      this.syncTimer=setTimeout(()=>this.sync(),3000);
    }if(!c.sync){
      if(typeof c.candidate_ip!=='string'||!c.candidate_ip||/\s/.test(c.candidate_ip)||!Number.isInteger(c.candidate_port)||c.candidate_port<1||c.candidate_port>65535)throw Error('candidate');
      const type=c.from_stun?'srflx':'host';
      await this.rtc.addIceCandidate({
        candidate:'candidate:1 1 udp 2113937151 '+c.candidate_ip+' '+c.candidate_port+' typ '+type,sdpMid:this.mid,sdpMLineIndex:0
      });
    }
  }
  sync(){
    if(this.closed||this.synced)return;
    this.synced=true;
    clearTimeout(this.syncTimer);
    this.onCandidate({
      candidate_ip:'1.2.3.4',candidate_port:1234,sync:1,from_stun:0,lan:0
    });
  }
  send(buf,id){
    if(this.channels[id]?.readyState!=='open')return false;
    this.channels[id].send(buf);
    return true;
  }
  close(){
    if(this.closed)return;
    this.closed=true;
    clearTimeout(this.syncTimer);
    this.rtc.onicecandidate=null;
    for(const c of Object.values(this.channels)){
      c.onclose=null;
      c.onopen=null;
      c.onmessage=null;
      c.close();
    }this.rtc.close();
  }
}
