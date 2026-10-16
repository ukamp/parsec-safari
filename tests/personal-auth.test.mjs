import {asset} from './helpers.mjs';
import assert from 'node:assert/strict';
const {authenticatePersonal}=await import(asset('core/personal-auth.js'));

let sent;
const fetcher = async (url, options) => {
  sent = { url, options };
  return { status: 200, json: async () => ({ data: { id: 'synthetic-session', extra: 'not-returned' } }) };
};
const result = await authenticatePersonal({ email: ' test@example.invalid ', password: 'synthetic-password', tfa: ' 123456 ' }, undefined, fetcher);
assert.deepEqual(result, { status: 200, id: 'synthetic-session' });
assert.equal(sent.url, 'https://kessel-api.parsec.app/v1/auth');
assert.deepEqual(JSON.parse(sent.options.body), { email: 'test@example.invalid', password: 'synthetic-password', tfa: '123456' });
assert.equal(sent.options.credentials, 'omit');
assert.equal(sent.options.redirect, 'error');
assert.equal(sent.options.referrerPolicy, 'no-referrer');
assert.equal(sent.options.cache, 'no-store');
await authenticatePersonal({ email: 'test@example.invalid', password: 'synthetic-password', tfa: '' }, undefined, fetcher);
assert.equal('tfa' in JSON.parse(sent.options.body), false);
assert.deepEqual(await authenticatePersonal({ email: 'a', password: 'b', tfa: '' }, undefined, async () => ({ status: 403, json: async () => ({ sensitive: 'must-not-be-returned' }) })), { status: 403 });
assert.deepEqual(await authenticatePersonal({ email: 'a', password: 'b', tfa: '' }, undefined, async () => ({ status: 200, json: async () => ({ data: {} }) })), { status: 200, malformed: true });
console.log('Personal authentication request checks passed (synthetic data only)');

for (const status of [200, 201]) {
  const valid = await authenticatePersonal({email:'a',password:'b',tfa:''}, undefined, async () => ({status,json:async()=>({data:{id:'synthetic-session'}})}));
  assert.deepEqual(valid,{status,id:'synthetic-session'});
  const missing = await authenticatePersonal({email:'a',password:'b',tfa:''}, undefined, async () => ({status,json:async()=>({data:{}})}));
  assert.deepEqual(missing,{status,malformed:true});
}
assert.deepEqual(await authenticatePersonal({email:'a',password:'b',tfa:''},undefined,async()=>({status:202,json:async()=>({data:{id:'not-a-confirmed-session'}})})),{status:202});

for (const status of [200, 201]) {
  assert.deepEqual(await authenticatePersonal({email:'a',password:'b',tfa:''},undefined,async()=>({status,json:async()=>({session_id:'synthetic-root-session',email:'must-not-return'})})),{status,id:'synthetic-root-session'});
  for (const session_id of ['', 123, {}, 'x'.repeat(4097)]) {
    assert.deepEqual(await authenticatePersonal({email:'a',password:'b',tfa:''},undefined,async()=>({status,json:async()=>({session_id})})),{status,malformed:true});
  }
}
assert.deepEqual(await authenticatePersonal({email:'a',password:'b',tfa:''},undefined,async()=>({status:403,json:async()=>({session_id:'must-not-accept'})})),{status:403});
console.log('Top-level session_id and invalid-session checks passed');
