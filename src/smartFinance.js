import { monthCashSummary, offsetMonth, money, periodOf } from './financeUtils.js';

/** Indicadores calculados apenas sobre lançamentos. Despesas-mestre não entram no caixa duas vezes. */
export function smartSummary(month, incomes = [], payments = [], cards = [], items = [], now = new Date()) {
  const cash = monthCashSummary(month, incomes, payments);
  const previous = monthCashSummary(offsetMonth(month, -1), incomes, payments);
  const monthPayments = payments.filter(p => periodOf(p.dueDate) === month);
  const pending = monthPayments.filter(p => !p.isPaid);
  const unreceived = incomes.filter(i => periodOf(i.date) === month && !i.isReceived);
  const today = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
  const alerts = [];
  for (const p of pending) {
    if (!p.dueDate || p.dueDate > today) continue;
    alerts.push({ id: 'due-' + p.id, level: 'urgent', title: p.dueDate < today ? 'Pagamento vencido' : 'Vence hoje', detail: String(p.description || 'Pagamento') + ' · ' + formatMoney(p.amount) });
  }
  for (const p of pending) {
    if (!p.dueDate || p.dueDate <= today) continue;
    const days = Math.round((Date.parse(p.dueDate+'T12:00:00Z') - Date.parse(today+'T12:00:00Z')) / 86400000);
    if (days <= 3) alerts.push({ id:'soon-'+p.id, level:'warning', title: 'Vencimento próximo', detail: String(p.description || 'Pagamento') + ' · ' + days + ' dia(s)' });
  }
  const cardUsage = cards.map(c => {
    const limit = money(c.limit);
    const used = items.filter(i => (i.cardId || 'card-1') === c.id).reduce((a,i)=>a+money(i.amount),0);
    const ratio = limit > 0 ? used / limit : null;
    if (ratio !== null && ratio >= .8) alerts.push({
      id:'card-'+c.id, level:ratio >= 1 ? 'urgent':'warning', title:ratio >= 1 ? 'Limite do cartão atingido':'Cartão próximo do limite',
      detail: c.name + ' · ' + Math.round(ratio*100) + '% utilizado (itens cadastrados)'
    });
    return { ...c, limit, used, ratio, available:limit-used };
  });
  if (unreceived.length && month === today.slice(0,7)) {
    alerts.push({id:'unreceived', level:'info', title: unreceived.length + ' receita(s) não confirmada(s)', detail:'Confira os valores na aba Recebimentos.'});
  }
  if (cash.plannedNet < 0 && cash.plannedIncome > 0) alerts.push({
    id:'budget', level:'warning', title:'Planejamento negativo', detail:'Os pagamentos previstos superam as receitas do mês.'
  });
  const insights=[];
  if (cash.plannedIncome || cash.scheduledPayments) {
    insights.push({id:'balance',label:'Saldo previsto', value:cash.plannedNet, explanation:'Receitas previstas menos pagamentos agendados.'});
  }
  if (previous.scheduledPayments > 0 && cash.scheduledPayments > 0) {
    const pct=(cash.scheduledPayments/previous.scheduledPayments-1)*100;
    insights.push({id:'trend',label:'Contas previstas vs. mês anterior',value:pct,percent:true,explanation:Math.abs(pct)<.5?'Praticamente estável': pct>0?'As contas agendadas aumentaram.':'As contas agendadas diminuíram.'});
  }
  if (cash.plannedIncome>0) {
    insights.push({id:'received',label:'Receitas já confirmadas',value:100*cash.confirmedIncome/cash.plannedIncome,percent:true,explanation:'Percentual de receitas marcadas como recebidas.'});
  }
  return { cash, previous, pending, alerts: alerts.slice(0,8), cardUsage, insights, today };
}
export const formatMoney = n => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0);

/** Fecha o mês em um resumo imutável por ação explícita do casal. Não efetua pagamentos. */
export function makeMonthClosing(month, finances, oldClosing, updatedAt = new Date().toISOString()) {
  const summary=monthCashSummary(month,finances.incomesList||[],finances.paymentChecklist||[]);
  const entries=(finances.paymentChecklist||[]).filter(p=>periodOf(p.dueDate)===month);
  const incomeEntries=(finances.incomesList||[]).filter(i=>periodOf(i.date)===month);
  return {
    id:month, month, ...summary,
    paidCount:entries.filter(p=>p.isPaid).length,
    paymentCount:entries.length,
    receivedCount:incomeEntries.filter(i=>i.isReceived).length,
    incomeCount:incomeEntries.length,
    investmentValue: (finances.portfolioAssets||[]).reduce((s,a)=>s+money(a.qtdAdquirida)*money(a.precoAtual),0),
    updatedAt,
    revision:(Number(oldClosing?.revision)||0)+1
  };
}
export function closingChanged(closing, summary) {
  if (!closing) return false;
  return ['plannedIncome','confirmedIncome','scheduledPayments','paidPayments'].some(k=>Math.abs(Number(closing[k]||0)-Number(summary[k]||0))>.005);
}
