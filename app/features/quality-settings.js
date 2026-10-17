import { t } from '../core/i18n.js';
import { defaults,normalizeQuality,readPreference,writePreference,streamConfig } from '../core/preferences.js';
export function setupQuality({
  getClient,$
}){
  let quality=readPreference('parsec-quality-v1',defaults(),normalizeQuality);
  let playback=readPreference('parsec-playback',{},x=>({startMuted:x?.startMuted===true,remember:x?.remember!==false,lastMuted:x?.lastMuted===true}));
  if(!playback.remember)quality=defaults();
  let muted=playback.startMuted||(playback.remember&&playback.lastMuted);
  $('startMuted').checked=playback.startMuted;
  $('rememberStream').checked=playback.remember;
  for(const id of ['startMuted','rememberStream'])$(id).onchange=()=>{playback.startMuted=$('startMuted').checked;playback.remember=$('rememberStream').checked;writePreference('parsec-playback',playback);if(!playback.remember){try{localStorage.removeItem('parsec-quality-v1');}catch{}}};
  const presets={balanced:defaults(),economy:{...defaults(),bitrate:4,frameRate:30},quality:{...defaults(),bitrate:20,resolution:'1920x1080'}};
  const fill=()=>{
    $('constantFps').checked=quality.constantFps;
    $('overlayConstantFps').checked=quality.constantFps;
    for(const id of ['bitrate','frameRate','resolution','videoCodec','volume'])$('overlay'+id[0].toUpperCase()+id.slice(1)).value=String(quality[id]);
    $('qualityPreset').value=Object.entries(presets).find(([,preset])=>['bitrate','frameRate','resolution'].every(key=>preset[key]===quality[key]))?.[0]||'custom';
    for(const id of ['bitrate','frameRate','resolution','volume','videoCodec'])$(id).value=String(quality[id]);
  };
  fill();
  $('qualityPreset').onchange=()=>{
    if(presets[$('qualityPreset').value]){
      quality={
        ...presets[$('qualityPreset').value],volume:quality.volume,constantFps:quality.constantFps,videoCodec:quality.videoCodec
      };
      fill();
    }
  };
  const applyVolume=()=>getClient()?.audioPlayer.setVolume(muted?0:quality.volume/100);
  $('volume').oninput=()=>{
    quality.volume=Number($('volume').value);$('overlayVolume').value=String(quality.volume);
    applyVolume();
  };
  function apply(event,overlay=false){
    const field=id=>$(overlay?'overlay'+id[0].toUpperCase()+id.slice(1):id);
    event.preventDefault();
    quality=normalizeQuality({
      bitrate:Number(field('bitrate').value),frameRate:Number(field('frameRate').value),resolution:field('resolution').value,volume:quality.volume,constantFps:field('constantFps').checked,videoCodec:field('videoCodec').value
    });
    fill();
    const saved=playback.remember&&writePreference('parsec-quality-v1',quality),client=getClient();
    applyVolume();
    const applied=client?.updateQuality(streamConfig(quality));
    $('qualityStatus').textContent=(saved?t("text.savedOnThisDevice"):t("text.activeOnlyInThisTab"))+(client?(applied?t("text.bitrateAndFrameRateRequestedNewResolutionAppliesOn"):t("text.streamNotReadyYetTheseSettingsApplyOnThe")):t("text.appliesOnTheNextConnection"));
    $('overlayQualityStatus').textContent=$('qualityStatus').textContent;
  };
  $('qualityForm').onsubmit=event=>apply(event);
  $('overlayQualityForm').onsubmit=event=>apply(event,true);
  $('overlayVolume').oninput=()=>{quality.volume=Number($('overlayVolume').value);$('volume').value=String(quality.volume);applyVolume();};
  $('menuMute').onclick=()=>{
    muted=!muted;
    if(playback.remember){playback.lastMuted=muted;writePreference('parsec-playback',playback);}
    applyVolume();
    $('menuMute').textContent=muted?t("audio.unmute"):t("audio.mute");
    $('menuMute').setAttribute('aria-pressed',String(muted));
  };
  $('menuMute').textContent=muted?t('audio.unmute'):t('audio.mute');
  return {
    config:()=>streamConfig(quality),applyVolume,beginStream(){if(playback.startMuted)muted=true;else if(!playback.remember)muted=false;applyVolume();$('menuMute').textContent=muted?t('audio.unmute'):t('audio.mute');}
  };
}
