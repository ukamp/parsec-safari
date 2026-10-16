import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const {FullscreenView} = await import(asset('browser/fullscreen.js'));
function fixture(kind='native'){
 const callbacks={},classes=new Set(),reports=[],scroll=[];
 const doc={body:{style:{overflow:'auto'}},addEventListener:(name,fn)=>callbacks[name]=fn,fullscreenElement:null};
 const screen={classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}};
 if(kind==='native')screen.requestFullscreen=async options=>{assert.equal(options.navigationUI,'hide');doc.fullscreenElement=screen;callbacks.fullscreenchange();};
 if(kind==='denied')screen.requestFullscreen=async()=>{throw Error('denied');};
 doc.exitFullscreen=async()=>{doc.fullscreenElement=null;callbacks.fullscreenchange();};
 const button={hidden:true},notice={hidden:true},canvas={focus(){}},win={scrollX:0,scrollY:230,scrollTo:(...v)=>scroll.push(v)};
 const view=new FullscreenView({screen,canvas,exitButton:button,notice,doc,win,report:s=>reports.push(s)});
 return {view,screen,doc,button,notice,classes,reports,callbacks,scroll};
}
const native=fixture();await native.view.enter();assert.equal(native.doc.fullscreenElement,native.screen);assert.ok(native.classes.has('screen-expanded'));assert.equal(native.button.hidden,false);await native.view.exit();assert.equal(native.classes.size,0);assert.equal(native.doc.body.style.overflow,'auto');assert.deepEqual(native.scroll.at(-1),[0,230]);
for(const kind of ['none','denied']){const f=fixture(kind);await f.view.enter();assert.equal(f.notice.hidden,false);assert.ok(f.reports.includes('fullscreen-viewport'));f.callbacks.keydown({key:'Escape'});assert.equal(f.classes.size,0);}
const escape=fixture();await escape.view.enter();escape.doc.fullscreenElement=null;escape.callbacks.fullscreenchange();assert.equal(escape.classes.size,0);
const race=fixture('none');let finish;race.screen.requestFullscreen=()=>new Promise(resolve=>finish=()=>{race.doc.fullscreenElement=race.screen;race.callbacks.fullscreenchange();resolve();});const pending=race.view.enter();await race.view.exit();finish();await pending;assert.equal(race.doc.fullscreenElement,null);assert.equal(race.classes.size,0);
console.log('Fullscreen native, viewport fallback, Escape, scroll restoration and pending-request cancellation passed.');
