import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const {PadBindings,defaultBindings,normalizeBindings} = await import(asset('stream/pad-bindings.js'));
const sent=[];const binding=new PadBindings(b=>{const v=new DataView(b);sent.push([v.getUint8(12),v.getInt32(0),v.getInt32(4),v.getInt32(8)]);});
const expected=[0,1,2,3,9,10,null,null,4,6,7,8,11,12,13,14,5];
for(let i=0;i<17;i++){binding.button(2,i,1);assert.deepEqual(sent.at(-1),i===6||i===7?[5,i-2,32767,2]:[4,expected[i],1,2]);binding.button(2,i,0);assert.equal(sent.at(-1)[2],0);}
for(const [axis,value,result] of [[0,-1,-32768],[0,1,32767],[1,-1,32767],[1,1,-32768],[2,1,32767],[3,-1,-32768],[3,1,32767]]){binding.axis(1,axis,value);assert.deepEqual(sent.at(-1),[5,axis,result,1]);}
const custom=defaultBindings();[custom.buttons[0],custom.buttons[1]]=[1,0];custom.invertRightY=true;binding.settings=normalizeBindings(custom);binding.button(0,0,1);assert.deepEqual(sent.at(-1),[4,1,1,0]);binding.axis(0,3,-1);assert.equal(sent.at(-1)[2],32767);
custom.buttons[0]=-1;binding.settings=normalizeBindings(custom);const before=sent.length;binding.button(0,0,1);assert.equal(sent.length,before);
assert.deepEqual(normalizeBindings({buttons:Array(17).fill(0)}).buttons,defaultBindings().buttons);
console.log('All Xbox button wire indices, Guide, trigger range, stick signs, custom remapping, disabled buttons and invalid stored preferences passed.');
