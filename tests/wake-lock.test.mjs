import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const {ScreenAwake} = await import(asset('browser/wake-lock.js'));
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function fixture(provider){const callbacks={},states=[];const doc={hidden:false,addEventListener:(name,fn)=>callbacks[name]=fn};const wake=new ScreenAwake({provider,doc,status:s=>states.push(s)});return {wake,doc,callbacks,states};}
function sentinel(){let callback;return {released:false,addEventListener(name,fn){callback=fn;},async release(){this.released=true;callback?.();}};}
let requested=0;const locks=[];const f=fixture({request:async type=>{assert.equal(type,'screen');requested++;const lock=sentinel();locks.push(lock);return lock;}});
await Promise.all([f.wake.setActive(true),f.wake.setActive(true)]);assert.equal(requested,1);assert.equal(f.states.at(-1),'active');
f.doc.hidden=true;f.callbacks.visibilitychange();assert.equal(locks[0].released,true);f.doc.hidden=false;f.callbacks.visibilitychange();await tick();assert.equal(requested,2);await f.wake.setActive(false);assert.equal(locks[1].released,true);
const denied=fixture({request(){throw Error('denied');}});await denied.wake.setActive(true);assert.equal(denied.states.at(-1),'denied');await denied.wake.setActive(true);assert.equal(denied.states.at(-1),'denied');assert.equal(denied.wake.pending,null);
let resolve;const pending=fixture({request:()=>new Promise(r=>resolve=r)});const activation=pending.wake.setActive(true);await tick();await pending.wake.setActive(false);const late=sentinel();resolve(late);await activation;assert.equal(late.released,true);assert.equal(pending.wake.lock,null);
const missing=fixture({});await missing.wake.setActive(true);assert.equal(missing.states.at(-1),'unavailable');
console.log('Wake lock acquisition, duplicate suppression, visibility reacquisition, denial, release and late-grant cleanup passed.');
