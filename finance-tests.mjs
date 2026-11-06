import assert from 'node:assert/strict';
import { buildRecurringEntries, cashHistory, allocationWarnings, monthCashSummary, monthDate, validateFinanceBackup, DEFAULT_CREDIT_CARDS, reconcileCreditCards } from './src/financeUtils.js';

const incomeRule = { id:'salario', type:'income',description:'Salário',amount:2000,day:31,startMonth:'2026-11',enabled:true,responsible:'Ela' };
const paymentRule = { id:'aluguel', type:'payment',description:'Aluguel',amount:800,day:31,startMonth:'2026-11',enabled:true,category:'Moradia' };
assert.equal(monthDate('2027-02',31),'2027-02-28');
const first = buildRecurringEntries([incomeRule,paymentRule],'2027-02',[],[]);
assert.equal(first.incomes.length,1); assert.equal(first.payments.length,1);
assert.equal(first.incomes[0].date,'2027-02-28');
assert.equal(first.incomes[0].isReceived,false);
assert.equal(buildRecurringEntries([incomeRule,paymentRule],'2027-02',first.incomes,first.payments).incomes.length,0);
assert.equal(buildRecurringEntries([incomeRule,paymentRule],'2027-02',[],[],[first.payments[0].id]).payments.length,0);
assert.equal(buildRecurringEntries([incomeRule],'2027-02',[{id:'manual-1',description:'Salário',amount:2000,date:'2027-02-28'}],[]).incomes.length,0);
assert.equal(buildRecurringEntries([paymentRule],'2027-02',[],[{id:'manual-2',description:'Aluguel',amount:800,dueDate:'2027-02-28'}]).payments.length,0);
assert.equal(buildRecurringEntries([incomeRule,paymentRule],'2026-10',[],[]).incomes.length,0);
const summary = monthCashSummary('2027-02',[{...first.incomes[0],isReceived:true}], [{...first.payments[0],isPaid:true}]);
assert.equal(summary.confirmedNet,1200); assert.equal(summary.plannedNet,1200);
assert.equal(cashHistory('2027-02',first.incomes,first.payments,2)[0].month,'2027-01');
assert.equal(allocationWarnings([], [{...first.payments[0],manualAllocations:{abc:900}}],'2027-02').length>0,true);
const valid={incomesList:[],expensesList:[],paymentChecklist:[]};
assert.doesNotThrow(()=>validateFinanceBackup(valid));
assert.throws(()=>validateFinanceBackup({...valid,incomesList:[{id:'1',description:'A',date:'2026-02-31',amount:50}]}),/Data inválida/);
assert.throws(()=>validateFinanceBackup({...valid,paymentChecklist:[{id:'a',amount:1},{id:'a',amount:1}]}),/duplicados/);
// Cartões: um Nubank para Você e Nubank, Inter e Renner para Ela.
assert.equal(DEFAULT_CREDIT_CARDS.length, 4);
assert.deepEqual(DEFAULT_CREDIT_CARDS.map(({id,owner}) => `${id}:${owner}`), [
  'card-1:Você', 'card-2:Ela', 'card-3:Ela', 'card-4:Ela'
]);
const oldTwoCards = [
  { id:'card-1', name:'Cartão 1', owner:'Você', limit:750 },
  { id:'card-2', name:'Cartão 2', owner:'Ela', limit:375 }
];
const migrated = reconcileCreditCards(oldTwoCards);
assert.deepEqual(migrated.map(c=>c.name), [
  'Meu Cartão Nubank','Cartão Nubank Dela','Cartão Inter Dela','Cartão Renner Dela'
]);
assert.deepEqual(migrated.map(c=>c.limit), [750,375,0,0]);
assert.equal(reconcileCreditCards(migrated),migrated); // idempotente: mantém referência
assert.deepEqual(oldTwoCards.map(c=>c.name), ['Cartão 1','Cartão 2']); // não muta entrada
const restored = [
  { id:'card-1', name:'Meu Cartão Nubank', owner:'Você', limit:450 },
  { id:'card-2', name:'Cartão Nubank Dela', owner:'Ela', limit:300 },
  { id:'card-3', name:'Cartão Inter Dela', owner:'Ela', limit:350 },
  { id:'card-4', name:'Cartão Renner Dela', owner:'Ela', limit:200 }
];
assert.equal(reconcileCreditCards(restored),restored);
const custom = [
  ...oldTwoCards,
  { id:'outro-inter', name:'Banco Inter', owner:'Ela', limit:790 }
];
const customMigrated = reconcileCreditCards(custom);
assert.equal(customMigrated.some(c=>c.id==='card-3'),false); // não duplica Inter com ID personalizado
assert.equal(customMigrated.find(c=>c.id==='outro-inter').limit,790);
assert.equal(reconcileCreditCards([]).length,4);
console.log('Regras financeiras e migração dos quatro cartões: OK');