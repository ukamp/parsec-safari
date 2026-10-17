import { t } from '../core/i18n.js';
import { readPreference,writePreference } from '../core/preferences.js';
import {hapticPads,actuatorFor,vibrate} from '../browser/input-capabilities.js';
export const normalizePointer=value=>({
  mode:value?.mode==='touchpad'?'touchpad':'direct',
  sensitivity:Number.isFinite(value?.sensitivity)?Math.min(3,Math.max(.25,value.sensitivity)):1,
  rumble:value?.rumble===true,showCursor:value?.showCursor!==false
});
export function setupViewport({$,getClient,closeMenu=()=>{},openMenu=()=>{}}){
  let pointer=readPreference('parsec-pointer',{},normalizePointer),zoom=1,lockTimer=null,requesting=false,lastHaptics=null,lockGeneration=0;
  $('pointerMode').value=pointer.mode;$('pointerSensitivity').value=String(pointer.sensitivity);$('showTouchCursor').checked=pointer.showCursor;
  function renderPointer(point){
    const cursor=$('touchCursor'),video=$('video'),viewport=$('videoViewport');
    if(!point.visible){cursor.hidden=true;return;}
    const r=video.getBoundingClientRect?.(),area=viewport.getBoundingClientRect?.();
    if(!r||!area||!video.width||!video.height)return;
    const scale=Math.min(r.width/video.width,r.height/video.height);
    cursor.style.left=(r.left-area.left+(r.width-video.width*scale)/2+point.x*video.width*scale)+'px';
    cursor.style.top=(r.top-area.top+(r.height-video.height*scale)/2+point.y*video.height*scale)+'px';
    cursor.hidden=false;
  }
  function apply(){
    const input=getClient()?.input;if(!input)return;
    input.onPointer=point=>{if(getClient()?.input===input)renderPointer(point);};
    input.onHapticStatus=state=>{if(getClient()?.input===input)$('rumbleStatus').textContent=t('controller.rumble.'+state);};
    input.configurePointer({...pointer,rumble:pointer.rumble&&hapticPads().length>0});
  }
  function refreshCapabilities(){
    const available=hapticPads().length>0;
    $('allowRumble').disabled=!available;$('allowRumble').checked=available&&pointer.rumble;
    $('testRumble').disabled=!available;
    if(available!==lastHaptics){
      $('rumbleStatus').textContent=t(available?'controller.rumble.available':'controller.rumble.unavailable');
      $('rumbleTestStatus').textContent=t(available?'controller.rumble.testHelp':'controller.rumble.unavailable');lastHaptics=available;
    }
    const lock=typeof $('video').requestPointerLock==='function';
    $('pointerLock').disabled=!getClient()||!lock;
    if(!lock)$('pointerLockStatus').textContent=t('pointer.unavailable');
    else if(!$('pointerLockStatus').textContent)$('pointerLockStatus').textContent=t('pointer.available');
    $('pointerModeHelp').textContent=t(pointer.mode==='touchpad'?'pointer.touchpadHelp':'pointer.directHelp');
    apply();
  }
  for(const id of ['pointerMode','pointerSensitivity','allowRumble','showTouchCursor'])$(id).onchange=()=>{
    pointer=normalizePointer({mode:$('pointerMode').value,sensitivity:Number($('pointerSensitivity').value),rumble:$('allowRumble').disabled?pointer.rumble:$('allowRumble').checked,showCursor:$('showTouchCursor').checked});
    writePreference('parsec-pointer',pointer);refreshCapabilities();
  };
  function setZoom(value){zoom=Math.max(1,Math.min(3,Number(value)||1));$('streamZoom').value=String(zoom);render();}
  function render(){
    const limit=50*(zoom-1)/zoom;
    const x=Math.max(-limit,Math.min(limit,Number($('panX').value)||0)),y=Math.max(-limit,Math.min(limit,Number($('panY').value)||0));
    $('video').style.transform='scale('+zoom+') translate('+x+'%, '+y+'%)';
    $('zoomStatus').textContent=Math.round(zoom*100)+'%';getClient()?.input.renderPointer();
  }
  $('streamZoom').oninput=()=>setZoom($('streamZoom').value);$('panX').oninput=render;$('panY').oninput=render;
  $('resetZoom').onclick=()=>{$('panX').value='0';$('panY').value='0';setZoom(1);};
  function lockFailure(message){
    if(!requesting)return;requesting=false;clearTimeout(lockTimer);
    $('pointerLockStatus').textContent=t(message);openMenu();
  }
  $('pointerLock').onclick=async()=>{
    const canvas=$('video'),active=getClient();
    if(requesting)return;
    if(!active||typeof canvas.requestPointerLock!=='function'){$('pointerLockStatus').textContent=t('pointer.unavailable');return;}
    // Leave the input-pausing overlay before the direct, user-activated request.
    closeMenu();canvas.focus({preventScroll:true});requesting=true;const generation=++lockGeneration;
    try{
      await canvas.requestPointerLock();
      if(generation!==lockGeneration||getClient()!==active){if(document.pointerLockElement===canvas)document.exitPointerLock?.();return;}
      if(document.pointerLockElement===canvas){requesting=false;$('pointerLockStatus').textContent=t('pointer.locked');}
      else{$('pointerLockStatus').textContent=t('pointer.requested');lockTimer=setTimeout(()=>lockFailure('pointer.denied'),1500);lockTimer?.unref?.();}
    }catch{if(generation===lockGeneration)lockFailure('pointer.denied');}
  };
  document.addEventListener?.('pointerlockchange',()=>{
    const active=document.pointerLockElement===$('video');
    if(active){
      requesting=false;clearTimeout(lockTimer);
      if(!getClient()){document.exitPointerLock?.();return;}
      closeMenu();
    }
    getClient()?.input.release();getClient()?.input.renderPointer();
    $('pointerLockStatus').textContent=t(active?'pointer.locked':'pointer.unlocked');
  });
  document.addEventListener?.('pointerlockerror',()=>lockFailure('pointer.denied'));
  $('testRumble').onclick=async()=>{
    const pads=hapticPads();if(!pads.length){refreshCapabilities();return;}
    $('testRumble').disabled=true;
    try{const result=await vibrate(actuatorFor(pads[0]),.5,.5);$('rumbleTestStatus').textContent=t(result===false||result==='preempted'?'controller.rumble.failed':'controller.rumble.requested');}
    catch{$('rumbleTestStatus').textContent=t('controller.rumble.failed');}
    finally{$('testRumble').disabled=!hapticPads().length;}
  };
  window.addEventListener?.('gamepadconnected',refreshCapabilities);window.addEventListener?.('gamepaddisconnected',refreshCapabilities);
  function cleanup(){requesting=false;lockGeneration++;clearTimeout(lockTimer);$('touchCursor').hidden=true;if(document.pointerLockElement===$('video'))document.exitPointerLock?.();}
  window.addEventListener?.('pagehide',cleanup);
  refreshCapabilities();
  return {cleanup,apply,refreshCapabilities,setZoom,getZoom:()=>zoom};
}
