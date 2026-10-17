import { t } from '../core/i18n.js';
import { defaults,normalizeQuality,readPreference,writePreference,streamConfig } from '../core/preferences.js';
export function setupQuality({getClient,$}){
  let quality=readPreference('parsec-quality-v1',defaults(),normalizeQuality);
  let playback=readPreference('parsec-playback',{},x=>({startMuted:x?.startMuted===true,remember:x?.remember!==false,lastMuted:x?.lastMuted===true}));
  if(!playback.remember)quality=defaults();
  let appliedQuality={...quality},connectionQuality={...quality},messageTimer=null;
  let muted=playback.startMuted||(playback.remember&&playback.lastMuted),lastAudible=quality.volume||100;
  $('startMuted').checked=playback.startMuted;$('rememberStream').checked=playback.remember;
  function saveAudio(){
    if(playback.remember){playback.lastMuted=muted;writePreference('parsec-playback',playback);writePreference('parsec-quality-v1',appliedQuality={...appliedQuality,volume:quality.volume});}
  }
  for(const id of ['startMuted','rememberStream'])$(id).onchange=()=>{
    playback.startMuted=$('startMuted').checked;playback.remember=$('rememberStream').checked;
    writePreference('parsec-playback',playback);
    if(!playback.remember){try{localStorage.removeItem('parsec-quality-v1');}catch{}}
  };
  const presets={balanced:defaults(),economy:{...defaults(),bitrate:4,frameRate:30},quality:{...defaults(),bitrate:20,resolution:'1920x1080'}};
  function fill(){
    for(const prefix of ['', 'overlay']){
      const field=id=>$(prefix?prefix+id[0].toUpperCase()+id.slice(1):id);
      field('constantFps').checked=quality.constantFps;
      for(const id of ['bitrate','frameRate','resolution','volume','videoCodec'])field(id).value=String(quality[id]);
    }
    $('qualityPreset').value=Object.entries(presets).find(([,preset])=>['bitrate','frameRate','resolution'].every(key=>preset[key]===quality[key]))?.[0]||'custom';
  }
  fill();
  $('qualityPreset').onchange=()=>{
    if(presets[$('qualityPreset').value]){quality={...presets[$('qualityPreset').value],volume:quality.volume,constantFps:quality.constantFps,videoCodec:quality.videoCodec};fill();}
  };
  function audioState(){
    const silent=muted||quality.volume===0;
    $('menuMute').textContent=silent?t('audio.unmute'):t('audio.mute');
    $('menuMute').setAttribute('aria-pressed',String(silent));
    $('audioStatus').textContent=silent?t('audio.silent'):t('audio.playing')+' '+quality.volume+'%';
  }
  const applyVolume=()=>{getClient()?.audioPlayer.setVolume(muted?0:quality.volume/100);audioState();};
  function changeVolume(id){
    quality.volume=Number($(id).value);
    if(quality.volume>0){lastAudible=quality.volume;muted=false;}
    $('volume').value=$('overlayVolume').value=String(quality.volume);
    applyVolume();saveAudio();
  }
  $('volume').oninput=()=>changeVolume('volume');$('overlayVolume').oninput=()=>changeVolume('overlayVolume');
  function message(text){
    clearTimeout(messageTimer);
    for(const id of ['qualityStatus','overlayQualityStatus']){$(id).textContent=text;$(id).hidden=false;}
    messageTimer=setTimeout(()=>{for(const id of ['qualityStatus','overlayQualityStatus'])$(id).hidden=true;},8000);
    messageTimer?.unref?.();
  }
  function apply(event,overlay=false){
    event.preventDefault();
    const field=id=>$(overlay?'overlay'+id[0].toUpperCase()+id.slice(1):id),client=getClient();
    const next=normalizeQuality({bitrate:Number(field('bitrate').value),frameRate:Number(field('frameRate').value),resolution:field('resolution').value,volume:quality.volume,constantFps:field('constantFps').checked,videoCodec:field('videoCodec').value});
    const base=client?connectionQuality:appliedQuality;
    const deferred=next.resolution!==base.resolution||next.videoCodec!==base.videoCodec;
    quality=next;appliedQuality={...next};fill();
    const saved=playback.remember&&writePreference('parsec-quality-v1',quality);
    applyVolume();
    let requested=false;
    try{requested=client?.updateQuality(streamConfig(quality))===true;}catch{}
    const parts=[saved?t('text.savedOnThisDevice'):t('text.activeOnlyInThisTab')];
    if(client)parts.push(requested?t('quality.requested'):t('quality.notReady'));
    if(deferred)parts.push(t('quality.nextConnection'));
    message(parts.join(' '));
  }
  $('qualityForm').onsubmit=event=>apply(event);$('overlayQualityForm').onsubmit=event=>apply(event,true);
  $('menuMute').onclick=()=>{
    if(muted||quality.volume===0){muted=false;if(quality.volume===0){quality.volume=lastAudible;fill();}}
    else muted=true;
    applyVolume();saveAudio();
  };
  audioState();
  return {config:()=>streamConfig(quality),applyVolume,beginStream(){
    connectionQuality={...quality};
    if(playback.startMuted)muted=true;else if(!playback.remember)muted=false;
    applyVolume();
  }};
}
