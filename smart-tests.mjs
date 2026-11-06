import assert from 'node:assert/strict';
import { smartSummary, makeMonthClosing, closingChanged } from './src/smartFinance.js';

const inc=[
  {id:'i1',date:'2026-11-05',amount:3000,isReceived:true},
  {id:'i2',date:'2026-11-15',amount:1000,isReceived:false},
  {id:'i3',date:'2026-10-01',amount:2000,isReceived:true}
];
const pay=[
  {id:'p1',dueDate:'2026-11-02',description:'Internet',amount:200,isPaid:true},
  {id:'p2',dueDate:'2026-11-06',description:'Aluguel',amount:1500,isPaid:false},
  {id:'p3',dueDate:'2026-10-06',description:'Anterior',amount:800,isPaid:true}
];
const cards=[{id:'c1',name:'Cartão teste',owner:'Você',limit:1000}];
const items=[{id:'s1',cardId:'c1',amount:850}];
const sum=smartSummary('2026-11',inc,pay,cards,items,new Date(2026,10,6,10,0,0));
assert.equal(sum.cash.plannedIncome,4000);
assert.equal(sum.cash.confirmedIncome,3000);
assert.equal(sum.cash.scheduledPayments,1700);
assert.equal(sum.cash.paidPayments,200);
assert.equal(sum.cash.plannedNet,2300);
assert.equal(sum.cash.confirmedNet,2800);
assert.equal(sum.cardUsage[0].ratio,0.85);
assert.ok(sum.alerts.some(a=>a.title==='Vence hoje'));
assert.ok(sum.alerts.some(a=>a.title==='Cartão próximo do limite'));
assert.ok(sum.alerts.some(a=>a.title.includes('receita(s) não confirmada(s)')));
const snapshot=makeMonthClosing('2026-11',{incomesList:inc,paymentChecklist:pay,portfolioAssets:[{qtdAdquirida:2,precoAtual:500}]},undefined,'2026-11-06T10:00:00Z');
assert.equal(snapshot.revision,1);
assert.equal(snapshot.confirmedNet,2800);
assert.equal(snapshot.investmentValue,1000);
assert.equal(closingChanged(snapshot,sum.cash),false);
assert.equal(closingChanged(snapshot,{...sum.cash,paidPayments:201}),true);
const snapshot2=makeMonthClosing('2026-11',{incomesList:inc,paymentChecklist:pay,portfolioAssets:[]},snapshot,'2026-11-07T10:00:00Z');
assert.equal(snapshot2.revision,2);
assert.equal(snapshot2.month,'2026-11');
const other=smartSummary('2026-10',inc,pay,[],[],new Date(2026,10,6));
assert.equal(other.cash.scheduledPayments,800);
assert.equal(other.alerts.filter(a=>a.id.startsWith('due-')).length,0);
console.log('Smart dashboard: regras, alertas e fechamento OK');
