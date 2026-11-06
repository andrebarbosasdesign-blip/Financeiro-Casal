/** Regras independentes da interface: sem rede, sem dados pessoais e testáveis com Node. */
export const money = (value) => Math.max(0, Number(value) || 0);
export const periodOf = (value) => (typeof value === 'string' ? value.slice(0, 7) : '');

/** Quatro cartões esperados no painel (apenas nomes, sem dados pessoais ou valores). */
export const DEFAULT_CREDIT_CARDS = [
  { id: 'card-1', name: 'Meu Cartão Nubank', owner: 'Você', limit: 0 },
  { id: 'card-2', name: 'Cartão Nubank Dela', owner: 'Ela', limit: 0 },
  { id: 'card-3', name: 'Cartão Inter Dela', owner: 'Ela', limit: 0 },
  { id: 'card-4', name: 'Cartão Renner Dela', owner: 'Ela', limit: 0 }
];

/**
 * Migra os dois cartões genéricos de versões anteriores, completa os cartões
 * ausentes e mantém limites, IDs e assinaturas já vinculadas. É idempotente.
 * Nunca remove cartões extras criados pelo usuário.
 */
export function reconcileCreditCards(cards) {
  const existing = Array.isArray(cards) ? cards : [];
  const result = [...existing];
  let modified = !Array.isArray(cards);
  for (const defaultCard of DEFAULT_CREDIT_CARDS) {
    const index = result.findIndex(card => card && card.id === defaultCard.id);
    if (index >= 0) {
      const saved = result[index];
      const oldPlaceholder = (defaultCard.id === 'card-1' && saved.name === 'Cartão 1') ||
        (defaultCard.id === 'card-2' && saved.name === 'Cartão 2');
      if (oldPlaceholder) {
        result[index] = { ...saved, name: defaultCard.name, owner: defaultCard.owner };
        modified = true;
      }
      continue;
    }
    const bank = defaultCard.name.match(/Nubank|Inter|Renner/i)?.[0].toLowerCase();
    // Respeita eventuais IDs personalizados de um cartão já existente.
    const alreadyPresent = result.some(card => card?.owner === defaultCard.owner &&
      String(card.name || '').toLowerCase().includes(bank));
    if (!alreadyPresent) {
      result.push({ ...defaultCard });
      modified = true;
    }
  }
  return modified ? result : cards;
}
export const monthDate = (month, day = 1) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Mês inválido');
  const [year, m] = month.split('-').map(Number);
  const lastDay = new Date(year, m, 0).getDate();
  return `${month}-${String(Math.min(lastDay, Math.max(1, Math.floor(Number(day) || 1)))).padStart(2, '0')}`;
};
export const offsetMonth = (month, delta) => {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export function buildRecurringEntries(rules, selectedMonth, incomes, payments, skipped = []) {
  const additions = { incomes: [], payments: [] };
  const seenIncomes = new Set(incomes.map(i => String(i.id)));
  const seenPayments = new Set(payments.map(p => String(p.id)));
  // Também evita replicar uma conta que já tenha sido cadastrada manualmente.
  const sameTransaction = (items, rule, date, dateKey) => items.some(item =>
    String(item.description || '').trim().toLocaleLowerCase('pt-BR') === rule.description.trim().toLocaleLowerCase('pt-BR') &&
    Math.abs(money(item.amount) - money(rule.amount)) < 0.005 && item[dateKey] === date
  );
  const skippedIds = new Set(skipped);
  for (const rule of rules) {
    if (!rule.enabled || selectedMonth < rule.startMonth || (rule.endMonth && selectedMonth > rule.endMonth)) continue;
    const prefix = rule.type === 'income' ? 'inc' : 'pay';
    const id = `${prefix}-rec-${rule.id}-${selectedMonth}`;
    if (skippedIds.has(id)) continue;
    const date = monthDate(selectedMonth, rule.day);
    if (rule.type === 'income' && !seenIncomes.has(id) && !sameTransaction(incomes, rule, date, 'date')) {
      additions.incomes.push({ id, recurringRuleId: rule.id, description: rule.description, amount: money(rule.amount), date, responsible: rule.responsible || 'Você', isReceived: false });
      seenIncomes.add(id);
    }
    if (rule.type === 'payment' && !seenPayments.has(id) && !sameTransaction(payments, rule, date, 'dueDate')) {
      additions.payments.push({ id, recurringRuleId: rule.id, description: rule.description, amount: money(rule.amount), dueDate: date, linkedIncomeId: '', recommendedIncome: 'Recorrência mensal', isPaid: false, category: rule.category || 'Outros', manualAllocations: {} });
      seenPayments.add(id);
    }
  }
  return additions;
}

export function monthCashSummary(month, incomes, payments) {
  const inc = incomes.filter(item => periodOf(item.date) === month);
  const pay = payments.filter(item => periodOf(item.dueDate) === month);
  const plannedIncome = inc.reduce((sum, x) => sum + money(x.amount), 0);
  const confirmedIncome = inc.filter(x => x.isReceived === true).reduce((sum, x) => sum + money(x.amount), 0);
  const scheduledPayments = pay.reduce((sum, x) => sum + money(x.amount), 0);
  const paidPayments = pay.filter(x => x.isPaid).reduce((sum, x) => sum + money(x.amount), 0);
  return { month, plannedIncome, confirmedIncome, scheduledPayments, paidPayments,
    plannedNet: plannedIncome - scheduledPayments, confirmedNet: confirmedIncome - paidPayments };
}

export function cashHistory(endMonth, incomes, payments, count = 12) {
  return Array.from({ length: count }, (_, index) => {
    const month = offsetMonth(endMonth, index + 1 - count);
    return { ...monthCashSummary(month, incomes, payments), label: `${month.slice(5)}/${month.slice(2, 4)}` };
  });
}

export function allocationWarnings(incomes, payments, month) {
  const issues = [];
  const monthInc = incomes.filter(x => periodOf(x.date) === month);
  const monthPay = payments.filter(x => periodOf(x.dueDate) === month);
  for (const pay of monthPay) {
    const manual = Object.values(pay.manualAllocations || {}).reduce((sum, value) => sum + money(value), 0);
    if (manual > money(pay.amount) + 0.005) issues.push(`Alocação manual de “${pay.description}” excede o pagamento em R$ ${(manual - money(pay.amount)).toFixed(2).replace('.', ',')}.`);
    const links = String(pay.linkedIncomeId || '').split(',').filter(Boolean);
    for (const id of Object.keys(pay.manualAllocations || {})) {
      if (!monthInc.some(inc => String(inc.id) === id)) issues.push(`“${pay.description}” tem uma alocação vinculada a uma receita fora do mês ou excluída.`);
    }
    if (links.some(id => !monthInc.some(inc => String(inc.id) === id))) issues.push(`“${pay.description}” utiliza fonte de receita indisponível neste mês.`);
  }
  return [...new Set(issues)];
}

const isDate = (date) => {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split('-').map(Number);
  const test = new Date(y, m - 1, d);
  return test.getFullYear() === y && test.getMonth() === m - 1 && test.getDate() === d;
};
const checkArray = (value, field, required = false) => {
  if (value === undefined && !required) return;
  if (!Array.isArray(value) || value.length > 10000) throw new Error(`Lista inválida ou grande demais: ${field}.`);
  const ids = new Set();
  for (const row of value) {
    if (!row || typeof row !== 'object' || typeof row.id !== 'string' || !row.id || ids.has(row.id)) throw new Error(`IDs inválidos ou duplicados em ${field}.`);
    ids.add(row.id);
    if ('amount' in row && (!Number.isFinite(Number(row.amount)) || Number(row.amount) < 0)) throw new Error(`Valor inválido em ${field}.`);
    if ('description' in row && (typeof row.description !== 'string' || row.description.length > 250)) throw new Error(`Descrição inválida em ${field}.`);
    for (const fieldDate of ['date', 'dueDate']) if (row[fieldDate] && !isDate(row[fieldDate])) throw new Error(`Data inválida em ${field}.`);
  }
};
/** Aceita backups antigos, preservando os campos que eles já têm. */
export function validateFinanceBackup(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('O arquivo deve conter um objeto JSON de backup.');
  checkArray(data.incomesList, 'incomesList', true);
  checkArray(data.expensesList, 'expensesList', true);
  checkArray(data.paymentChecklist, 'paymentChecklist', true);
  for (const field of ['creditCards', 'cardSubs', 'portfolioAssets', 'goalsList', 'realizedDeposits', 'recurringRules']) checkArray(data[field], field);
  if (data.recurringSkipped !== undefined && (!Array.isArray(data.recurringSkipped) || data.recurringSkipped.length > 10000 || data.recurringSkipped.some(x => typeof x !== 'string'))) throw new Error('Lista de ocorrências ignoradas inválida.');
  if (data.selectedMonth && !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.selectedMonth)) throw new Error('Mês de referência inválido.');
  for (const rule of data.recurringRules || []) {
    if (!['income', 'payment'].includes(rule.type) || typeof rule.description !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(rule.startMonth) || !Number.isInteger(Number(rule.day)) || Number(rule.day) < 1 || Number(rule.day) > 31 || !Number.isFinite(Number(rule.amount)) || Number(rule.amount) <= 0) throw new Error('Regra recorrente inválida.');
  }
  return data;
}