import {setupMenuNavigation} from './navigation.js';
import { t } from '../core/i18n.js';
import { defaultBindings,normalizeBindings,padLabels } from '../stream/pad-bindings.js';
import { GamepadManager } from '../stream/gamepad.js';
import { readPreference } from '../core/preferences.js';
export function setupGamepads({
  getClient,$,diagnostic
}){
  const menuNavigation=setupMenuNavigation($);
  let padSettings=readPreference('parsec-pad-bindings-v1',defaultBindings(),normalizeBindings),menuOpen=false,bindingsReady=false,controllerMonitor=null,lastPadCounts='';
  function showGamepad(status){
    $('gamepadStatus').textContent=!status.gamepads?t("text.noControllerDetectedPairItWithYourIPadAnd"):!status.standardGamepads?t("text.controllerDetectedWithoutStandardMappingACompatibleMappingIs"):status.paused?t("text.controllerInputPaused"):status.standardGamepads+t("text.standardGamepadSDetected")+status.activeInputs+t("text.activeInputs")+((status.pressedButtons||[]).length?t("text.buttons")+status.pressedButtons.map(i=>padLabels[i]+' → '+(padLabels[padSettings.buttons[i]]||t("text.off"))).join(', '):'');
    const key=status.gamepads+':'+status.standardGamepads;
    if(key!==lastPadCounts){
      lastPadCounts=key;
      diagnostic('gamepad-detected',{
        gamepads:status.gamepads,standardGamepads:status.standardGamepads
      });
    }
  }
  $('checkGamepad').onclick=()=>{
    if(controllerMonitor){
      controllerMonitor.destroy();
      controllerMonitor=null;
      $('checkGamepad').textContent=t("text.testControllerLocally");
      return;
    }
    controllerMonitor=new GamepadManager(()=>{
    },()=>{
    },()=>{
    },showGamepad);
    $('checkGamepad').textContent=t("text.stopControllerTest");
  };
  window.addEventListener('pagehide',()=>controllerMonitor?.destroy());
  function setMenu(open){
    menuOpen=open;
    $('streamMenu').hidden=!open;
    $('streamMenu').inert=!open;
    $('streamMenuButton').setAttribute?.('aria-expanded',String(open));
    getClient()?.input.setPaused(open||window.location.hash!=='#stream');
    if(open){
      menuNavigation.reset();
      ensureBindings();
      $('closeMenu').focus();
    }else $('video').focus({
      preventScroll:true
    });
  }
  $('streamMenuButton').onclick=()=>setMenu(!menuOpen);
  $('closeMenu').onclick=()=>setMenu(false);
  $('menuFullscreen').onclick=()=>{
    setMenu(false);
    $('fullscreen').onclick();
  };
  $('streamMenu').addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      event.preventDefault();
      event.stopPropagation();
      setMenu(false);
    }
  });
  function saveBindings(){
    getClient()?.input.setBindings(padSettings);
    try{
      localStorage.setItem('parsec-pad-bindings-v1',JSON.stringify(padSettings));
      $('bindingStatus').textContent=t("text.controllerMappingSavedOnThisDevice");
    }catch{
      $('bindingStatus').textContent=t("text.controllerMappingActiveOnlyInThisTab");
    }
  }
  function refreshBindings(){
    for(let i=0;
    i<17;
    i++)$('padBinding'+i).value=String(padSettings.buttons[i]);
    $('invertLeftY').checked=padSettings.invertLeftY;
    $('invertRightY').checked=padSettings.invertRightY;
  }
  function ensureBindings(){
    if(bindingsReady)return;
    bindingsReady=true;
    for(let i=0;
    i<17;
    i++){
      const label=document.createElement('label');
      label.textContent=padLabels[i];
      const select=document.createElement('select');
      select.id='padBinding'+i;
      for(let target=-1;
      target<17;
      target++){
        const option=document.createElement('option');
        option.value=String(target);
        option.textContent=target===-1?t("text.doNotForward"):padLabels[target];
        select.appendChild(option);
      }
      select.onchange=()=>{
        const target=Number(select.value),old=padSettings.buttons[i],other=target===-1?-1:padSettings.buttons.indexOf(target);
        if(other!==-1&&other!==i)padSettings.buttons[other]=old;
        padSettings.buttons[i]=target;
        saveBindings();
        refreshBindings();
      };
      label.appendChild(select);
      $('bindingRows').appendChild(label);
    }
    refreshBindings();
  }
  for(const id of ['invertLeftY','invertRightY'])$(id).onchange=()=>{
    padSettings[id]=$(id).checked;
    saveBindings();
  };
  $('resetBindings').onclick=()=>{
    padSettings=defaultBindings();
    saveBindings();
    refreshBindings();
  };
  return {
    settings:()=>padSettings,isMenuOpen:()=>menuOpen,close:()=>setMenu(false),show:showGamepad
  };
}
