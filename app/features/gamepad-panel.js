import { defaultBindings,normalizeBindings,padLabels } from '../stream/pad-bindings.js';
import { GamepadManager } from '../stream/gamepad.js';
import { readPreference } from '../core/preferences.js';
export function setupGamepads({
  getClient,$,diagnostic
}){
  let padSettings=readPreference('parsec-pad-bindings-v1',defaultBindings(),normalizeBindings),menuOpen=false,bindingsReady=false,controllerMonitor=null,lastPadCounts='';
  function showGamepad(status){
    $('gamepadStatus').textContent=!status.gamepads?'Kein Controller erkannt. Am iPad koppeln und eine Controller-Taste drücken.':!status.standardGamepads?'Controller erkannt, aber ohne Standardbelegung. Eine passende Zuordnung ist noch erforderlich.':status.paused?'Controller-Eingaben pausiert.':status.standardGamepads+' Standard-Gamepad(s) erkannt · '+status.activeInputs+' aktive Eingaben.'+((status.pressedButtons||[]).length?' Tasten: '+status.pressedButtons.map(i=>padLabels[i]+' → '+(padLabels[padSettings.buttons[i]]||'Aus')).join(', '):'');
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
      $('checkGamepad').textContent='Controller lokal prüfen';
      return;
    }
    controllerMonitor=new GamepadManager(()=>{
    },()=>{
    },()=>{
    },showGamepad);
    $('checkGamepad').textContent='Controllerprüfung beenden';
  };
  window.addEventListener('pagehide',()=>controllerMonitor?.destroy());
  function setMenu(open){
    menuOpen=open;
    $('streamMenu').hidden=!open;
    $('streamMenu').inert=!open;
    $('streamMenuButton').setAttribute?.('aria-expanded',String(open));
    getClient()?.input.setPaused(open||window.location.hash!=='#stream');
    if(open){
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
      $('bindingStatus').textContent='Controllerbelegung auf diesem Gerät gespeichert.';
    }catch{
      $('bindingStatus').textContent='Controllerbelegung nur für diesen Tab aktiv.';
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
        option.textContent=target===-1?'Nicht übertragen':padLabels[target];
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
