import { t } from '../core/i18n.js';
import * as Msg from './msg.js';
// Browser standard layout -> Parsec opcode 4's button indices (not XInput bit flags).
export const padLabels=['A','B','X','Y','LB','RB','LT','RT',t('Ansicht / Back'),t('Menü / Start'),t('Linker Stickdruck'),t('Rechter Stickdruck'),t('Steuerkreuz ↑'),t('Steuerkreuz ↓'),t('Steuerkreuz ←'),t('Steuerkreuz →'),'Xbox / Guide'];
const wireButtons=[0,1,2,3,9,10,null,null,4,6,7,8,11,12,13,14,5];
export const defaultBindings=()=>({
  buttons:padLabels.map((_,i)=>i),invertLeftY:false,invertRightY:false
});
export function normalizeBindings(value){
  const defaults=defaultBindings();
  if(!value||typeof value!=='object')return defaults;
  const used=new Set();
  if(Array.isArray(value.buttons)&&value.buttons.length===17&&value.buttons.every(x=>Number.isInteger(x)&&x>=-1&&x<17&&(x===-1||!used.has(x)&&used.add(x))))defaults.buttons=[...value.buttons];
  defaults.invertLeftY=value.invertLeftY===true;
  defaults.invertRightY=value.invertRightY===true;
  return defaults;
}
export class PadBindings {
  constructor(send,settings=defaultBindings()){
    this.send=send;
    this.settings=normalizeBindings(settings);
  }
  button(pad,source,value){
    const target=this.settings.buttons[source];
    if(target===undefined||target===-1)return;
    if(target===6||target===7)this.send(Msg.axis(target-2,Math.round(Math.max(0,Math.min(1,value))*32767),pad));
    else this.send(Msg.button(wireButtons[target],value>=.5?1:0,pad));
  }
  axis(pad,axis,value){
    if(axis<0||axis>3)return;
    // The existing host path uses opposite vertical conventions for the
    // left and right sticks. Keep right-stick up negative by default.
    let signed=axis===1?-value:value;
    if(axis===1&&this.settings.invertLeftY||axis===3&&this.settings.invertRightY)signed=-signed;
    this.send(Msg.axis(axis,Math.round(signed*(signed<0?32768:32767)),pad));
  }
}
