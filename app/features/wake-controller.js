import { t } from '../core/i18n.js';
import { ScreenAwake } from '../browser/wake-lock.js';
export function setupWake({
  getClient,$,diagnostic
}){
  let wakeController=null,wakeTestTimer=null;
  function setWakeActive(active){
    if(active&&!wakeController)wakeController=new ScreenAwake({
      status:state=>{
        const text={
          active:t('Wachhalten aktiv – der Bildschirm bleibt während des sichtbaren Streams an.'),inactive:t('Wachhalten beendet.'),waiting:t('Wachhalten pausiert, solange die Seite nicht sichtbar ist.'),released:t('Safari hat das Wachhalten freigegeben. Mit „Wachhalten prüfen“ erneut versuchen.'),denied:t('Safari hat das Wachhalten nicht gewährt.'),unavailable:t('Dieser Browser bietet keine Screen-Wake-Lock-API.')
        }[state];
        $('wakeStatus').textContent=text;
        $('wakeBadge').textContent=state==='active'?t('Bildschirm bleibt an'):t('Wachhalten: ')+({
          inactive:t('aus'),waiting:t('pausiert'),released:t('freigegeben'),denied:t('abgelehnt'),unavailable:t('nicht verfügbar')
        }[state]||state);
        diagnostic('wake-lock-'+state);
      }
    });
    return wakeController?.setActive(active);
  }
  $('checkWake').onclick=()=>{
    clearTimeout(wakeTestTimer);
    setWakeActive(true);
    if(!getClient()?.videoPlayer.decoded)wakeTestTimer=setTimeout(()=>{
      if(!getClient()?.videoPlayer.decoded)setWakeActive(false);
    },3000);
  };
  return {
    setActive:setWakeActive,stop(){
      clearTimeout(wakeTestTimer);
      setWakeActive(false);
    }
  };
}
