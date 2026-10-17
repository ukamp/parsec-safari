import { t } from '../core/i18n.js';
export function setupBrowserCapabilities({$,getClient}){
  let capture=null;
  function cleanup(){
    for(const track of capture?.getTracks()||[])track.stop();capture=null;
    $('pipVideo').srcObject=null;$('pipVideo').hidden=true;
  }
  $('pip').onclick=async()=>{
    const video=$('pipVideo'),canvas=$('video');
    if(!getClient()||!canvas.captureStream){$('pipStatus').textContent=t('pip.unavailable');return;}
    if(!video.requestPictureInPicture&&!video.webkitSetPresentationMode){$('pipStatus').textContent=t('pip.unavailable');return;}
    try{
      if(!capture){capture=canvas.captureStream(30);video.srcObject=capture;video.muted=true;video.hidden=false;await video.play();}
      if(video.requestPictureInPicture)await video.requestPictureInPicture();
      else if(video.webkitSupportsPresentationMode?.('picture-in-picture'))video.webkitSetPresentationMode('picture-in-picture');
      else throw Error('unsupported');
      $('pipStatus').textContent=t('pip.active');
    }catch{$('pipStatus').textContent=t('pip.denied');}
  };
  $('pipVideo').addEventListener('leavepictureinpicture',cleanup);
  $('pipVideo').addEventListener('webkitpresentationmodechanged',()=>{if($('pipVideo').webkitPresentationMode!=='picture-in-picture')cleanup();});
  $('capabilityCheck').onclick=async()=>{
    const lines=[t('capabilities.protocolLimits')];
    if(window.VideoDecoder?.isConfigSupported){
      try{const r=await VideoDecoder.isConfigSupported({codec:'hvc1.1.6.L93.B0',codedWidth:1280,codedHeight:720});lines.push(t('capabilities.hevcDecoder')+': '+(r.supported?t('common.yes'):t('common.no')));}catch{lines.push(t('capabilities.hevcDecoder')+': '+t('common.no'));}
    }
    lines.push(t('pointer.lock')+': '+(typeof $('video').requestPointerLock==='function'?t('common.yes'):t('common.no')));
    let haptics=false;try{haptics=[...(navigator.getGamepads?.()||[])].some(p=>p?.vibrationActuator||p?.hapticActuators?.length);}catch{}
    lines.push(t('capabilities.localHaptics')+': '+(haptics?t('common.yes'):t('common.no')));
    $('capabilityStatus').textContent=lines.join('\n');
  };
  return {cleanup};
}
