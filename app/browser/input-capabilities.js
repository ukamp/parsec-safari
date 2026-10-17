// Capability presence is not proof that hardware or a host event works.
export function actuatorFor(pad){
  const actuator=pad?.vibrationActuator||pad?.hapticActuators?.[0];
  if(typeof actuator?.playEffect==='function'&&(!actuator.effects||Array.from(actuator.effects).includes('dual-rumble')))return actuator;
  return typeof actuator?.pulse==='function'?actuator:null;
}
export function hapticPads(nav=globalThis.navigator){
  try{return Array.from(nav?.getGamepads?.()||[]).filter(pad=>pad?.connected!==false&&actuatorFor(pad));}catch{return [];}
}
export function vibrate(actuator,strong,weak){
  if(typeof actuator?.playEffect==='function'&&(!actuator.effects||Array.from(actuator.effects).includes('dual-rumble'))){
    return Promise.resolve(actuator.playEffect('dual-rumble',{duration:120,startDelay:0,strongMagnitude:strong,weakMagnitude:weak}));
  }
  if(typeof actuator?.pulse==='function')return Promise.resolve(actuator.pulse(Math.max(strong,weak),120));
  return Promise.reject(Error('unsupported'));
}
