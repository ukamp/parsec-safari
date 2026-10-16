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
          active:t("text.wakeLockActiveTheScreenStaysOnWhileThe"),inactive:t("text.wakeLockEnded"),waiting:t("text.wakeLockIsPausedWhileThePageIsHidden"),released:t("text.safariReleasedTheWakeLockUseTestScreenWake"),denied:t("text.safariDidNotGrantAWakeLock"),unavailable:t("text.thisBrowserDoesNotSupportTheScreenWakeLock")
        }[state];
        $('wakeStatus').textContent=text;
        $('wakeBadge').textContent=state==='active'?t("text.screenStaysOn"):t("text.wakeLock")+({
          inactive:t("text.off2"),waiting:t("text.paused"),released:t("text.released"),denied:t("text.denied"),unavailable:t("text.unavailable")
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
