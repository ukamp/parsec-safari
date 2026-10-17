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

const controller=fixture();let nativeRequests=0;controller.screen.requestFullscreen=async()=>{nativeRequests++};await controller.view.enter({native:false});assert.equal(nativeRequests,0);assert.equal(controller.doc.fullscreenElement,null);assert.ok(controller.classes.has('screen-expanded'));assert.ok(controller.reports.includes('fullscreen-controller'));await controller.view.exit();assert.equal(controller.classes.size,0);
console.log('Explicit controller viewport mode skips the native fullscreen API and restores its layout on exit.');

const isolated=fixture('none');
const sibling={inert:false},alreadyInert={inert:true},sidebar={inert:false};
const section={children:[isolated.screen,sibling,alreadyInert]};
const main={children:[section]},body=isolated.doc.body;
body.children=[main,sidebar];section.parentElement=main;main.parentElement=body;isolated.screen.parentElement=section;
await isolated.view.enter({native:false});
assert.equal(sibling.inert,true);assert.equal(sidebar.inert,true);assert.equal(alreadyInert.inert,true);
await isolated.view.exit();
assert.equal(sibling.inert,false);assert.equal(sidebar.inert,false);assert.equal(alreadyInert.inert,true);
console.log('Expanded view makes covered controls inert and restores their original state on exit.');

// Safari's prefixed exit returns immediately; its event arrives later.
const delayed=fixture('none');
delayed.screen.webkitRequestFullscreen=()=>{delayed.doc.webkitFullscreenElement=delayed.screen;delayed.callbacks.webkitfullscreenchange();};
delete delayed.doc.exitFullscreen;
let finishExit;
delayed.doc.webkitExitFullscreen=()=>{finishExit=()=>{delayed.doc.webkitFullscreenElement=null;delayed.callbacks.webkitfullscreenchange();};};
await delayed.view.enter();
const switching=delayed.view.controller();
assert.equal(delayed.view.mode,'switching');
assert.equal(delayed.classes.has('screen-expanded'),true);
finishExit();await switching;
assert.equal(delayed.view.mode,'controller');
assert.equal(delayed.classes.has('screen-expanded'),true);
assert.equal(delayed.doc.body.style.overflow,'hidden');
delayed.callbacks.webkitfullscreenchange();delayed.callbacks.fullscreenchange();
assert.equal(delayed.view.expanded,true);
assert.equal(delayed.view.mode,'controller');
await delayed.view.exit();
assert.equal(delayed.doc.body.style.overflow,'auto');
console.log('Delayed Safari exit and duplicate fullscreen events preserve controller view without rebuilding its surface.');

const explicit=fixture();await explicit.view.controller();assert.equal(explicit.view.mode,'controller');
await explicit.view.browser();assert.equal(explicit.doc.fullscreenElement,explicit.screen);assert.equal(explicit.view.mode,'native');
await explicit.view.controller();assert.equal(explicit.doc.fullscreenElement,null);assert.equal(explicit.view.mode,'controller');await explicit.view.exit();
const refused=fixture('denied');await refused.view.controller();await refused.view.browser();assert.equal(refused.view.mode,'viewport');assert.ok(refused.reports.includes('fullscreen-viewport'));await refused.view.exit();
console.log('Explicit native fullscreen replaces controller view; denied requests report viewport fallback.');
