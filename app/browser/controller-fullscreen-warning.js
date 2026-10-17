// Only native fullscreen is affected; the CSS controller view is separate.
export function showControllerFullscreenWarning(element,connected){
  if(connected===undefined){try{connected=Array.from(navigator.getGamepads?.()||[]).some(p=>p&&p.connected!==false);}catch{connected=false;}}
  element.hidden=!(connected&&(document.fullscreenElement||document.webkitFullscreenElement));
}
