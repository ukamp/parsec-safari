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
    $('qualityPreset').value=Object.entries(presets).find(([,preset])=>['bitrate','frameRate','resolution'].every(key=>preset[key]===quality[key]))?.[0]||'custom';
    for(const id of ['bitrate','frameRate','resolution','volume'])$(id).value=String(quality[id]);
  };
  fill();
  $('qualityPreset').onchange=()=>{
    if(presets[$('qualityPreset').value]){
      quality={
        ...presets[$('qualityPreset').value],volume:quality.volume,constantFps:quality.constantFps
      };
      fill();
    }
  };
  const applyVolume=()=>getClient()?.audioPlayer.setVolume(muted?0:quality.volume/100);
  $('volume').oninput=()=>{
    quality.volume=Number($('volume').value);
    applyVolume();
  };
  $('qualityForm').onsubmit=event=>{
    event.preventDefault();
    quality=normalizeQuality({
      bitrate:Number($('bitrate').value),frameRate:Number($('frameRate').value),resolution:$('resolution').value,volume:Number($('volume').value),constantFps:$('constantFps').checked
    });
    fill();
    const saved=playback.remember&&writePreference('parsec-quality-v1',quality),client=getClient();
    applyVolume();
    const applied=client?.updateQuality(streamConfig(quality));
    $('qualityStatus').textContent=(saved?t("text.savedOnThisDevice"):t("text.activeOnlyInThisTab"))+(client?(applied?t("text.bitrateAndFrameRateRequestedNewResolutionAppliesOn"):t("text.streamNotReadyYetTheseSettingsApplyOnThe")):t("text.appliesOnTheNextConnection"));
  };
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
