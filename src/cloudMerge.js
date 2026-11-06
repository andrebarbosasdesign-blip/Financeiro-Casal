/** Rebase optimistic offline changes over the newest shared snapshot.
 * Entries in arrays have stable ids; changes to different entries do not overwrite each other.
 * If two people edit the same entry simultaneously, the local edit wins during conflict resolution.
 */
export const SHARED_KEYS = [
  'app_credit_cards_v11', 'app_card_subs_v11', 'app_voce_aporte_v11',
  'app_portfolio_assets_v11', 'app_goals_list_v11', 'app_incomes_list_v11',
  'app_expenses_list_v11', 'app_payment_checklist_v11',
  'app_recurring_rules_v1', 'app_recurring_skipped_v1',
  'app_emergency_current_v1', 'app_emergency_months_v1',
  'app_early_payoff_v1', 'app_target_weights_v1',
  'app_sim_yield_v11', 'app_dividend_yield_v1', 'app_sim_years_v11',
  'app_initial_contrib_v11', 'app_annual_stepup_v11',
  'app_max_monthly_v11', 'app_realized_deposits_v11'
];
export const SHARED_KEY_SET = new Set(SHARED_KEYS);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function rebaseSnapshot(base = {}, local = {}, remote = {}) {
  const merged = { ...remote };
  for (const key of SHARED_KEYS) {
    const before = base[key];
    const after = local[key];
    if (same(before, after)) continue;
    if (Array.isArray(after) && (Array.isArray(before) || before === undefined) && (Array.isArray(remote[key]) || remote[key] === undefined) &&
        key !== 'app_recurring_skipped_v1' &&
        [...(before || []), ...after, ...(remote[key] || [])].every(v => v && typeof v === 'object' && v.id != null)) {
      const oldMap = new Map((before || []).map(x => [String(x.id), x]));
      const localMap = new Map(after.map(x => [String(x.id), x]));
      const next = new Map((remote[key] || []).map(x => [String(x.id), x]));
      for (const [id, prev] of oldMap) {
        if (!localMap.has(id)) next.delete(id);
        else if (!same(prev, localMap.get(id))) next.set(id, localMap.get(id));
      }
      for (const [id, value] of localMap) if (!oldMap.has(id)) next.set(id, value);
      merged[key] = [...next.values()];
    } else if (key === 'app_recurring_skipped_v1' && Array.isArray(after) && Array.isArray(remote[key])) {
      // Tombstone list: never revive a recurring entry skipped by either user.
      merged[key] = [...new Set([...(remote[key] || []), ...after])];
    } else {
      merged[key] = after;
    }
  }
  return merged;
}

export const snapshotsEqual = (a, b) => same(a, b);
