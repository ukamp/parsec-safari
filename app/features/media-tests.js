import {hevcSample} from './hevc-sample.js';
import { t } from '../core/i18n.js';
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
      $('localResult').textContent=t("text.webcodecsIsUnavailableHere");
      diagnostic('local-video-unavailable');
      return;
    }
    $('localCanvas').hidden=false;
    $('localVideo').disabled=true;
    $('start').disabled=true;
    $('localResult').textContent=t("text.decodingASyntheticH264Image");
    let tester,timer;
    try{
      await new Promise((resolve,reject)=>{
        timer=setTimeout(()=>reject(Error('timeout')),4000);
        tester=new VideoPlayer($('localCanvas'),()=>reject(Error('decoder')),()=>{
        },resolve);
        tester.push(sample.buffer);
      });
      diagnostic('local-video-decoded',tester.snapshot());
      $('localResult').textContent=t("text.passedH264TestImageDecodedAndDisplayedOn");
    }catch{
      diagnostic('local-video-failed');
      $('localResult').textContent=t("text.theLocalH264DecoderTestFailedPleaseDownload");
    }
    finally{
      clearTimeout(timer);
      tester?.destroy(false);
      $('localVideo').disabled=false;
      controls();
    }
  };
  $('testHevc').onclick=async()=>{
    if(getClient()||getController()||$('testHevc').disabled)return;
    $('testHevc').disabled=true;$('hevcCanvas').hidden=false;$('hevcResult').textContent=t('codec.testing');
    let tester,timer;
    try{
      await new Promise((resolve,reject)=>{
        timer=setTimeout(()=>reject(Error('timeout')),4000);
        tester=new VideoPlayer($('hevcCanvas'),()=>reject(Error('decoder')),()=>{},resolve);
        tester.setHevc(true);tester.push(hevcSample.buffer);
      });
      $('hevcResult').textContent=t('codec.testPassed');diagnostic('local-hevc-decoded',tester.snapshot());
    }catch{$('hevcResult').textContent=t('codec.testFailed');diagnostic('local-hevc-failed');}
    finally{clearTimeout(timer);tester?.destroy(false);$('testHevc').disabled=false;controls();}
  };
  $('localAudio').onclick=async()=>{
    const client=getClient(),controller=getController();
    if($('localAudio').disabled)return;
    $('localAudio').disabled=true;
    $('audioResult').textContent=t("text.preparingOpusTestTone");
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
      $('audioResult').textContent=player.scheduledFrames>before?t("text.opusTestToneDecodedAndScheduledForPlaybackPlease"):t("text.noTestToneWasScheduledPleaseDownloadTheReport");
    }catch{
      diagnostic('local-audio-failed',player.snapshot());
      $('audioResult').textContent=t("text.audioUnlockOrOpusDecodingFailedPleaseDownloadThe");
    }
    finally{
      if(!active)player.destroy();
      $('localAudio').disabled=false;
    }
  };
}
