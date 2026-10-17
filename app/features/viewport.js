import { t } from '../core/i18n.js';
import { readPreference,writePreference } from '../core/preferences.js';
export const normalizePointer=value=>({
  mode:value?.mode==='touchpad'?'touchpad':'direct',
  sensitivity:Number.isFinite(value?.sensitivity)?Math.min(3,Math.max(.25,value.sensitivity)):1,
  rumble:value?.rumble===true
});
export function setupViewport({$,getClient}){
  let pointer=readPreference('parsec-pointer',{},normalizePointer),zoom=1;
  $('pointerMode').value=pointer.mode;$('pointerSensitivity').value=String(pointer.sensitivity);$('allowRumble').checked=pointer.rumble;
  const apply=()=>{getClient()?.input.configurePointer(pointer);};
  for(const id of ['pointerMode','pointerSensitivity','allowRumble'])$(id).onchange=()=>{
    pointer=normalizePointer({mode:$('pointerMode').value,sensitivity:Number($('pointerSensitivity').value),rumble:$('allowRumble').checked});
    writePreference('parsec-pointer',pointer);apply();
  };
  function setZoom(value){zoom=Math.max(1,Math.min(3,Number(value)||1));$('streamZoom').value=String(zoom);render();}
  function render(){
    const limit=50*(zoom-1)/zoom;
    const x=Math.max(-limit,Math.min(limit,Number($('panX').value)||0)),y=Math.max(-limit,Math.min(limit,Number($('panY').value)||0));
    $('video').style.transform='scale('+zoom+') translate('+x+'%, '+y+'%)';
    $('zoomStatus').textContent=Math.round(zoom*100)+'%';
  }
  $('streamZoom').oninput=()=>setZoom($('streamZoom').value);
  $('panX').oninput=render;$('panY').oninput=render;
  $('resetZoom').onclick=()=>{$('panX').value='0';$('panY').value='0';setZoom(1);};
  $('pointerLock').onclick=async()=>{
    const canvas=$('video'),active=getClient();
    if(!active||typeof canvas.requestPointerLock!=='function'){$('pointerLockStatus').textContent=t('pointer.unavailable');return;}
    // This must remain a direct user action; no automatic permission requests.
    try{await canvas.requestPointerLock();$('pointerLockStatus').textContent=document.pointerLockElement===canvas?t('pointer.locked'):t('pointer.requested');}catch{$('pointerLockStatus').textContent=t('pointer.denied');}
  };
  document.addEventListener?.('pointerlockchange',()=>{
    getClient()?.input.release();
    $('pointerLockStatus').textContent=document.pointerLockElement===$('video')?t('pointer.locked'):t('pointer.unlocked');
  });
  return {apply,setZoom,getZoom:()=>zoom};
}
