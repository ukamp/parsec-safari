import { ScreenAwake } from '../browser/wake-lock.js';
export function setupWake({
  getClient,$,diagnostic
}){
  let wakeController=null,wakeTestTimer=null;
  function setWakeActive(active){
    if(active&&!wakeController)wakeController=new ScreenAwake({
      status:state=>{
        const text={
          active:'Wachhalten aktiv – der Bildschirm bleibt während des sichtbaren Streams an.',inactive:'Wachhalten beendet.',waiting:'Wachhalten pausiert, solange die Seite nicht sichtbar ist.',released:'Safari hat das Wachhalten freigegeben. Mit „Wachhalten prüfen“ erneut versuchen.',denied:'Safari hat das Wachhalten nicht gewährt.',unavailable:'Dieser Browser bietet keine Screen-Wake-Lock-API.'
        }[state];
        $('wakeStatus').textContent=text;
        $('wakeBadge').textContent=state==='active'?'Bildschirm bleibt an':'Wachhalten: '+({
          inactive:'aus',waiting:'pausiert',released:'freigegeben',denied:'abgelehnt',unavailable:'nicht verfügbar'
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
