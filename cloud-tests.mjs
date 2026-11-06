import assert from 'node:assert/strict';
import { rebaseSnapshot, SHARED_KEYS } from './src/cloudMerge.js';

const key = 'app_incomes_list_v11';
assert.ok(SHARED_KEYS.includes(key));
const old = { [key]: [{id:'one',amount:10}, {id:'two',amount:20}] };
const mine = { [key]: [{id:'one',amount:11},{id:'two',amount:20},{id:'three',amount:30}] };
const theirs = { [key]: [{id:'one',amount:10}, {id:'two',amount:22},{id:'four',amount:40}] };
const merged = rebaseSnapshot(old,mine,theirs)[key];
assert.deepEqual(merged, [{id:'one',amount:11}, {id:'two',amount:22}, {id:'four',amount:40}, {id:'three',amount:30}]);
const deleteMine = { [key]: [{id:'two',amount:20}] };
assert.deepEqual(rebaseSnapshot(old,deleteMine,theirs)[key].map(x=>x.id), ['two','four']);
assert.deepEqual(rebaseSnapshot({}, {[key]: [{id:'a',amount:1}]}, {[key]: [{id:'b',amount:2}]} )[key].map(x=>x.id), ['b','a']);
assert.equal(rebaseSnapshot({app_voce_aporte_v11:500}, {app_voce_aporte_v11:500}, {app_voce_aporte_v11:550}).app_voce_aporte_v11,550);
assert.equal(rebaseSnapshot({app_voce_aporte_v11:500}, {app_voce_aporte_v11:650}, {app_voce_aporte_v11:550}).app_voce_aporte_v11,650);
assert.deepEqual(rebaseSnapshot({app_recurring_skipped_v1:['x']},{app_recurring_skipped_v1:['x','y']},{app_recurring_skipped_v1:['x','z']}).app_recurring_skipped_v1, ['x','z','y']);
console.log('Testes de sincronização e resolução de conflito aprovados.');
