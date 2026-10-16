import { defaults,normalizeQuality,readPreference,writePreference,streamConfig } from '../core/preferences.js';
export function setupQuality({
  getClient,$
}){
  let quality=readPreference('parsec-quality-v1',defaults(),normalizeQuality),muted=false;
  const fill=()=>{
    for(const id of ['bitrate','frameRate','resolution','volume'])$(id).value=String(quality[id]);
  };
  fill();
  $('qualityPreset').onchange=()=>{
    const presets={
      balanced:defaults(),economy:{
        ...defaults(),bitrate:4,frameRate:30
      },quality:{
        ...defaults(),bitrate:20,resolution:'1920x1080'
      }
    };
    if(presets[$('qualityPreset').value]){
      quality={
        ...presets[$('qualityPreset').value],volume:quality.volume
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
      bitrate:Number($('bitrate').value),frameRate:Number($('frameRate').value),resolution:$('resolution').value,volume:Number($('volume').value)
    });
    fill();
    const saved=writePreference('parsec-quality-v1',quality),client=getClient();
    applyVolume();
    const applied=client?.updateQuality(streamConfig(quality));
    $('qualityStatus').textContent=(saved?'Auf diesem Gerät gespeichert. ':'Nur in diesem Tab aktiv. ')+(client?(applied?'Bitrate und Bildrate angefordert. Neue Auflösung gilt beim nächsten Verbinden.':'Stream noch nicht bereit; die Werte gelten beim nächsten Verbinden.'):'Gilt beim nächsten Verbinden.');
  };
  $('menuMute').onclick=()=>{
    muted=!muted;
    applyVolume();
    $('menuMute').textContent=muted?'Ton einschalten':'Stummschalten';
    $('menuMute').setAttribute('aria-pressed',String(muted));
  };
  return {
    config:()=>streamConfig(quality),applyVolume
  };
}
