import assert from 'node:assert/strict';
import {asset} from './helpers.mjs';
const {AccountView,avatarUrl}=await import(asset('features/account.js'));
assert.equal(avatarUrl('123'),null);assert.equal(avatarUrl(-1),null);assert.match(avatarUrl(123),/avatars\/123\/avatar$/);
const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,{textContent:'',hidden:false});return elements.get(id);};
let session='synthetic-token',calls=[];
const view=new AccountView({$,getSession:()=>session,request:async(path,options)=>{calls.push(path);assert.equal(options.headers.Authorization,'Bearer synthetic-token');return {status:200,data:path==='/me'?{name:'<script>Owner</script>',id:42}:[{user_name:'Friend A'}]};}});
await view.load();assert.deepEqual(calls.sort(),['/friendships','/me']);assert.equal($('accountInfo').textContent,'<script>Owner</script> #42');assert.equal($('friends').textContent,'Friend A');
const deferred=[];view.request=()=>new Promise(r=>deferred.push(r));const pending=view.load();session=null;view.clear();for(const resolve of deferred)resolve({status:200,data:[]});await pending;
assert.equal($('accountPanel').hidden,true);assert.equal($('accountInfo').textContent,'');assert.equal($('friends').textContent,'');
const {HostList}=await import(asset('features/host-list.js'));
function element(){const e={children:[],value:'',addEventListener(){},setAttribute(){},append(...children){this.children.push(...children)},appendChild(child){this.children.push(child)}};let text='';Object.defineProperty(e,'textContent',{get:()=>text,set:v=>{text=v;e.children=[]}});return e;}
const container=element(),search=element();let connected=0;
const hosts=new HostList(container,search,()=>connected++,{createElement:element});
hosts.set([null,{peer_id:'offline',name:'Offline',online:false,description:'<img>',build:'1.2',user:{name:'Owner',id:12}},{peer_id:'unknown',name:'Unknown',online:'true'}]);
assert.equal(hosts.hosts.length,2);
const offline=container.children.find(c=>c.children[0].textContent==='Offline');assert.equal(offline.children[2].disabled,true);offline.children[2].onclick();assert.equal(connected,0);assert.match(offline.children[3].textContent,/<img>/);
const unknown=container.children.find(c=>c.children[0].textContent==='Unknown');assert.equal(unknown.children[2].disabled,false);unknown.children[2].onclick();assert.equal(connected,1);
console.log('Read-only profile/friends, stale session protection, optional host metadata and offline gating passed.');
