import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';

const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, { id, value: '', textContent: '', children: [], disabled: false, hidden: false, appendChild(child) { this.children.push(child); }, addEventListener() {}, setAttribute() {}, removeAttribute() {}, focus() {}, click() {} });
  return elements.get(id);
}
globalThis.document = { querySelectorAll(){return []}, currentScript: null, documentElement:{lang:'de'},addEventListener(){}, getElementById: element, createElement: tag => ({ tag, click() {},setAttribute(){},addEventListener(){}, appendChild() {} }) };
globalThis.window = {location:{hash:''}, addEventListener() {} };
let mode = 'rejected';
globalThis.fetch = async (url, options) => {
  if (mode === 'cancel') return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  if (url.endsWith('/v1/auth')) return { status: mode === 'rejected' ? 403 : mode === 'success201' || mode === 'malformed201' ? 201 : 200, json: async () => (mode === 'success201' ? {session_id:'synthetic-private-session'} : {data: mode === 'malformed201' ? {} : {id:'synthetic-private-session'}}) };
  return { status: 200, json: async () => ({ data: [] }) };
};
await import(asset('application.js'));
const submit = () => element('auth').onsubmit({ preventDefault() {} });
const fill = () => { element('email').value = 'person@example.invalid'; element('password').value = 'synthetic-private-password'; element('tfa').value = '654321'; };

fill();
await submit();
assert.equal(element('password').value, '');
assert.equal(element('tfa').value, '');
assert.match(element('status').textContent, /HTTP 403/);
assert.equal(element('start').disabled, false);

mode = 'cancel'; fill();
const pending = submit();
element('cancel').onclick();
await pending;
assert.equal(element('password').value, '');
assert.equal(element('tfa').value, '');
assert.match(element('status').textContent, /abgebrochen/);

mode = 'malformed201'; fill();
await submit();
assert.equal(element('start').disabled, false);
assert.equal(element('hostsPanel').hidden, true);
assert.match(element('log').textContent, /personal-auth-http-201-malformed/);

const saved=new Map();
globalThis.localStorage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
element('remember').checked=true;
mode = 'success201'; fill();
await submit();
assert.equal(element('hostsPanel').hidden, false);
assert.equal(saved.size,1);
assert.equal([...saved.values()][0].includes('synthetic-private-password'),false);
assert.equal(element('start').disabled, true);
assert.equal(element('email').value, '');
assert.equal(element('password').value, '');
assert.equal(element('tfa').value, '');
let reportBlob;
const oldCreate = URL.createObjectURL;
URL.createObjectURL = blob => { reportBlob = blob; return 'blob:synthetic-report'; };
element('download').onclick();
const report = await reportBlob.text();
for (const secret of ['person@example.invalid', 'synthetic-private-password', 'synthetic-private-session', '654321']) assert.equal(report.includes(secret), false);
URL.createObjectURL = oldCreate;
element('logout').onclick();
assert.equal(saved.size,0);
assert.equal(element('hostsPanel').hidden, true);
assert.equal(element('start').disabled, false);
console.log('Rejected login, cancellation, success, logout and report redaction checks passed');

mode = 'success'; fill();
await submit();
assert.equal(element('hostsPanel').hidden, false);
element('logout').onclick();
