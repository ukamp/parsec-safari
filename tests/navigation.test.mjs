import assert from 'node:assert/strict';
import {asset} from './helpers.mjs';
const {setupMenuNavigation,setupDiagnosticTabs}=await import(asset('features/navigation.js'));
const element=()=>({hidden:false,attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this.listeners[k]=fn},focus(){this.focused=true}});
const panels=['picture','input','audio','statistics'].map(name=>({...element(),dataset:{menuPanel:name}}));
const buttons=panels.map(p=>({...element(),dataset:{menuTarget:p.dataset.menuPanel}}));
const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
globalThis.document={querySelectorAll:selector=>selector==='[data-menu-panel]'?panels:buttons};
const menu=setupMenuNavigation($);menu.reset();assert.deepEqual(panels.filter(p=>!p.hidden).map(p=>p.dataset.menuPanel),['picture']);
assert.equal(buttons[0].attrs['aria-selected'],'true');assert.equal(buttons[1].tabIndex,-1);
buttons[1].onclick();assert.equal(panels[1].hidden,false);assert.equal(panels[0].hidden,true);
menu.reset();assert.equal(panels[1].hidden,false); // Preserve the selected tab on reopening.
buttons[1].listeners.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(panels[2].hidden,false);assert.equal(buttons[2].focused,true);
buttons[2].listeners.keydown({key:'End',preventDefault(){}});assert.equal(panels[3].hidden,false);
buttons[3].listeners.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(panels[0].hidden,false);
setupDiagnosticTabs($);assert.equal($('diagnosticsTests').hidden,true);$('diagnosticsTestsTab').onclick();assert.equal($('diagnosticsTests').hidden,false);assert.equal($('diagnosticsOverview').hidden,true);assert.equal($('diagnosticsTestsTab').attrs['aria-selected'],'true');
$('diagnosticsTestsTab').listeners.keydown({key:'ArrowLeft',preventDefault(){}});assert.equal($('diagnosticsOverview').hidden,false);assert.equal($('diagnosticsOverviewTab').focused,true);
console.log('Overlay tab selection/persistence/keyboard focus and keyboard-accessible diagnostic tabs passed.');
