import { AudioPlayer } from '../stream/audio.js';
import { VideoPlayer } from '../stream/video.js';
import { audioSamples } from './audio-sample.js';
import { sample } from './video-sample.js';
export function setupMediaTests({
  getClient,getController,$,diagnostic,controls
}){
  $('localVideo').onclick=async()=>{
    const client=getClient(),controller=getController();
    if(client||controller||$('localVideo').disabled)return;
    if(!window.VideoDecoder||!window.EncodedVideoChunk){
      $('localResult').textContent='WebCodecs ist hier nicht verfügbar.';
      diagnostic('local-video-unavailable');
      return;
    }
    $('localCanvas').hidden=false;
    $('localVideo').disabled=true;
    $('start').disabled=true;
    $('localResult').textContent='Synthetisches H.264-Bild wird decodiert …';
    let tester,timer;
    try{
      await new Promise((resolve,reject)=>{
        timer=setTimeout(()=>reject(Error('timeout')),4000);
        tester=new VideoPlayer($('localCanvas'),()=>reject(Error('decoder')),()=>{
        },resolve);
        tester.push(sample.buffer);
      });
      diagnostic('local-video-decoded',tester.snapshot());
      $('localResult').textContent='Bestanden: H.264-Testbild decodiert und auf Canvas dargestellt. Keine Parsec-Verbindung getestet.';
    }catch{
      diagnostic('local-video-failed');
      $('localResult').textContent='Der lokale H.264-Decodiertest ist fehlgeschlagen. Bitte den Bericht herunterladen.';
    }
    finally{
      clearTimeout(timer);
      tester?.destroy(false);
      $('localVideo').disabled=false;
      controls();
    }
  };
  $('localAudio').onclick=async()=>{
    const client=getClient(),controller=getController();
    if($('localAudio').disabled)return;
    $('localAudio').disabled=true;
    $('audioResult').textContent='Opus-Testton wird vorbereitet …';
    const active=client,player=active?.audioPlayer||new AudioPlayer((stage,metrics)=>diagnostic('local-'+stage,metrics));
    try{
      const running=await player.unlock();
      const ready=await player.readyPromise;
      if(!running||!ready)throw Error('audio unavailable');
      const before=player.scheduledFrames;
      for(const packet of audioSamples)player.queueData(new Uint8Array(packet).buffer);
      await new Promise(resolve=>setTimeout(resolve,600));
      const metrics=player.snapshot();
      diagnostic('local-audio-summary',metrics);
      $('audioResult').textContent=player.scheduledFrames>before?'Opus-Testton decodiert und zur Ausgabe eingeplant. Bitte prüfen, ob du den kurzen Ton hörst.':'Kein Testton eingeplant. Bitte Bericht herunterladen.';
    }catch{
      diagnostic('local-audio-failed',player.snapshot());
      $('audioResult').textContent='Audiofreigabe oder Opus-Decodierung fehlgeschlagen. Bitte Bericht herunterladen.';
    }
    finally{
      if(!active)player.destroy();
      $('localAudio').disabled=false;
    }
  };
}
