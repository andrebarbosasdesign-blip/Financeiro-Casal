import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { buildRecurringEntries, cashHistory, monthCashSummary, allocationWarnings, validateFinanceBackup, DEFAULT_CREDIT_CARDS, reconcileCreditCards } from './financeUtils.js';


// ============================================================================
// LIGHTWEIGHT INLINE SVG ICONS (100% Standalone & Crash-Free)
// ============================================================================
const WalletIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BarChartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PieChartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const FileTextIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ZapIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const PrinterIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CreditCardIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TargetIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

const BriefcaseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const DownloadIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const UploadIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CalculatorIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const AlertTriangleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// --- HELPERS FOR LOCAL DATE AND CURRENCY FORMATTING ---
const getLocalDateString = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const getLocalMonthString = () => getLocalDateString().slice(0, 7);
const fmt = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

// --- CLEAN, NON-PERSONAL DEFAULTS ---
// IMPORTANT: Never commit real household data in a public repository. Restore locally from a JSON backup.
const INITIAL_PORTFOLIO_ASSETS = [];
const INITIAL_GOALS = [
  { id: 'goal-1', title: 'Primeiros R$ 1.000 Investidos', target: 1000, category: 'Patrimônio' },
  { id: 'goal-2', title: 'R$ 5.000 Investidos', target: 5000, category: 'Patrimônio' },
  { id: 'goal-3', title: 'R$ 10.000 Investidos', target: 10000, category: 'Patrimônio' }
];
const INITIAL_EXPENSES = [];
const INITIAL_CREDIT_CARD_SUBSCRIPTIONS = [];
const INITIAL_CARDS = DEFAULT_CREDIT_CARDS;
const INITIAL_INCOMES = [];
const INITIAL_PAYMENT_SCHEDULE = [];

const PHASES_INFO = {
  1: { title: 'Fase 1: Planejamento inicial', subtitle: 'Despesas cadastradas para a primeira fase.', vocePote: 450, elaPote: 250 },
  2: { title: 'Fase 2: Planejamento intermediário', subtitle: 'Despesas cadastradas para a segunda fase.', vocePote: 450, elaPote: 250 },
  3: { title: 'Fase 3: Planejamento futuro', subtitle: 'Despesas cadastradas para a terceira fase.', vocePote: 450, elaPote: 250 }
};

const CHART_COLORS = ['#2DD4BF', '#5EEAD4', '#38BDF8', '#818CF8', '#34D399', '#F59E0B', '#F43F5E', '#A855F7'];

// --- HELPER HOOK FOR PERSISTENT STORAGE ---
function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
        if (saved !== null && saved !== undefined && saved !== "undefined") {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.error(`Erro ao carregar ${key} do storage:`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(state);
        window.localStorage.setItem(key, serialized);
        window.sessionStorage.setItem(key, serialized);
      }
    } catch (e) {
      console.error(`Erro ao salvar ${key} no storage:`, e);
    }
  }, [key, state]);

  return [state, setState];
}

// --- HELPER FOR DATE DUE ALERT CALCULATION ---
const getDueDateAlertStatus = (dueDateStr, isPaid) => {
  if (isPaid) return { label: 'Quitado', color: 'emerald', code: 'paid' };
  if (!dueDateStr) return { label: 'Sem Data', color: 'gray', code: 'none' };

  const today = new Date();
  today.setHours(0,0,0,0);

  const parts = dueDateStr.split('-');
  let due = new Date();
  if (parts.length === 3) {
    due = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  due.setHours(0,0,0,0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Atrasado há ${Math.abs(diffDays)} dia(s)`, color: 'rose', code: 'overdue' };
  } else if (diffDays === 0) {
    return { label: 'VENCE HOJE!', color: 'amber', code: 'today' };
  } else if (diffDays <= 3) {
    return { label: `Vence em ${diffDays} dia(s)`, color: 'amber', code: 'soon' };
  } else {
    return { label: `Em dia (${diffDays}d)`, color: 'blue', code: 'ok' };
  }
};

// --- MAIN REACT APPLICATION COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useLocalStorageState('app_active_tab_v11', 'dashboard');
  const [selectedPhase, setSelectedPhase] = useLocalStorageState('app_selected_phase_v11', 1);
  const [selectedMonth, setSelectedMonth] = useLocalStorageState('app_selected_month_v1', getLocalMonthString());
  const fileInputRef = useRef(null);
  const [lastSaved, setLastSaved] = useState('');

  // Persistent States
  const [creditCards, setCreditCards] = useLocalStorageState('app_credit_cards_v11', INITIAL_CARDS);
  // Corrige as instalações antigas que guardaram só dois cartões no navegador.
  // Mantém IDs e limites, sem apagar gastos ou assinaturas já vinculados.
  useEffect(() => {
    setCreditCards(current => reconcileCreditCards(current));
  }, []);
  const [cardSubs, setCardSubs] = useLocalStorageState('app_card_subs_v11', INITIAL_CREDIT_CARD_SUBSCRIPTIONS);
  const [voceAporte, setVoceAporte] = useLocalStorageState('app_voce_aporte_v11', 450.00);
  const [portfolioAssets, setPortfolioAssets] = useLocalStorageState('app_portfolio_assets_v11', INITIAL_PORTFOLIO_ASSETS);
  const [goalsList, setGoalsList] = useLocalStorageState('app_goals_list_v11', INITIAL_GOALS);
  const [incomesList, setIncomesList] = useLocalStorageState('app_incomes_list_v11', INITIAL_INCOMES);
  const [expensesList, setExpensesList] = useLocalStorageState('app_expenses_list_v11', INITIAL_EXPENSES);
  const [paymentChecklist, setPaymentChecklist] = useLocalStorageState('app_payment_checklist_v11', INITIAL_PAYMENT_SCHEDULE);
  const [recurringRules, setRecurringRules] = useLocalStorageState('app_recurring_rules_v1', []);
  const [recurringSkipped, setRecurringSkipped] = useLocalStorageState('app_recurring_skipped_v1', []);
  const [newRecurring, setNewRecurring] = useState({ type: 'income', description: '', amount: '', day: 5, startMonth: getLocalMonthString(), responsible: 'Você', category: 'Moradia' });


  // Expanded allocation drawer state per payment item
  const [expandedAllocPayId, setExpandedAllocPayId] = useState(null);

  // New Tool 1: Emergency Reserve Tracker State
  const [emergencyCurrent, setEmergencyCurrent] = useLocalStorageState('app_emergency_current_v1', 0);
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useLocalStorageState('app_emergency_months_v1', 6);

  // New Tool 2: Early Debt Payoff Simulator State
  const [earlyPayoff, setEarlyPayoff] = useLocalStorageState('app_early_payoff_v1', {
    name: 'Dívida / Financiamento', balance: 0, ratePct: 0, remainingMonths: 12, discountPct: 0
  });

  // New Tool 3: Rebalance Calculator Target Weights State (%)
  const [targetWeights, setTargetWeights] = useLocalStorageState('app_target_weights_v1', {
    rendaFixa: 30,
    acoes: 30,
    fiis: 40
  });

  // Simulation & Deposit States
  const [simYield, setSimYield] = useLocalStorageState('app_sim_yield_v11', 10);
  const [dividendYieldPct, setDividendYieldPct] = useLocalStorageState('app_dividend_yield_v1', 0.7);
  const [simYears, setSimYears] = useLocalStorageState('app_sim_years_v11', 30);
  const [initialContribution, setInitialContribution] = useLocalStorageState('app_initial_contrib_v11', 450);
  const [annualStepUp, setAnnualStepUp] = useLocalStorageState('app_annual_stepup_v11', 250);
  const [maxMonthlyContribution, setMaxMonthlyContribution] = useLocalStorageState('app_max_monthly_v11', 1600);
  const [realizedDeposits, setRealizedDeposits] = useLocalStorageState('app_realized_deposits_v11', []);

  // Modals & Form States
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [targetCardForModal, setTargetCardForModal] = useState('card-1');
  const [newSub, setNewSub] = useState({ name: '', amount: '', category: 'Geral', cardId: 'card-1' });

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [newInc, setNewInc] = useState({ description: '', amount: '', date: getLocalDateString(), responsible: 'Você', isReceived: false });
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [editingIncomeDesc, setEditingIncomeDesc] = useState('');
  const [editingIncomeAmount, setEditingIncomeAmount] = useState('');
  const [editingIncomeDate, setEditingIncomeDate] = useState('');
  const [editingIncomeResp, setEditingIncomeResp] = useState('Você');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExp, setNewExp] = useState({ description: '', amount: '', category: 'Moradia', responsible: 'Você', phase: 'Todas' });
  const [editingId, setEditingId] = useState(null);
  const [editingDesc, setEditingDesc] = useState('');
  const [editingAmount, setEditingAmount] = useState('');

  const [isAddPayModalOpen, setIsAddPayModalOpen] = useState(false);
  const [newPayItem, setNewPayItem] = useState({ description: '', amount: '', dueDate: getLocalDateString(), linkedIncomeId: '', recommendedIncome: 'Fonte de receita', category: 'Contas' });
  const [editingPayId, setEditingPayId] = useState(null);
  const [editingPayDesc, setEditingPayDesc] = useState('');
  const [editingPayAmount, setEditingPayAmount] = useState('');
  const [editingPayDate, setEditingPayDate] = useState('');
  const [editingPayCategory, setEditingPayCategory] = useState('Contas');
  const [editingPayIncomeId, setEditingPayIncomeId] = useState('');
  const [editingPayManualAllocations, setEditingPayManualAllocations] = useState({});

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyForm, setBuyForm] = useState({ assetId: '', quantity: '', price: '' });

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ ticker: '', name: '', categoryType: 'acao', qtdPlanejada: '0', precoEstimado: '0' });
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalForm, setNewGoalForm] = useState({ title: '', target: '' });

  const [newDepMonth, setNewDepMonth] = useState('');
  const [newDepAmount, setNewDepAmount] = useState('');
  const [newDepNotes, setNewDepNotes] = useState('');


  useEffect(() => {
    setLastSaved(new Date().toLocaleTimeString('pt-BR'));
  }, [cardSubs, portfolioAssets, goalsList, incomesList, expensesList, paymentChecklist, creditCards, voceAporte, simYield, initialContribution, annualStepUp, maxMonthlyContribution, realizedDeposits, emergencyCurrent, emergencyTargetMonths, targetWeights, earlyPayoff, selectedMonth, dividendYieldPct, recurringRules, recurringSkipped]);

  // Gera somente os lançamentos do mês visitado. IDs determinísticos evitam duplicidade;
  // exclusões são guardadas em recurringSkipped para não reaparecerem.
  useEffect(() => {
    const generated = buildRecurringEntries(recurringRules, selectedMonth, incomesList, paymentChecklist, recurringSkipped);
    if (generated.incomes.length) {
      setIncomesList(prev => {
        const known = new Set(prev.map(x => x.id));
        return [...prev, ...generated.incomes.filter(x => !known.has(x.id))];
      });
    }
    if (generated.payments.length) {
      setPaymentChecklist(prev => {
        const known = new Set(prev.map(x => x.id));
        return [...prev, ...generated.payments.filter(x => !known.has(x.id))];
      });
    }
  // As listas são consultadas ao mudar mês/regras, mas não devem disparar a geração a cada digitação.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, recurringRules, recurringSkipped]);

  const handleAddRecurring = (event) => {
    event.preventDefault();
    const value = Number(newRecurring.amount);
    if (!newRecurring.description.trim() || !Number.isFinite(value) || value <= 0 || !Number.isInteger(Number(newRecurring.day)) || Number(newRecurring.day) < 1 || Number(newRecurring.day) > 31 || !/^\d{4}-(0[1-9]|1[0-2])$/.test(newRecurring.startMonth)) {
      alert('Preencha a descrição, o valor, o mês inicial e o dia de 1 a 31.');
      return;
    }
    const similar = recurringRules.find(rule => rule.enabled && rule.type === newRecurring.type && rule.description.trim().toLowerCase() === newRecurring.description.trim().toLowerCase());
    if (similar && !window.confirm('Já há uma regra com nome semelhante. Deseja criar outra mesmo assim?')) return;
    setRecurringRules(prev => [...prev, { ...newRecurring, id: `rule-${Date.now()}-${Math.floor(Math.random() * 10000)}`, description: newRecurring.description.trim(), amount: value, day: Number(newRecurring.day), enabled: true }]);
    setNewRecurring(prev => ({ ...prev, description: '', amount: '' }));
  };

  const handleRemoveRecurring = (id) => {
    if (!window.confirm('Excluir a regra recorrente? Lançamentos dos meses anteriores serão preservados.')) return;
    setRecurringRules(prev => prev.filter(rule => rule.id !== id));
  };

  // Direct Handlers for Cronograma Payments (Fast Inline Value & Allocation Updates)
  const handleUpdatePaymentAmount = (id, newAmount) => {
    const val = Math.max(0, Number(newAmount) || 0);
    setPaymentChecklist(prev => prev.map(item => item.id === id ? { ...item, amount: val } : item));
  };

  const handleUpdateManualAllocation = (payId, incId, val) => {
    setPaymentChecklist(prev => prev.map(item => {
      if (item.id === payId) {
        const currentAlloc = item.manualAllocations ? { ...item.manualAllocations } : {};
        if (val === '' || val === null || val === undefined) {
          delete currentAlloc[incId];
        } else {
          const numericVal = Math.max(0, Number(val) || 0);
          const sumOthers = Object.entries(currentAlloc).filter(([id]) => id !== incId).reduce((total, [, amount]) => total + Math.max(0, Number(amount) || 0), 0);
          if (sumOthers + numericVal > Number(item.amount) + 0.005) {
            alert('A soma dos abates manuais não pode ser maior que o valor do pagamento.');
            return item;
          }
          currentAlloc[incId] = numericVal;
        }
        return { ...item, manualAllocations: currentAlloc };
      }
      return item;
    }));
  };

  // Handlers for Credit Cards Limit Adjustments
  const handleUpdateCardLimit = (cardId, newLimit) => {
    const val = Number(newLimit) >= 0 ? Number(newLimit) : 0;
    setCreditCards(creditCards.map(c => c.id === cardId ? { ...c, limit: val } : c));
  };

  const handleUpdatePaymentDate = (id, newDate) => {
    setPaymentChecklist(paymentChecklist.map(item => item.id === id ? { ...item, dueDate: newDate } : item));
  };

  const handleDeletePaymentItem = (id) => {
    const entry = paymentChecklist.find(item => item.id === id);
    if (entry?.recurringRuleId) setRecurringSkipped(prev => [...new Set([...prev, id])]);
    setPaymentChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleTogglePaid = (id) => {
    setPaymentChecklist(paymentChecklist.map(item => item.id === id ? { ...item, isPaid: !item.isPaid } : item));
  };

  const handleAddPaymentItem = (e) => {
    e.preventDefault();
    if (!newPayItem.description?.trim() || !Number.isFinite(Number(newPayItem.amount)) || Number(newPayItem.amount) <= 0) { alert('Informe uma descrição e um pagamento maior que zero.'); return; }
    const item = {
      id: `pay-${Date.now()}`,
      description: newPayItem.description,
      amount: Number(newPayItem.amount),
      dueDate: newPayItem.dueDate || getLocalDateString(),
      linkedIncomeId: newPayItem.linkedIncomeId || '',
      recommendedIncome: newPayItem.recommendedIncome || 'Fonte de receita',
      isPaid: false,
      category: newPayItem.category || 'Contas',
      manualAllocations: {}
    };
    setPaymentChecklist([...paymentChecklist, item]);
    setNewPayItem({ description: '', amount: '', dueDate: getLocalDateString(), linkedIncomeId: '', recommendedIncome: 'Fonte de receita', category: 'Contas' });
    setIsAddPayModalOpen(false);
  };

  const handleStartEditPayment = (item) => {
    setEditingPayId(item.id);
    setEditingPayDesc(item.description);
    setEditingPayAmount(item.amount.toString());
    setEditingPayDate(item.dueDate);
    setEditingPayCategory(item.category || 'Contas');
    setEditingPayIncomeId(item.linkedIncomeId || '');
    setEditingPayManualAllocations(item.manualAllocations ? { ...item.manualAllocations } : {});
  };

  const handleSaveEditPayment = (id) => {
    const manualSum = Object.values(editingPayManualAllocations).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
    if (manualSum > Number(editingPayAmount) + 0.005) {
      alert('A soma das alocações manuais ultrapassa o valor do pagamento.');
      return;
    }
    let matchedName = 'Geral';
    if (editingPayIncomeId) {
      const ids = editingPayIncomeId.split(',');
      const matched = incomesList.filter(i => ids.includes(i.id));
      if (matched.length > 0) {
        matchedName = matched.map(m => m.description.replace(/^Você - /, '').replace(/^Ela - /, '')).join(' + ');
      }
    }
    setPaymentChecklist(paymentChecklist.map(item => {
      if (item.id === id) {
        return {
          ...item,
          description: editingPayDesc,
          amount: Math.max(0, Number(editingPayAmount) || 0),
          dueDate: editingPayDate,
          category: editingPayCategory,
          linkedIncomeId: editingPayIncomeId,
          recommendedIncome: matchedName,
          manualAllocations: { ...editingPayManualAllocations }
        };
      }
      return item;
    }));
    setEditingPayId(null);
  };

  const handleLinkedIncomeChange = (payId, incomeId) => {
    let matchedName = 'Geral';
    if (incomeId) {
      const ids = incomeId.split(',');
      const matched = incomesList.filter(i => ids.includes(i.id));
      if (matched.length > 0) {
        matchedName = matched.map(m => m.description.replace(/^Você - /, '').replace(/^Ela - /, '')).join(' + ');
      }
    }
    setPaymentChecklist(paymentChecklist.map(item => {
      if (item.id === payId) {
        return {
          ...item,
          linkedIncomeId: incomeId,
          recommendedIncome: matchedName
        };
      }
      return item;
    }));
  };

  const monthIncomes = useMemo(() => incomesList.filter(inc =>
    !inc.date || String(inc.date).slice(0, 7) === selectedMonth
  ), [incomesList, selectedMonth]);

  // ENHANCED DYNAMIC INCOME ALLOCATION BREAKDOWN (Supports Explicit Manual Abate per Income Source)
  const incomeAllocationBreakdown = useMemo(() => {
    const monthPayments = paymentChecklist.filter(pay => !pay.dueDate || String(pay.dueDate).slice(0, 7) === selectedMonth);
    return monthIncomes.map(inc => {
      let totalAllocated = 0;
      const assignedPayments = [];

      monthPayments.forEach(pay => {
        // 1. Check if an explicit manual abate exists for this specific income source
        if (pay.manualAllocations && pay.manualAllocations[inc.id] !== undefined && pay.manualAllocations[inc.id] !== null) {
          const manualVal = Number(pay.manualAllocations[inc.id]) || 0;
          if (manualVal > 0) {
            totalAllocated += manualVal;
            assignedPayments.push({ ...pay, allocatedHere: manualVal, isManual: true });
          }
        } else {
          // 2. Fallback to linked combo / auto proportional division if no explicit manual abatement set for this income
          const ids = pay.linkedIncomeId ? pay.linkedIncomeId.split(',') : [];
          if (ids.includes(inc.id)) {
            let sumManualInThisPay = 0;
            if (pay.manualAllocations) {
              Object.values(pay.manualAllocations).forEach(v => { sumManualInThisPay += (Number(v) || 0); });
            }
            const remainingPayUnallocated = Math.max(0, (Number(pay.amount) || 0) - sumManualInThisPay);

            if (remainingPayUnallocated > 0) {
              const unallocatedGroupIncomes = monthIncomes.filter(i => ids.includes(i.id) && (!pay.manualAllocations || pay.manualAllocations[i.id] === undefined));
              const groupTotal = unallocatedGroupIncomes.reduce((gAcc, gInc) => gAcc + (Number(gInc.amount) || 0), 0);
              if (groupTotal > 0) {
                const share = (Number(inc.amount) / groupTotal) * remainingPayUnallocated;
                totalAllocated += share;
                assignedPayments.push({ ...pay, allocatedHere: share, isManual: false });
              }
            }
          }
        }
      });

      const remainingBalance = Number(inc.amount) - totalAllocated;

      return {
        ...inc,
        assignedPayments,
        totalAllocated,
        remainingBalance
      };
    });
  }, [monthIncomes, paymentChecklist, selectedMonth]);

  // Payment Summary Totals
  const monthPayments = useMemo(() => paymentChecklist.filter(item =>
    !item.dueDate || String(item.dueDate).slice(0, 7) === selectedMonth
  ), [paymentChecklist, selectedMonth]);

  const totalScheduledPayments = useMemo(() =>
    monthPayments.reduce((acc, curr) => acc + Math.max(0, Number(curr.amount) || 0), 0),
  [monthPayments]);

  const totalPaidAmount = useMemo(() =>
    monthPayments.filter(item => item.isPaid)
      .reduce((acc, curr) => acc + Math.max(0, Number(curr.amount) || 0), 0),
  [monthPayments]);

  const monthlyCash = useMemo(() => monthCashSummary(selectedMonth, incomesList, paymentChecklist), [selectedMonth, incomesList, paymentChecklist]);
  const historyData = useMemo(() => cashHistory(selectedMonth, incomesList, paymentChecklist, 12), [selectedMonth, incomesList, paymentChecklist]);
  const warnings = useMemo(() => allocationWarnings(incomesList, paymentChecklist, selectedMonth), [incomesList, paymentChecklist, selectedMonth]);
  const overCommitted = incomeAllocationBreakdown.filter(x => x.remainingBalance < -0.005);
  const totalPendingAmount = totalScheduledPayments - totalPaidAmount;
  const paymentProgressPct = totalScheduledPayments > 0 ? ((totalPaidAmount / totalScheduledPayments) * 100).toFixed(0) : 0;

  // Phase Handlers
  const handlePhaseChange = (p) => setSelectedPhase(p);
  const currentPhaseData = PHASES_INFO[selectedPhase] || PHASES_INFO[1];

  // Income totals are scoped to the selected month. Legacy entries without a date
  // remain visible so importing older backups does not silently discard amounts.

  // Dynamically construct source combinations instead of exposing personal names or hard-coded salaries.
  const incomeComboOptions = useMemo(() => {
    const active = monthIncomes.slice(0, 12);
    const combinations = [];
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length && combinations.length < 42; j++) {
        const pair = [active[i], active[j]];
        combinations.push({
          id: pair.map(inc => inc.id).join(','),
          label: `👥 ${pair.map(inc => inc.description).join(' + ')} (${fmt(pair.reduce((sum, inc) => sum + Number(inc.amount || 0), 0))})`
        });
      }
    }
    if (active.length >= 3) {
      combinations.push({
        id: active.map(inc => inc.id).join(','),
        label: `👥 Todas as ${active.length} entradas do mês`
      });
    }
    return combinations;
  }, [monthIncomes]);

  const voceIncome = useMemo(() => monthIncomes
    .filter(inc => inc.responsible === 'Você')
    .reduce((acc, curr) => acc + Math.max(0, Number(curr.amount) || 0), 0),
  [monthIncomes]);

  const elaIncome = useMemo(() => monthIncomes
    .filter(inc => inc.responsible === 'Ela')
    .reduce((acc, curr) => acc + Math.max(0, Number(curr.amount) || 0), 0),
  [monthIncomes]);

  const rendaTotalConjunta = voceIncome + elaIncome;

  // Expenses Calculation per Phase
  const currentExpenses = useMemo(() => {
    return expensesList.filter(exp => {
      if (exp.phase === 'Todas') return true;
      if (selectedPhase === 1 && exp.phase === 'Fase 1') return true;
      if (selectedPhase === 2 && exp.phase === 'Fase 2') return true;
      if (selectedPhase === 3 && exp.phase === 'Fase 3') return true;
      return false;
    });
  }, [expensesList, selectedPhase]);

  const voceFixedExpenses = useMemo(() => {
    return currentExpenses
      .filter(exp => exp.responsible === 'Você')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [currentExpenses]);

  const elaFixedExpenses = useMemo(() => {
    return currentExpenses
      .filter(exp => exp.responsible === 'Ela')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [currentExpenses]);

  const despesasTotaisConjuntas = voceFixedExpenses + elaFixedExpenses;

  // Emergency Reserve Calculations
  const emergencyTargetValue = despesasTotaisConjuntas * emergencyTargetMonths;
  const emergencyPct = emergencyTargetValue > 0 ? Math.min(100, (emergencyCurrent / emergencyTargetValue) * 100).toFixed(1) : 0;

  // Early Payoff Calculations
  // Estimated fixed-payment amortization (Price model), not a bank settlement quote.
  const loanBalance = Math.max(0, Number(earlyPayoff.balance) || 0);
  const loanMonths = Math.max(1, Math.floor(Number(earlyPayoff.remainingMonths) || 1));
  const loanMonthlyRate = Math.max(0, Number(earlyPayoff.ratePct) || 0) / 100;
  const loanDiscount = Math.min(100, Math.max(0, Number(earlyPayoff.discountPct) || 0)) / 100;
  const loanPayment = loanMonthlyRate > 0
    ? loanBalance * loanMonthlyRate / (1 - Math.pow(1 + loanMonthlyRate, -loanMonths))
    : loanBalance / loanMonths;
  const earlyPayoffNormalCost = loanPayment * loanMonths;
  const earlyPayoffDiscounted = loanBalance * (1 - loanDiscount);
  const earlyPayoffSavings = Math.max(0, earlyPayoffNormalCost - earlyPayoffDiscounted);

  // Potes and Surplus Calculations
  const vocePote = voceAporte;
  const elaPote = currentPhaseData.elaPote || 250;
  const poteTotalConjunto = vocePote + elaPote;

  const diretoSobraVoce = voceIncome - voceFixedExpenses - voceAporte;
  const diretoSobraEla = elaIncome - elaFixedExpenses - elaPote;

  const poolMesadaCada = (rendaTotalConjunta - despesasTotaisConjuntas - poteTotalConjunto) / 2;

  // Expense Category Breakdown for Rosette Chart
  const expenseCategoryBreakdown = useMemo(() => {
    const map = {};
    currentExpenses.forEach(exp => {
      const cat = exp.category || 'Outros';
      map[cat] = (map[cat] || 0) + (Number(exp.amount) || 0);
    });
    return Object.keys(map).map(cat => ({
      name: cat,
      value: map[cat]
    }));
  }, [currentExpenses]);

  // Phase Comparison Data
  const phaseComparisonData = useMemo(() => {
    const getPhaseSurplus = (phaseNum) => {
      const phaseExps = expensesList.filter(exp => {
        if (exp.phase === 'Todas') return true;
        if (phaseNum === 1 && exp.phase === 'Fase 1') return true;
        if (phaseNum === 2 && exp.phase === 'Fase 2') return true;
        if (phaseNum === 3 && exp.phase === 'Fase 3') return true;
        return false;
      });

      const vExp = phaseExps.filter(e => e.responsible === 'Você').reduce((a, c) => a + (Number(c.amount) || 0), 0);
      const eExp = phaseExps.filter(e => e.responsible === 'Ela').reduce((a, c) => a + (Number(c.amount) || 0), 0);
      const vInc = voceIncome;
      const eInc = elaIncome;
      const phaseConfig = PHASES_INFO[phaseNum] || PHASES_INFO[1];
      const aporteVoce = Number(voceAporte) || 0;
      const aporteEla = Number(phaseConfig.elaPote) || 0;

      return {
        voceSobra: vInc - vExp - aporteVoce,
        elaSobra: eInc - eExp - aporteEla
      };
    };

    const f1 = getPhaseSurplus(1);
    const f2 = getPhaseSurplus(2);
    const f3 = getPhaseSurplus(3);

    return [
      { phaseLabel: 'Fase 1', 'Divisão Direta (Sobra Você)': f1.voceSobra, 'Divisão Direta (Sobra Ela)': f1.elaSobra },
      { phaseLabel: 'Fase 2', 'Divisão Direta (Sobra Você)': f2.voceSobra, 'Divisão Direta (Sobra Ela)': f2.elaSobra },
      { phaseLabel: 'Fase 3', 'Divisão Direta (Sobra Você)': f3.voceSobra, 'Divisão Direta (Sobra Ela)': f3.elaSobra }
    ];
  }, [expensesList, voceIncome, elaIncome, voceAporte]);

  // Portfolio Total Value & Category Breakdown
  const totalPortfolioValue = useMemo(() => {
    return portfolioAssets.reduce((acc, curr) => {
      return acc + ((curr.qtdAdquirida || 0) * (curr.precoAtual || 0));
    }, 0);
  }, [portfolioAssets]);

  const portfolioCategoryValues = useMemo(() => {
    let rf = 0, acoes = 0, fiis = 0;
    portfolioAssets.forEach(a => {
      const val = (a.qtdAdquirida || 0) * (a.precoAtual || 0);
      if (a.categoryType === 'renda-fixa') rf += val;
      else if (a.categoryType === 'acao') acoes += val;
      else fiis += val;
    });
    return { rendaFixa: rf, acoes, fiis };
  }, [portfolioAssets]);

  // Portfolio Rebalancing Suggestions for the Monthly Deposit
  const rebalanceSuggestions = useMemo(() => {
    const depositToDeploy = Math.max(0, Number(voceAporte) || 0);
    const desired = [targetWeights.rendaFixa, targetWeights.acoes, targetWeights.fiis].map(v => Math.max(0, Number(v) || 0));
    const totalTarget = desired.reduce((sum, value) => sum + value, 0);
    const [targetRfPct, targetAcoesPct, targetFiisPct] = totalTarget > 0
      ? desired.map(value => value / totalTarget)
      : [0.3, 0.3, 0.4];

    const futureTotal = totalPortfolioValue + depositToDeploy;

    const targetRfVal = futureTotal * targetRfPct;
    const targetAcoesVal = futureTotal * targetAcoesPct;
    const targetFiisVal = futureTotal * targetFiisPct;

    const gapRf = Math.max(0, targetRfVal - portfolioCategoryValues.rendaFixa);
    const gapAcoes = Math.max(0, targetAcoesVal - portfolioCategoryValues.acoes);
    const gapFiis = Math.max(0, targetFiisVal - portfolioCategoryValues.fiis);

    const totalGap = gapRf + gapAcoes + gapFiis;

    let allocRf = 0, allocAcoes = 0, allocFiis = 0;
    if (totalGap > 0) {
      allocRf = (gapRf / totalGap) * depositToDeploy;
      allocAcoes = (gapAcoes / totalGap) * depositToDeploy;
      allocFiis = (gapFiis / totalGap) * depositToDeploy;
    } else {
      allocRf = depositToDeploy * targetRfPct;
      allocAcoes = depositToDeploy * targetAcoesPct;
      allocFiis = depositToDeploy * targetFiisPct;
    }

    const roundedRf = Math.round(allocRf * 100) / 100;
    const roundedAcoes = Math.round(allocAcoes * 100) / 100;
    const roundedFiis = Math.round((depositToDeploy - roundedRf - roundedAcoes) * 100) / 100;
    return {
      depositToDeploy,
      allocRf: roundedRf,
      allocAcoes: roundedAcoes,
      allocFiis: Math.max(0, roundedFiis)
    };
  }, [totalPortfolioValue, portfolioCategoryValues, targetWeights, voceAporte]);

  // 30-Year Step-Up Simulation Data
  const investmentSimulationData = useMemo(() => {
    const data = [];
    let currentPatrimony = totalPortfolioValue;
    let accumulatedDeposits = totalPortfolioValue;

    const monthlyRate = Math.pow(1 + simYield / 100, 1 / 12) - 1;

    for (let y = 1; y <= simYears; y++) {
      const rawContribution = initialContribution + (y - 1) * annualStepUp;
      const monthlyContrib = Math.min(rawContribution, maxMonthlyContribution);

      for (let m = 1; m <= 12; m++) {
        currentPatrimony = currentPatrimony * (1 + monthlyRate) + monthlyContrib;
        accumulatedDeposits += monthlyContrib;
      }

      const estimatedDividendRate = Math.max(0, Number(dividendYieldPct) || 0) / 100;
      const monthlyDividend = currentPatrimony * estimatedDividendRate;

      data.push({
        year: `Ano ${y}`,
        patrimony: Math.round(currentPatrimony),
        totalDeposited: Math.round(accumulatedDeposits),
        monthlyContribution: monthlyContrib,
        monthlyDividend: Math.round(monthlyDividend)
      });
    }

    return data;
  }, [simYield, dividendYieldPct, simYears, initialContribution, annualStepUp, maxMonthlyContribution, totalPortfolioValue]);

  // Snowball Milestones Data
  const snowballMilestones = useMemo(() => {
    const targets = [
      { label: 'R$ 500/mês Dividendos', targetDiv: 500 },
      { label: 'R$ 1.000/mês Dividendos', targetDiv: 1000 },
      { label: 'R$ 2.000/mês Dividendos', targetDiv: 2000 },
      { label: 'R$ 5.000/mês Dividendos', targetDiv: 5000 }
    ];

    const divRate = Math.max(0, Number(dividendYieldPct) || 0) / 100;
    const monthlyYield = Math.pow(1 + simYield / 100, 1 / 12) - 1;

    return targets.map(item => {
      const targetPatrimony = divRate > 0 ? item.targetDiv / divRate : Infinity;
      
      let patWith = totalPortfolioValue;
      let monthsWith = 0;
      while (patWith < targetPatrimony && monthsWith < 600) {
        monthsWith++;
        const currentYear = Math.floor((monthsWith - 1) / 12) + 1;
        const contrib = Math.min(initialContribution + (currentYear - 1) * annualStepUp, maxMonthlyContribution);
        patWith = patWith * (1 + monthlyYield) + contrib;
      }
      const yearsWith = (monthsWith / 12).toFixed(1);

      let patWithout = totalPortfolioValue;
      let monthsWithout = 0;
      while (patWithout < targetPatrimony && monthsWithout < 1200) {
        monthsWithout++;
        const currentYear = Math.floor((monthsWithout - 1) / 12) + 1;
        const contrib = Math.min(initialContribution + (currentYear - 1) * annualStepUp, maxMonthlyContribution);
        patWithout += contrib;
      }
      const yearsWithout = (monthsWithout / 12).toFixed(1);
      const savedYears = Math.max(0, (parseFloat(yearsWithout) - parseFloat(yearsWith))).toFixed(1);

      return {
        label: item.label,
        target: item.targetDiv,
        yearsWith,
        yearsWithout,
        savedYears
      };
    });
  }, [simYield, dividendYieldPct, initialContribution, annualStepUp, maxMonthlyContribution, totalPortfolioValue]);

  // Realized Deposits Handlers
  const handleAddDeposit = (e) => {
    e.preventDefault();
    if (!newDepAmount || Number(newDepAmount) <= 0) return;
    const newDep = {
      id: `dep-${Date.now()}`,
      monthYear: newDepMonth || 'Mês Atual',
      amount: Number(newDepAmount),
      notes: newDepNotes || 'Aporte realizado'
    };
    setRealizedDeposits([...realizedDeposits, newDep]);
    setNewDepAmount('');
    setNewDepNotes('');
  };

  const handleDeleteDeposit = (id) => {
    setRealizedDeposits(realizedDeposits.filter(d => d.id !== id));
  };

  // Subscriptions Handlers
  const handleAddSub = (e) => {
    e.preventDefault();
    if (!newSub.name?.trim() || !Number.isFinite(Number(newSub.amount)) || Number(newSub.amount) <= 0) { alert('Informe uma descrição e um valor maior que zero.'); return; }
    const item = {
      id: `sub-${Date.now()}`,
      name: newSub.name,
      amount: Number(newSub.amount),
      category: newSub.category || 'Geral',
      cardId: newSub.cardId || targetCardForModal
    };
    setCardSubs([...cardSubs, item]);
    setNewSub({ name: '', amount: '', category: 'Geral', cardId: targetCardForModal });
    setIsSubModalOpen(false);
  };

  const handleDeleteSub = (id) => {
    setCardSubs(cardSubs.filter(s => s.id !== id));
  };

  // Incomes Handlers
  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!newInc.description?.trim() || !Number.isFinite(Number(newInc.amount)) || Number(newInc.amount) <= 0) { alert('Informe uma descrição e um recebimento maior que zero.'); return; }
    const item = {
      id: `inc-${Date.now()}`,
      description: newInc.description,
      amount: Number(newInc.amount),
      date: newInc.date || getLocalDateString(),
      responsible: newInc.responsible || 'Você',
      isReceived: Boolean(newInc.isReceived)
    };
    setIncomesList([...incomesList, item]);
    setNewInc({ description: '', amount: '', date: getLocalDateString(), responsible: 'Você', isReceived: false });
    setIsIncomeModalOpen(false);
  };

  const handleStartEditIncome = (inc) => {
    setEditingIncomeId(inc.id);
    setEditingIncomeDesc(inc.description);
    setEditingIncomeAmount(inc.amount.toString());
    setEditingIncomeDate(inc.date);
    setEditingIncomeResp(inc.responsible);
  };

  const handleSaveEditIncome = (id) => {
    setIncomesList(incomesList.map(i => {
      if (i.id === id) {
        return {
          ...i,
          description: editingIncomeDesc,
          amount: Math.max(0, Number(editingIncomeAmount) || 0),
          date: editingIncomeDate,
          responsible: editingIncomeResp
        };
      }
      return i;
    }));
    setEditingIncomeId(null);
  };

  const handleDeleteIncome = (id) => {
    const entry = incomesList.find(item => item.id === id);
    if (entry?.recurringRuleId) setRecurringSkipped(prev => [...new Set([...prev, id])]);
    setIncomesList(prev => prev.filter(i => i.id !== id));
  };

  const handleToggleIncomeReceived = (id) => {
    setIncomesList(prev => prev.map(inc => inc.id === id ? { ...inc, isReceived: inc.isReceived !== true } : inc));
  };

  // Expenses Handlers
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExp.description?.trim() || !Number.isFinite(Number(newExp.amount)) || Number(newExp.amount) <= 0) { alert('Informe uma descrição e uma despesa maior que zero.'); return; }
    const item = {
      id: `exp-${Date.now()}`,
      description: newExp.description,
      amount: Number(newExp.amount),
      category: newExp.category || 'Moradia',
      responsible: newExp.responsible || 'Você',
      phase: newExp.phase || 'Todas'
    };
    setExpensesList([...expensesList, item]);
    setNewExp({ description: '', amount: '', category: 'Moradia', responsible: 'Você', phase: 'Todas' });
    setIsModalOpen(false);
  };

  const handleStartEdit = (exp) => {
    setEditingId(exp.id);
    setEditingDesc(exp.description);
    setEditingAmount(exp.amount.toString());
  };

  const handleSaveEdit = (id) => {
    setExpensesList(expensesList.map(e => {
      if (e.id === id) {
        return { ...e, description: editingDesc, amount: Math.max(0, Number(editingAmount) || 0) };
      }
      return e;
    }));
    setEditingId(null);
  };

  const handleDeleteExpense = (id) => {
    setExpensesList(expensesList.filter(e => e.id !== id));
  };

  // Asset Purchase Handler
  const handleRecordPurchase = (e) => {
    e.preventDefault();
    if (!buyForm.assetId || !Number.isFinite(Number(buyForm.quantity)) || Number(buyForm.quantity) <= 0 || !Number.isFinite(Number(buyForm.price)) || Number(buyForm.price) <= 0) { alert('Quantidade e preço devem ser maiores que zero.'); return; }
    const qty = Number(buyForm.quantity);
    const pricePaid = Number(buyForm.price);

    setPortfolioAssets(portfolioAssets.map(asset => {
      if (asset.id === buyForm.assetId) {
        const currentQtd = asset.qtdAdquirida || 0;
        const currentPM = asset.precoMedio || 0;
        const newTotalQtd = currentQtd + qty;
        const newPM = newTotalQtd > 0 ? ((currentQtd * currentPM) + (qty * pricePaid)) / newTotalQtd : 0;
        return {
          ...asset,
          qtdAdquirida: newTotalQtd,
          precoMedio: Number(newPM.toFixed(2))
        };
      }
      return asset;
    }));

    setBuyForm({ assetId: '', quantity: '', price: '' });
    setIsBuyModalOpen(false);
  };

  const handleUpdateAssetQtd = (assetId, newQtd) => {
    const val = Math.max(0, Number(newQtd) || 0);
    setPortfolioAssets(prev => prev.map(a => a.id === assetId ? { ...a, qtdAdquirida: val } : a));
  };

  const handleUpdateAssetPrice = (assetId, field, newPrice) => {
    const val = Math.max(0, Number(newPrice) || 0);
    setPortfolioAssets(prev => prev.map(a => a.id === assetId ? { ...a, [field]: val } : a));
  };

  // Include new assets without editing source code or committing household holdings to GitHub.
  const handleAddAsset = (event) => {
    event.preventDefault();
    const ticker = newAsset.ticker.trim().toUpperCase();
    const planned = Number(newAsset.qtdPlanejada);
    const estimated = Number(newAsset.precoEstimado);
    if (!ticker || !newAsset.name.trim() || !Number.isFinite(planned) || planned < 0 || !Number.isFinite(estimated) || estimated < 0) {
      alert('Informe código, nome e números válidos.');
      return;
    }
    if (portfolioAssets.some(a => a.ticker.toUpperCase() === ticker)) {
      alert('Já existe um ativo com esse código.');
      return;
    }
    const category = newAsset.categoryType === 'acao' ? 'Ação' : newAsset.categoryType === 'renda-fixa' ? 'Renda Fixa' : 'FII';
    setPortfolioAssets(prev => [...prev, { id: `asset-${Date.now()}`, ticker, name: newAsset.name.trim(), category, categoryType: newAsset.categoryType, qtdPlanejada: planned, precoEstimado: estimated, qtdAdquirida: 0, precoMedio: 0, precoAtual: estimated }]);
    setNewAsset({ ticker: '', name: '', categoryType: 'acao', qtdPlanejada: '0', precoEstimado: '0' });
    setIsAssetModalOpen(false);
  };

  const handleDeleteAsset = (id) => {
    const asset = portfolioAssets.find(a => a.id === id);
    if (!asset || !window.confirm(`Excluir ${asset.ticker} da carteira?`)) return;
    setPortfolioAssets(prev => prev.filter(a => a.id !== id));
  };

  // Goals Handlers
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalForm.title?.trim() || !Number.isFinite(Number(newGoalForm.target)) || Number(newGoalForm.target) <= 0) { alert('Informe um nome e um valor de meta maior que zero.'); return; }
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalForm.title,
      target: Number(newGoalForm.target),
      category: 'Patrimônio'
    };
    setGoalsList([...goalsList, newGoal]);
    setNewGoalForm({ title: '', target: '' });
    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = (id) => {
    setGoalsList(goalsList.filter(g => g.id !== id));
  };

  // Export full backup to JSON file
  const handleExportBackup = () => {
    const backupData = {
      cardSubs, portfolioAssets, goalsList, incomesList, expensesList, paymentChecklist,
      simYield, dividendYieldPct, simYears, initialContribution, annualStepUp, maxMonthlyContribution,
      realizedDeposits, selectedPhase, selectedMonth, activeTab, creditCards, voceAporte, emergencyCurrent, emergencyTargetMonths, targetWeights, earlyPayoff,
      recurringRules, recurringSkipped, schemaVersion: 4,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `financeiro_casal_backup_${getLocalDateString()}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Import full backup from JSON file
  const handleImportBackup = (event) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = validateFinanceBackup(JSON.parse(e.target.result));
          if (!window.confirm(`Restaurar o backup com ${parsed.incomesList.length} receitas, ${parsed.expensesList.length} despesas e ${parsed.paymentChecklist.length} pagamentos? Isso substituirá os dados atuais neste navegador.`)) return;
          if (parsed.recurringRules) setRecurringRules(parsed.recurringRules);
          else setRecurringRules([]);
          if (parsed.recurringSkipped) setRecurringSkipped(parsed.recurringSkipped);
          else setRecurringSkipped([]);
          if (parsed.cardSubs) setCardSubs(parsed.cardSubs);
          if (parsed.portfolioAssets) setPortfolioAssets(parsed.portfolioAssets);
          if (parsed.goalsList) setGoalsList(parsed.goalsList);
          if (parsed.incomesList) setIncomesList(parsed.incomesList);
          if (parsed.expensesList) setExpensesList(parsed.expensesList);
          if (parsed.paymentChecklist) setPaymentChecklist(parsed.paymentChecklist);
          if (parsed.simYield !== undefined) setSimYield(parsed.simYield);
          if (parsed.dividendYieldPct !== undefined) setDividendYieldPct(parsed.dividendYieldPct);
          if (parsed.simYears !== undefined) setSimYears(parsed.simYears);
          if (parsed.initialContribution !== undefined) setInitialContribution(parsed.initialContribution);
          if (parsed.annualStepUp !== undefined) setAnnualStepUp(parsed.annualStepUp);
          if (parsed.maxMonthlyContribution !== undefined) setMaxMonthlyContribution(parsed.maxMonthlyContribution);
          if (parsed.realizedDeposits) setRealizedDeposits(parsed.realizedDeposits);
          setCreditCards(reconcileCreditCards(parsed.creditCards));
          if (parsed.voceAporte !== undefined) setVoceAporte(parsed.voceAporte);
          if (parsed.emergencyCurrent !== undefined) setEmergencyCurrent(parsed.emergencyCurrent);
          if (parsed.emergencyTargetMonths !== undefined) setEmergencyTargetMonths(parsed.emergencyTargetMonths);
          if (parsed.targetWeights) setTargetWeights(parsed.targetWeights);
          if (parsed.earlyPayoff) setEarlyPayoff(parsed.earlyPayoff);
          if (parsed.selectedPhase !== undefined) setSelectedPhase(parsed.selectedPhase);
          if (parsed.selectedMonth) setSelectedMonth(parsed.selectedMonth);
          if (parsed.activeTab) setActiveTab(parsed.activeTab);
        } catch (err) {
          console.error('Erro ao importar backup:', err);
          alert(`Não foi possível importar o backup. ${err.message || 'Arquivo incompatível.'}`);
        }
      };
      fileReader.onloadend = () => { event.target.value = ''; };
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('ATENÇÃO: deseja apagar seus lançamentos locais e voltar ao modelo vazio? Exporte um backup JSON antes de continuar.')) {
      setCardSubs(INITIAL_CREDIT_CARD_SUBSCRIPTIONS);
      setRecurringRules([]);
      setRecurringSkipped([]);
      setPortfolioAssets(INITIAL_PORTFOLIO_ASSETS);
      setGoalsList(INITIAL_GOALS);
      setIncomesList(INITIAL_INCOMES);
      setExpensesList(INITIAL_EXPENSES);
      setPaymentChecklist(INITIAL_PAYMENT_SCHEDULE);
      setCreditCards(INITIAL_CARDS);
      setVoceAporte(450.00);
      setEmergencyCurrent(0);
      setEmergencyTargetMonths(6);
      setTargetWeights({ rendaFixa: 30, acoes: 30, fiis: 40 });
      setSimYield(10);
      setDividendYieldPct(0.7);
      setSimYears(30);
      setInitialContribution(450);
      setAnnualStepUp(250);
      setMaxMonthlyContribution(1600);
      setRealizedDeposits([]);
      setEarlyPayoff({ name: 'Dívida / Financiamento', balance: 0, ratePct: 0, remainingMonths: 12, discountPct: 0 });
      setSelectedPhase(1);
      setSelectedMonth(getLocalMonthString());
    }
  };


  return (
    <div className="min-h-screen bg-[#07111F] text-[#E2E8F0] font-sans p-4 sm:p-6 lg:p-8">
      {/* CABEÇALHO DA APLICAÇÃO */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#121F31]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <ZapIcon className="w-7 h-7 text-[#2DD4BF]" />
              NÓS | Financeiro
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 text-[#2DD4BF] rounded-full">
              {currentPhaseData.title.split(':')[0]}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Seu espaço para organizar o presente e planejar o futuro, juntos.
          </p>
        </div>

        {/* FERRAMENTAS DE BACKUP E SALVAMENTO */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-right hidden lg:block mr-2">
            <span className="text-[10px] text-emerald-400 font-bold block flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ✓ Salvo às {lastSaved || 'agora'}
            </span>
            <span className="text-[10px] text-[#94A3B8]">Armazenado apenas neste navegador • Faça backups regularmente</span>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121F31] hover:bg-[#214054] border border-[#294357] text-white text-xs font-semibold rounded-xl transition-all"
            title="Baixar arquivo JSON com todos os seus dados"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
            Backup (JSON)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121F31] hover:bg-[#214054] border border-[#294357] text-white text-xs font-semibold rounded-xl transition-all"
            title="Importar arquivo de backup salvo"
          >
            <UploadIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
            Carregar
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121F31] hover:bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold rounded-xl transition-all"
            title="Limpar os dados locais e reiniciar"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            Restaurar
          </button>
        </div>
      </header>

      {incomesList.length === 0 && expensesList.length === 0 && paymentChecklist.length === 0 && (
        <section className="max-w-7xl mx-auto mt-5 rounded-2xl border border-teal-500/30 bg-teal-500/10 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-teal-200 text-sm font-bold">Bem-vindos ao novo painel ✦</p>
            <p className="text-slate-300 text-xs mt-1">Se já tinham lançamentos no Google Sites, restaurem seu backup JSON aqui. Nenhum dado pessoal foi incluído no código publicado.</p>
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="whitespace-nowrap rounded-xl bg-teal-400 px-4 py-2.5 text-xs font-black text-[#07111F] hover:bg-teal-300 transition-colors">Importar meu backup</button>
        </section>
      )}
      {/* NAVEGAÇÃO */}
      <nav className="max-w-7xl mx-auto my-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#121F31]">
        {[
          { id: 'dashboard', label: 'Dashboard Principal', Icon: BarChartIcon },
          { id: 'recebimentos', label: 'Recebimentos (Entradas)', Icon: WalletIcon },
          { id: 'recorrencias', label: 'Recorrências', Icon: RefreshIcon },
          { id: 'despesas', label: 'Mestre de Despesas', Icon: FileTextIcon },
          { id: 'cronograma', label: 'Cronograma & Checklist', Icon: CheckIcon },
          { id: 'investimentos', label: 'Investimentos & Step-Up (30 Anos)', Icon: TrendingUpIcon },
          { id: 'carteira', label: 'Carteira de Investimentos', Icon: BriefcaseIcon },
          { id: 'metas', label: 'Metas de Investimentos', Icon: TargetIcon },
          { id: 'comparativo', label: 'Comparativo de Modelos', Icon: UsersIcon },
          { id: 'relatorio', label: 'Relatório Executivo', Icon: PrinterIcon }
        ].map((tab) => {
          const IconComponent = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2DD4BF] text-white shadow-lg shadow-[#2DD4BF]/25'
                  : 'bg-[#121F31]/80 text-[#94A3B8] hover:text-[#E2E8F0] border border-[#294357]'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <section className="max-w-7xl mx-auto mb-5 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between bg-[#0E1C2E] border border-[#294357] rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-300" htmlFor="selected-month">Mês de referência</label>
          <input id="selected-month" type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-[#07111F] border border-[#294357] text-white rounded-lg px-3 py-2 text-sm" />
          <span className="text-[10px] text-slate-500">Controle por mês. Contas fixas do planejamento continuam organizadas por fase.</span>
        </div>
        <span className="text-[11px] text-teal-300 font-medium">● Modo local · sem login e sem sincronização entre aparelhos</span>
      </section>

      <section className="max-w-7xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3" aria-label="Indicadores do mês">
        {[
          { label: 'Receitas previstas', value: monthlyCash.plannedIncome, color: 'text-teal-300', note: 'Todos os recebimentos do mês' },
          { label: 'Receitas confirmadas', value: monthlyCash.confirmedIncome, color: 'text-emerald-300', note: 'Marque como recebido na aba de entradas' },
          { label: 'Pagamentos quitados', value: monthlyCash.paidPayments, color: 'text-white', note: 'Contas marcadas como pagas no cronograma' },
          { label: 'Saldo confirmado', value: monthlyCash.confirmedNet, color: monthlyCash.confirmedNet >= 0 ? 'text-emerald-300' : 'text-rose-300', note: 'Confirmados − quitados (não inclui despesas mestre novamente)' }
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl border border-[#294357] bg-[#121F31] p-4 shadow-sm">
            <p className="text-[10px] tracking-widest uppercase font-bold text-slate-400">{kpi.label}</p>
            <p className={`text-xl sm:text-2xl font-black tracking-tight mt-1 ${kpi.color}`}>{fmt(kpi.value)}</p>
            <p className="text-[10px] text-slate-500 mt-2">{kpi.note}</p>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto mb-6 space-y-3" aria-label="Resumo de caixa e alertas">
        <div className="rounded-2xl border border-[#294357] bg-[#0E1C2E] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-white">Planejamento do mês: <span className="text-teal-300">{fmt(monthlyCash.plannedNet)}</span></p>
            <p className="text-[11px] text-slate-400 mt-1">Receitas previstas − pagamentos do cronograma. As despesas mestre são outra visão do mesmo orçamento e não são descontadas novamente.</p>
          </div>
          <button onClick={() => setActiveTab('recorrencias')} type="button" className="shrink-0 px-3 py-2 rounded-lg bg-teal-400/15 text-teal-200 border border-teal-400/30 text-xs font-bold hover:bg-teal-400/25">Gerenciar recorrências</button>
        </div>
        {(warnings.length > 0 || overCommitted.length > 0) && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-100" role="alert">
            <p className="font-black mb-2">Verifique as alocações de receitas</p>
            <ul className="space-y-1 list-disc pl-4">
              {overCommitted.map(inc => <li key={inc.id}>“{inc.description}”: alocados {fmt(inc.totalAllocated)} para uma receita de {fmt(inc.amount)}.</li>)}
              {warnings.slice(0, 6).map((warning, index) => <li key={index}>{warning}</li>)}
            </ul>
          </div>
        )}
      </section>

      {/* CONTAINER DE CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto space-y-6">

        {/* ==================================================================== */}
        {/* TAB 1: DASHBOARD PRINCIPAL */}
        {/* ==================================================================== */}
        {activeTab === 'dashboard' && (
          <section className="space-y-6">
            <div className="bg-[#121F31] rounded-2xl border border-[#294357] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-white">Evolução financeira • últimos 12 meses</h2>
                  <p className="text-xs text-slate-400 mt-1">Dados do cronograma e recebimentos já registrados. “Confirmado” depende de marcar as entradas como recebidas.</p>
                </div>
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#07111F] text-teal-200">Sem duplicar despesas fixas</span>
              </div>
              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} margin={{ top: 6, right: 6, bottom: 3, left: 0 }}>
                    <CartesianGrid stroke="#26364B" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={55} tickFormatter={value => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value, name) => [fmt(value), name]} contentStyle={{ background: '#0E1C2E', borderColor: '#294357', borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="plannedIncome" name="Receita prevista" fill="#38BDF8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="confirmedIncome" name="Receita confirmada" fill="#2DD4BF" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="paidPayments" name="Pagamentos quitados" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* SELETOR DE FASES DE PLANEJAMENTO */}
            <div className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#E2E8F0] uppercase tracking-wider">Selecione a Fase Atual</h2>
                  <p className="text-xs text-[#94A3B8]">{currentPhaseData.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePhaseChange(p)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        selectedPhase === p
                          ? 'bg-[#2DD4BF] text-white shadow-md shadow-[#2DD4BF]/30'
                          : 'bg-[#07111F] text-[#94A3B8] border border-[#294357] hover:text-white'
                      }`}
                    >
                      Fase {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARD DE CONTROLE DINÂMICO DO APORTE E REAÇÃO AUTOMÁTICA DA RENDA */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#07111F] p-3.5 rounded-xl border border-[#2DD4BF]/30">
                  <span className="text-[10px] font-extrabold uppercase text-[#94A3B8] block">Sua Renda Atual (Entradas)</span>
                  <strong className="text-lg font-black text-emerald-400">{fmt(voceIncome)}</strong>
                  <span className="text-[10px] text-emerald-400/80 block mt-0.5">⚡ Atualiza automático se mudar entradas</span>
                </div>

                <div className="bg-[#07111F] p-3.5 rounded-xl border border-[#294357]">
                  <span className="text-[10px] font-extrabold uppercase text-[#94A3B8] block">Contas Fixas Totais</span>
                  <strong className="text-lg font-black text-rose-400">{fmt(voceFixedExpenses)}</strong>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5">Despesas do seu perfil</span>
                </div>

                <div className="bg-[#07111F] p-3.5 rounded-xl border border-amber-500/40 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 block">Aporte do Mês (Editável)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-amber-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="50"
                      value={voceAporte}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        setVoceAporte(val);
                        setPaymentChecklist(prev => prev.map(item => 
                          item.category === 'Investimentos' || item.description.includes('Aporte') 
                            ? { ...item, amount: val } 
                            : item
                        ));
                      }}
                      className="w-full bg-[#121F31] border border-amber-500/50 text-amber-300 px-2 py-1 rounded-lg text-sm font-black outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[9px] text-amber-400/80 block">Digite quanto vai investir neste mês</span>
                </div>

                <div className="bg-[#07111F] p-3.5 rounded-xl border border-emerald-500/40">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">Sobra Livre no Bolso</span>
                  <strong className="text-lg font-black text-white">{fmt(diretoSobraVoce)}</strong>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">Recalculado instantaneamente!</span>
                </div>
              </div>
            </div>

            {/* NOVO RECURSO 1: RASTREADOR DE RESERVA DE EMERGÊNCIA */}
            <div className="bg-[#121F31] p-5 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#294357] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Meta de Reserva de Emergência (Liquidez Diária)</h3>
                    <p className="text-xs text-[#94A3B8]">Acompanhamento visual de proteção de caixa do casal</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#07111F] px-3 py-1.5 rounded-xl border border-[#294357]">
                  <span className="text-xs text-[#94A3B8] font-semibold">Alvo de Cobertura:</span>
                  {[3, 6, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEmergencyTargetMonths(m)}
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        emergencyTargetMonths === m
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#121F31] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {m} meses
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#07111F] p-3 rounded-xl border border-[#294357] space-y-1">
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Reserva Atual Guardada (Editável)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-emerald-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="100"
                      value={emergencyCurrent}
                      onChange={(e) => setEmergencyCurrent(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full bg-transparent text-sm font-black text-emerald-400 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#07111F] p-3 rounded-xl border border-[#294357]">
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Meta ({emergencyTargetMonths} Meses de Gastos Fixos)</span>
                  <strong className="text-sm font-black text-white">{fmt(emergencyTargetValue)}</strong>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5">Calculado sobre {fmt(despesasTotaisConjuntas)}/mês (despesas cadastradas do casal)</span>
                </div>

                <div className="bg-[#07111F] p-3 rounded-xl border border-[#294357]">
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Falta Guardar</span>
                  <strong className="text-sm font-black text-amber-400">{fmt(Math.max(0, emergencyTargetValue - emergencyCurrent))}</strong>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">{emergencyPct}% concluído!</span>
                </div>
              </div>

              {/* BARRA DE PROGRESSO DA RESERVA */}
              <div className="space-y-1">
                <div className="w-full h-3 bg-[#07111F] rounded-full overflow-hidden border border-[#294357]">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 rounded-full"
                    style={{ width: `${emergencyPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* CARDS DESTACADOS DE CARTÕES DE CRÉDITO COM LIMITES EDITÁVEIS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Gerenciamento de Cartões de Crédito (Limites & Gastos)
                </h3>
                <span className="text-xs text-[#94A3B8]">Ajuste os limites dos cartões de cada um em tempo real</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {creditCards.map((card) => {
                  const cardItems = cardSubs.filter(s => (s.cardId || 'card-1') === card.id);
                  const cardTotal = cardItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                  const cardBuffer = (card.limit || 0) - cardTotal;
                  const pctUsed = card.limit > 0 ? Math.min(100, (cardTotal / card.limit) * 100) : 0;

                  return (
                    <div key={card.id} className="bg-[#121F31] p-5 rounded-2xl border border-[#2DD4BF]/30 space-y-4">
                      <div className="flex flex-wrap items-center justify-between border-b border-[#294357] pb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <CreditCardIcon className="w-5 h-5 text-[#2DD4BF]" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{card.name}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                card.owner === 'Você' ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]' : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {card.owner}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Aumento / Diminuição do limite do cartão */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-[#07111F] px-2.5 py-1 rounded-xl border border-[#294357]">
                            <span className="text-[10px] text-[#94A3B8] font-bold">Limite R$:</span>
                            <input
                              type="number"
                              step="50"
                              value={card.limit}
                              onChange={(e) => handleUpdateCardLimit(card.id, e.target.value)}
                              className="w-20 bg-transparent text-xs font-extrabold text-white outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetCardForModal(card.id);
                              setNewSub({ name: '', amount: '', category: 'Geral', cardId: card.id });
                              setIsSubModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#2DD4BF] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#2DD4BF]/20"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                            + Item
                          </button>
                        </div>
                      </div>

                      {/* BARRA DE CONSUMO DO LIMITE DO CARTÃO */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#94A3B8]">Gasto: <strong className="text-white">{fmt(cardTotal)}</strong> de {fmt(card.limit)}</span>
                          <span className={cardBuffer >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {cardBuffer >= 0 ? `Folga: ${fmt(cardBuffer)}` : `Excedido: ${fmt(Math.abs(cardBuffer))}`}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#07111F] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              cardBuffer >= 0 ? 'bg-gradient-to-r from-[#2DD4BF] to-cyan-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${pctUsed}%` }}
                          />
                        </div>
                      </div>

                      {/* GRID DE ITENS DO CARTÃO */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {cardItems.length === 0 ? (
                          <div className="col-span-2 text-center py-3 text-xs text-[#94A3B8] italic border border-dashed border-[#294357] rounded-xl">
                            Nenhum gasto cadastrado neste cartão.
                          </div>
                        ) : (
                          cardItems.map((sub) => (
                            <div key={sub.id} className="bg-[#07111F] p-2.5 rounded-xl border border-[#294357] flex items-center justify-between">
                              <div>
                                <strong className="text-xs text-white block">{sub.name}</strong>
                                <span className="text-[10px] text-[#94A3B8]">{sub.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#2DD4BF]">{fmt(sub.amount)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSub(sub.id)}
                                  className="text-[#94A3B8] hover:text-rose-400 transition-colors p-1"
                                >
                                  <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GRÁFICOS VISUAIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ROSCA: DISTRIBUIÇÃO DAS DESPESAS POR CATEGORIA */}
              <div className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Composição das Despesas por Categoria ({currentPhaseData.title.split(':')[0]})
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategoryBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        {expenseCategoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0D1527', borderColor: '#2DD4BF', borderRadius: '12px' }}
                        itemStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94A3B8' }}
                        formatter={(val) => [fmt(val), 'Valor']}
                      />
                      <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BARRAS: EVOLUÇÃO DAS SOBRAS LIVRES POR FASE */}
              <div className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Comparativo de Dinheiro Livre no Bolso por Fase
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={phaseComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#294357" />
                      <XAxis dataKey="phaseLabel" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94A3B8" tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0D1527', borderColor: '#2DD4BF', borderRadius: '12px' }}
                        itemStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94A3B8' }}
                        formatter={(val) => [fmt(val), 'Sobra']}
                      />
                      <Bar dataKey="Divisão Direta (Sobra Você)" fill="#2DD4BF" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Divisão Direta (Sobra Ela)" fill="#A855F7" radius={[6, 6, 0, 0]} />
                      <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '11px' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: RECEBIMENTOS (ENTRADAS) */}
        {/* ==================================================================== */}
        {activeTab === 'recebimentos' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121F31] p-5 rounded-2xl border border-[#294357]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <WalletIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Gerenciador de Recebimentos & Lotes de Salário
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Separe o que está previsto do que já entrou na conta. Entradas importadas de backups antigos começam como previstas até você confirmar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIncomeModalOpen(true)}
                className="flex items-center gap-2 bg-[#2DD4BF] hover:bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2DD4BF]/20"
              >
                <PlusIcon className="w-4 h-4" />
                + Adicionar Novo Recebimento
              </button>
            </div>

            {/* KPIS DE RECEITA SEPARADA POR TITULAR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#121F31] p-4 rounded-2xl border border-[#2DD4BF]/40 space-y-1">
                <span className="text-[11px] font-bold uppercase text-[#2DD4BF]">Previsto para você</span>
                <strong className="text-xl font-extrabold text-[#2DD4BF] block">{fmt(voceIncome)}</strong>
                <span className="text-[10px] text-[#94A3B8]">Soma de todas as suas parcelas</span>
              </div>

              <div className="bg-[#121F31] p-4 rounded-2xl border border-purple-500/30 space-y-1">
                <span className="text-[11px] font-bold uppercase text-purple-400">Previsto para ela</span>
                <strong className="text-xl font-extrabold text-purple-400 block">{fmt(elaIncome)}</strong>
                <span className="text-[10px] text-[#94A3B8]">Soma de todas as parcelas dela</span>
              </div>

              <div className="bg-[#121F31] p-4 rounded-2xl border border-emerald-500/30 space-y-1">
                <span className="text-[11px] font-bold uppercase text-emerald-400">Receita prevista conjunta</span>
                <strong className="text-xl font-extrabold text-emerald-400 block">{fmt(rendaTotalConjunta)}</strong>
                <span className="text-[10px] text-[#94A3B8]">Entrada total do casal no mês</span>
              </div>
            </div>

            {/* TABELA DE LOTES DE RECEBIMENTO */}
            <div className="bg-[#121F31] rounded-2xl border border-[#294357] overflow-hidden">
              <div className="p-4 bg-[#0A192A] border-b border-[#294357]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#2DD4BF]" />
                  Lista de Parcelas & Datas de Entrada
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#294357] bg-[#07111F]/50 text-[11px] font-extrabold text-[#94A3B8] uppercase">
                      <th className="p-3.5">Data Prevista</th>
                      <th className="p-3.5">Descrição do Lote</th>
                      <th className="p-3.5">Valor (R$)</th>
                      <th className="p-3.5">Titular</th>
                      <th className="p-3.5">Situação</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#294357] text-xs">
                    {incomesList.map((inc) => (
                      <tr key={inc.id} className="hover:bg-[#152B3B] transition-colors">
                        <td className="p-3.5 text-white font-mono">{inc.date}</td>
                        <td className="p-3.5 text-white font-bold">
                          {editingIncomeId === inc.id ? (
                            <input
                              type="text"
                              value={editingIncomeDesc}
                              onChange={(e) => setEditingIncomeDesc(e.target.value)}
                              className="bg-[#07111F] border border-[#2DD4BF] text-white px-2 py-1 rounded-lg w-full"
                            />
                          ) : (
                            inc.description
                          )}
                        </td>
                        <td className="p-3.5 font-extrabold text-emerald-400">
                          {editingIncomeId === inc.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editingIncomeAmount}
                              onChange={(e) => setEditingIncomeAmount(e.target.value)}
                              className="bg-[#07111F] border border-[#2DD4BF] text-emerald-400 px-2 py-1 rounded-lg w-28"
                            />
                          ) : (
                            fmt(inc.amount)
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inc.responsible === 'Você'
                              ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {inc.responsible}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button type="button" onClick={() => handleToggleIncomeReceived(inc.id)}
                            aria-label={`Alternar recebimento: ${inc.description}`}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${inc.isReceived === true ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'}`}>
                            {inc.isReceived === true ? '✓ Recebido' : '◷ Previsto'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {editingIncomeId === inc.id ? (
                            <button
                              type="button"
                              onClick={() => handleSaveEditIncome(inc.id)}
                              className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                            >
                              Salvar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEditIncome(inc)}
                              className="text-[#94A3B8] hover:text-[#2DD4BF] transition-colors"
                            >
                              <EditIcon className="w-4 h-4 inline" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteIncome(inc.id)}
                            className="text-[#94A3B8] hover:text-rose-400 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'recorrencias' && (
          <section className="space-y-5">
            <div className="p-5 rounded-2xl border border-teal-500/30 bg-[#121F31]">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2"><RefreshIcon className="w-5 h-5 text-teal-300" /> Contas e receitas recorrentes</h2>
                  <p className="text-xs text-slate-400 mt-1">Uma regra cria automaticamente um lançamento ao visitar cada mês, sem duplicações. O pagamento ou recebimento só vira realizado quando você confirmar.</p>
                </div>
                <span className="text-xs text-teal-200 border border-teal-500/30 rounded-full px-3 py-1">{recurringRules.filter(x => x.enabled).length} ativas</span>
              </div>
              <form onSubmit={handleAddRecurring} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <label className="text-xs text-slate-400">Tipo
                  <select value={newRecurring.type} onChange={e => setNewRecurring(prev => ({...prev,type:e.target.value}))} className="block mt-1 w-full p-2.5 rounded-xl bg-[#07111F] border border-[#294357] text-white">
                    <option value="income">Receita mensal</option><option value="payment">Conta mensal</option>
                  </select>
                </label>
                <label className="text-xs text-slate-400">Descrição
                  <input required maxLength={250} value={newRecurring.description} onChange={e => setNewRecurring(prev => ({...prev,description:e.target.value}))} placeholder="Ex.: Salário, aluguel" className="block mt-1 w-full p-2.5 rounded-xl bg-[#07111F] border border-[#294357] text-white" />
                </label>
                <label className="text-xs text-slate-400">Valor (R$)
                  <input required type="number" min="0.01" step="0.01" value={newRecurring.amount} onChange={e => setNewRecurring(prev => ({...prev,amount:e.target.value}))} className="block mt-1 w-full p-2.5 rounded-xl bg-[#07111F] border border-[#294357] text-white" />
                </label>
                <label className="text-xs text-slate-400">Dia do mês
                  <input required type="number" min="1" max="31" value={newRecurring.day} onChange={e => setNewRecurring(prev => ({...prev,day:e.target.value}))} className="block mt-1 w-full p-2.5 rounded-xl bg-[#07111F] border border-[#294357] text-white" />
                </label>
                <label className="text-xs text-slate-400">A partir do mês
                  <input required type="month" value={newRecurring.startMonth} onChange={e => setNewRecurring(prev => ({...prev,startMonth:e.target.value}))} className="block mt-1 w-full p-2.5 rounded-xl bg-[#07111F] border border-[#294357] text-white" />
                </label>
                {newRecurring.type === 'income' ? (
                  <label className="text-xs text-slate-400">Responsável
                    <select value={newRecurring.responsible} onChange={e => setNewRecurring(prev => ({...prev,responsible:e.target.value}))} className="block mt-1 w-full p-2.5 rounded-xl bg-[#07111F] border border-[#294357] text-white"><option>Você</option><option>Ela</option></select>
                  </label>
                ) : (
                  <label className="text-xs text-slate-400">Categoria
                    <select value={newRecurring.category} onChange={e => setNewRecurring(prev => ({...prev,category:e.target.value}))} className="block mt-1 w-full p-2.5 rounded-xl bg-[#07111F] border border-[#294357] text-white">
                      {['Moradia','Alimentação','Educação','Transporte','Dívidas','Cartão','Investimentos','Outros'].map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </label>
                )}
                <button type="submit" className="lg:col-span-2 px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-[#07111F] font-black text-xs">+ Adicionar recorrência</button>
              </form>
              <p className="mt-3 text-[11px] text-amber-200/90">Se uma conta já foi cadastrada manualmente neste mês, confira antes de adicionar a regra para não registrar duas vezes. Contas aqui aparecem no cronograma; despesas mestre continuam apenas no planejamento por fase.</p>
            </div>
            <div className="bg-[#121F31] rounded-2xl border border-[#294357] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#294357] flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Regras cadastradas</h3>
                <span className="text-xs text-slate-400">{recurringRules.length} regras</span>
              </div>
              {recurringRules.length === 0 ? <p className="p-5 text-xs text-slate-400">Nenhuma recorrência cadastrada. Adicione uma regra para começar.</p> : (
                <div className="divide-y divide-[#294357]">
                  {recurringRules.map(rule => (
                    <div key={rule.id} className="px-5 py-4 flex flex-wrap items-center gap-3 justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">{rule.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{rule.type === 'income' ? 'Entrada' : 'Pagamento'} • {fmt(rule.amount)} • dia {rule.day} • desde {rule.startMonth}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setRecurringRules(prev => prev.map(x => x.id === rule.id ? {...x, enabled: !x.enabled} : x))}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${rule.enabled ? 'border-emerald-400/40 text-emerald-200 bg-emerald-500/10' : 'border-slate-500 text-slate-300'}`}>
                          {rule.enabled ? 'Ativa' : 'Pausada'}
                        </button>
                        <button type="button" onClick={() => handleRemoveRecurring(rule.id)} aria-label={`Excluir recorrência ${rule.description}`} className="text-rose-300 text-xs border border-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-900/30">Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: MESTRE DE DESPESAS */}
        {/* ==================================================================== */}
        {activeTab === 'despesas' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121F31] p-5 rounded-2xl border border-[#294357]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Mestre de Despesas & Contas Fixas
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Edite valores, reatribua responsáveis ou cadastre novas contas do planejamento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#2DD4BF] hover:bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2DD4BF]/20"
              >
                <PlusIcon className="w-4 h-4" />
                + Adicionar Nova Despesa
              </button>
            </div>

            {/* NOVO RECURSO 2: SIMULADOR DE QUITAÇÃO ANTECIPADA (ECONOMIA DE JUROS) */}
            <div className="bg-[#121F31] p-5 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-[#294357] pb-3">
                <div className="flex items-center gap-2">
                  <CalculatorIcon className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Simulador de Quitação Antecipada (estimativa Price)</h3>
                    <p className="text-xs text-[#94A3B8]">Calcule quanto você economiza em R$ ao adiantar parcelas ou liquidar saldos</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full">
                  Economia Real
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Saldo Devedor R$</label>
                  <input
                    type="number"
                    step="10"
                    value={earlyPayoff.balance}
                    onChange={(e) => setEarlyPayoff({ ...earlyPayoff, balance: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full bg-[#07111F] border border-[#294357] text-xs font-bold text-white px-3 py-2 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Taxa Juros Mensal %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={earlyPayoff.ratePct}
                    onChange={(e) => setEarlyPayoff({ ...earlyPayoff, ratePct: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full bg-[#07111F] border border-[#294357] text-xs font-bold text-white px-3 py-2 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Meses Restantes</label>
                  <input
                    type="number"
                    value={earlyPayoff.remainingMonths}
                    onChange={(e) => setEarlyPayoff({ ...earlyPayoff, remainingMonths: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-full bg-[#07111F] border border-[#294357] text-xs font-bold text-white px-3 py-2 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Desconto Quitação %</label>
                  <input
                    type="number"
                    step="1"
                    value={earlyPayoff.discountPct}
                    onChange={(e) => setEarlyPayoff({ ...earlyPayoff, discountPct: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full bg-[#07111F] border border-[#294357] text-xs font-bold text-amber-400 px-3 py-2 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#07111F] p-3 rounded-xl border border-[#294357]">
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Custo Mantendo Parcelas</span>
                  <strong className="text-sm font-black text-rose-400">{fmt(earlyPayoffNormalCost)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Valor com Quitação Antecipada</span>
                  <strong className="text-sm font-black text-white">{fmt(earlyPayoffDiscounted)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">⚡ Economia Direta no Bolso</span>
                  <strong className="text-sm font-black text-emerald-400">{fmt(earlyPayoffSavings)}</strong>
                </div>
              </div>
            </div>

            {/* TABELA DE DESPESAS MESTRES */}
            <div className="bg-[#121F31] rounded-2xl border border-[#294357] overflow-hidden">
              <div className="p-4 bg-[#0A192A] border-b border-[#294357] flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Contas Cadastradas ({currentPhaseData.title.split(':')[0]})</h3>
                <span className="text-xs font-bold text-rose-400">Total: {fmt(despesasTotaisConjuntas)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#294357] bg-[#07111F]/50 text-[11px] font-extrabold text-[#94A3B8] uppercase">
                      <th className="p-3.5">Descrição</th>
                      <th className="p-3.5">Valor (R$)</th>
                      <th className="p-3.5">Categoria</th>
                      <th className="p-3.5">Responsável</th>
                      <th className="p-3.5">Fase</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#294357] text-xs">
                    {currentExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#152B3B] transition-colors">
                        <td className="p-3.5 text-white font-bold">
                          {editingId === exp.id ? (
                            <input
                              type="text"
                              value={editingDesc}
                              onChange={(e) => setEditingDesc(e.target.value)}
                              className="bg-[#07111F] border border-[#2DD4BF] text-white px-2 py-1 rounded-lg w-full"
                            />
                          ) : (
                            exp.description
                          )}
                        </td>
                        <td className="p-3.5 font-extrabold text-rose-400">
                          {editingId === exp.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editingAmount}
                              onChange={(e) => setEditingAmount(e.target.value)}
                              className="bg-[#07111F] border border-[#2DD4BF] text-rose-400 px-2 py-1 rounded-lg w-28"
                            />
                          ) : (
                            fmt(exp.amount)
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#07111F] border border-[#294357] text-[#94A3B8]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            exp.responsible === 'Você'
                              ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {exp.responsible}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#94A3B8]">{exp.phase}</td>
                        <td className="p-3.5 text-right space-x-2">
                          {editingId === exp.id ? (
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(exp.id)}
                              className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                            >
                              Salvar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(exp)}
                              className="text-[#94A3B8] hover:text-[#2DD4BF] transition-colors"
                            >
                              <EditIcon className="w-4 h-4 inline" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="text-[#94A3B8] hover:text-rose-400 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: CRONOGRAMA & CHECKLIST DE PAGAMENTOS COM CONTROLE MANUAL DE ABATE */}
        {/* ==================================================================== */}
        {activeTab === 'cronograma' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121F31] p-5 rounded-2xl border border-[#294357]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Cronograma & Checklist de Pagamentos
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Altere o valor do gasto direto na linha e especifique exatamente quanto R$ abater de cada salário/recebimento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPayModalOpen(true)}
                className="flex items-center gap-2 bg-[#2DD4BF] hover:bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2DD4BF]/20"
              >
                <PlusIcon className="w-4 h-4" />
                + Novo Pagamento
              </button>
            </div>

            {/* PAINEL INTERATIVO DE ENCAIXE DE CAIXA POR LOTE DE SALÁRIO */}
            <div className="bg-[#121F31] p-5 rounded-2xl border border-[#2DD4BF]/30 space-y-4">
              <div className="flex items-center justify-between border-b border-[#294357] pb-3">
                <div className="flex items-center gap-2">
                  <WalletIcon className="w-5 h-5 text-[#2DD4BF]" />
                  <h3 className="text-sm font-bold text-white">Balanço do Encaixe por Lote de Salário (Com Abates Manuais & Automáticos)</h3>
                </div>
                <span className="text-xs text-[#94A3B8]">Veja o consumo real de cada parcela de dinheiro</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeAllocationBreakdown.map((lote) => {
                  const isOverAllocated = lote.remainingBalance < 0;
                  const pctUsed = Number(lote.amount) > 0 ? Math.min(100, (lote.totalAllocated / Number(lote.amount)) * 100) : 0;
                  return (
                    <div 
                      key={lote.id} 
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        isOverAllocated 
                          ? 'bg-rose-950/20 border-rose-500/50' 
                          : 'bg-[#07111F] border-[#294357]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-xs font-bold text-white block">{lote.description}</strong>
                          <span className="text-[10px] text-[#94A3B8]">Entrada: {lote.date} ({lote.responsible})</span>
                        </div>
                        <span className="text-xs font-extrabold text-white bg-[#121F31] px-2.5 py-1 rounded-lg border border-[#294357]">
                          {fmt(lote.amount)}
                        </span>
                      </div>

                      {/* Progresso de Comprometimento do Lote */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#94A3B8]">Gastos Vinculados: <strong className="text-white">{fmt(lote.totalAllocated)}</strong></span>
                          <span className={isOverAllocated ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {isOverAllocated ? `Faltam ${fmt(Math.abs(lote.remainingBalance))}` : `Sobra ${fmt(lote.remainingBalance)}`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#121F31] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverAllocated ? 'bg-rose-500' : 'bg-gradient-to-r from-[#2DD4BF] to-emerald-400'
                            }`}
                            style={{ width: `${pctUsed}%` }}
                          />
                        </div>
                      </div>

                      {/* Lista resumida de contas presas neste lote */}
                      <div className="pt-1 border-t border-[#121F31] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Contas pagas com este valor:</span>
                        {lote.assignedPayments.length === 0 ? (
                          <span className="text-[11px] text-emerald-400 font-medium italic">Nenhuma conta vinculada (100% livre)</span>
                        ) : (
                          lote.assignedPayments.map(p => (
                            <div key={p.id} className="flex justify-between text-[11px]">
                              <span className="text-[#94A3B8] truncate max-w-[170px]">
                                • {p.description} {p.isManual ? <span className="text-amber-400 font-bold">(Manual)</span> : null}
                              </span>
                              <span className="text-white font-semibold">{fmt(p.allocatedHere)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARDS KPIS DE PAGAMENTO */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#121F31] border border-[#294357] p-4 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold uppercase text-[#94A3B8]">Total Agendado</span>
                <strong className="text-xl font-extrabold text-[#E2E8F0] block">{fmt(totalScheduledPayments)}</strong>
                <span className="text-[10px] text-[#94A3B8]">Todas as contas do mês</span>
              </div>

              <div className="bg-[#121F31] border border-emerald-500/30 p-4 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold uppercase text-emerald-400">Total Quitado (Pago)</span>
                <strong className="text-xl font-extrabold text-emerald-400 block">{fmt(totalPaidAmount)}</strong>
                <span className="text-[10px] text-[#94A3B8]">Já baixados do caixa</span>
              </div>

              <div className="bg-[#121F31] border border-[#2DD4BF]/30 p-4 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold uppercase text-[#2DD4BF]">Total Pendente</span>
                <strong className="text-xl font-extrabold text-[#2DD4BF] block">{fmt(totalPendingAmount)}</strong>
                <span className="text-[10px] text-[#94A3B8]">A pagar no vencimento</span>
              </div>

              <div className="bg-[#121F31] border border-amber-500/30 p-4 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold uppercase text-amber-400">Progresso do Mês</span>
                <strong className="text-xl font-extrabold text-amber-400 block">{paymentProgressPct}%</strong>
                <span className="text-[10px] text-[#94A3B8]">Das contas pagas</span>
              </div>
            </div>

            {/* BARRA DE PROGRESSO */}
            <div className="bg-[#121F31] p-4 rounded-2xl border border-[#294357] space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#94A3B8]">
                <span>Progresso das Contas Quitadas</span>
                <span className="text-emerald-400 font-bold">{paymentProgressPct}%</span>
              </div>
              <div className="w-full h-3 bg-[#07111F] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#2DD4BF] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, paymentProgressPct))}%` }}
                />
              </div>
            </div>

            {/* LISTA DE CHECKLIST COM EDIÇÃO DIRETA DE VALOR E ABATE INDIVIDUAL POR RECEBIMENTO */}
            <div className="bg-[#121F31] rounded-2xl border border-[#294357] overflow-hidden">
              <div className="p-4 bg-[#0A192A] border-b border-[#294357] flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#2DD4BF]" />
                  Contas Agendadas, Edição Direta de Valor & Abate por Fonte (R$)
                </h3>
                <span className="text-xs text-[#94A3B8]">Digite o valor da conta direto na caixa R$ ou configure abates por salário</span>
              </div>

              <div className="divide-y divide-[#294357]">
                {monthPayments.map((item) => {
                  const alertStatus = getDueDateAlertStatus(item.dueDate, item.isPaid);
                  
                  let borderStyle = 'border-l-4 border-l-transparent';
                  if (alertStatus.code === 'overdue') borderStyle = 'border-l-4 border-l-rose-500 bg-rose-950/10';
                  else if (alertStatus.code === 'today' || alertStatus.code === 'soon') borderStyle = 'border-l-4 border-l-amber-500 bg-amber-950/10';
                  else if (item.isPaid) borderStyle = 'border-l-4 border-l-emerald-500 bg-emerald-950/10';

                  // Calculate total manual abates configured for this item
                  const sumManualAlloc = item.manualAllocations
                    ? Object.values(item.manualAllocations).reduce((acc, curr) => acc + (Number(curr) || 0), 0)
                    : 0;

                  const isExpanded = expandedAllocPayId === item.id;

                  return (
                    <div key={item.id} className={`p-4 transition-colors ${borderStyle} hover:bg-[#152B3B]`}>
                      
                      {/* Modo Edição Form Completo */}
                      {editingPayId === item.id ? (
                        <div className="w-full space-y-4 bg-[#07111F] p-4 rounded-xl border border-[#2DD4BF]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#94A3B8] mb-1">Descrição</label>
                              <input
                                type="text"
                                value={editingPayDesc}
                                onChange={(e) => setEditingPayDesc(e.target.value)}
                                className="w-full bg-[#121F31] border border-[#294357] text-white px-2.5 py-1.5 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#94A3B8] mb-1">Valor Total (R$)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingPayAmount}
                                onChange={(e) => setEditingPayAmount(e.target.value)}
                                className="w-full bg-[#121F31] border border-[#294357] text-emerald-400 px-2.5 py-1.5 rounded-lg text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#94A3B8] mb-1">Vencimento</label>
                              <input
                                type="date"
                                value={editingPayDate}
                                onChange={(e) => setEditingPayDate(e.target.value)}
                                className="w-full bg-[#121F31] border border-[#294357] text-white px-2.5 py-1.5 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#94A3B8] mb-1">Categoria</label>
                              <input
                                type="text"
                                value={editingPayCategory}
                                onChange={(e) => setEditingPayCategory(e.target.value)}
                                className="w-full bg-[#121F31] border border-[#294357] text-white px-2.5 py-1.5 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#94A3B8] mb-1">Combo de Origem Padrão</label>
                              <select
                                value={editingPayIncomeId}
                                onChange={(e) => setEditingPayIncomeId(e.target.value)}
                                className="w-full bg-[#121F31] border border-[#294357] text-white px-2.5 py-1.5 rounded-lg text-xs"
                              >
                                <option value="">Desconhecido / Geral</option>
                                {editingPayIncomeId?.includes(',') && !incomeComboOptions.some(combo => combo.id === editingPayIncomeId) && (
                                  <option value={editingPayIncomeId}>Combinação salva: {editingPayIncomeId.split(',').map(id => incomesList.find(inc => inc.id === id)?.description || 'Fonte').join(' + ')}</option>
                                )}
                                <optgroup label="Combinações automáticas do mês">
                                  {incomeComboOptions.map(combo => (
                                    <option key={combo.id} value={combo.id}>{combo.label}</option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingPayId(null)}
                              className="px-3 py-1 bg-[#121F31] text-[#94A3B8] hover:text-white rounded-lg text-xs"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditPayment(item.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                            >
                              Salvar Alterações
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => handleTogglePaid(item.id)}
                                className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                  item.isPaid 
                                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20' 
                                    : 'border-[#2DD4BF]/50 bg-[#07111F] text-transparent hover:border-[#2DD4BF]'
                                }`}
                              >
                                <CheckIcon className="w-4 h-4 stroke-[3]" />
                              </button>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-sm font-bold ${item.isPaid ? 'line-through text-[#94A3B8]' : 'text-white'}`}>
                                    {item.description}
                                  </span>

                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#07111F] border border-[#294357] text-[#2DD4BF] font-medium">
                                    {item.category}
                                  </span>

                                  {/* BADGE DE ALERTA VISUAL DE VENCIMENTO */}
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                    alertStatus.code === 'overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                                    alertStatus.code === 'today' || alertStatus.code === 'soon' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                                    alertStatus.code === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    {alertStatus.code === 'overdue' || alertStatus.code === 'today' ? <AlertTriangleIcon className="w-3 h-3" /> : null}
                                    {alertStatus.label}
                                  </span>
                                </div>
                                
                                {/* Vinculação Rápida da Fonte de Recebimento */}
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className="text-[11px] text-[#94A3B8]">Fonte Principal:</span>
                                  <select
                                    value={item.linkedIncomeId || ''}
                                    onChange={(e) => handleLinkedIncomeChange(item.id, e.target.value)}
                                    className="bg-[#07111F] border border-[#294357] text-xs text-[#E2E8F0] px-2 py-0.5 rounded-lg focus:outline-none focus:border-[#2DD4BF]"
                                  >
                                    <option value="">Desconhecido / Geral</option>
                                    {item.linkedIncomeId?.includes(',') && !incomeComboOptions.some(combo => combo.id === item.linkedIncomeId) && (
                                      <option value={item.linkedIncomeId}>Combinação salva: {item.recommendedIncome || 'fontes vinculadas'}</option>
                                    )}
                                    <optgroup label="Combinações automáticas do mês">
                                  {incomeComboOptions.map(combo => (
                                    <option key={combo.id} value={combo.id}>{combo.label}</option>
                                  ))}
                                </optgroup>
                                    <optgroup label="Entradas Individuais">
                                      {monthIncomes.map(inc => (
                                        <option key={inc.id} value={inc.id}>
                                          {inc.responsible} - {inc.description} ({fmt(inc.amount)})
                                        </option>
                                      ))}
                                    </optgroup>
                                  </select>

                                  {/* Botão de expansão do painel de abate por fonte */}
                                  <button
                                    type="button"
                                    onClick={() => setExpandedAllocPayId(isExpanded ? null : item.id)}
                                    className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                      sumManualAlloc > 0
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-[#07111F] text-[#94A3B8] border border-[#294357] hover:text-white'
                                    }`}
                                  >
                                    <ZapIcon className="w-3 h-3 text-amber-400" />
                                    {sumManualAlloc > 0 ? `Abate Manual (R$ ${sumManualAlloc.toFixed(2)})` : '⚡ Abate por Fonte (R$)'}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* CONTROLE DIRETO DE EDICÃO DO VALOR EM R$ E BOTÕES DE AÇÃO */}
                            <div className="flex items-center gap-3">
                              {/* Campo Numérico para Alterar o Valor Direto */}
                              <div className="flex items-center gap-1.5 bg-[#07111F] px-2.5 py-1.5 rounded-xl border border-amber-500/40">
                                <span className="text-xs text-amber-400 font-extrabold">R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => handleUpdatePaymentAmount(item.id, e.target.value)}
                                  className="w-24 bg-transparent text-sm font-black text-amber-300 outline-none focus:text-white"
                                  title="Clique para alterar o valor total desta conta"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleStartEditPayment(item)}
                                className="text-[#94A3B8] hover:text-[#2DD4BF] transition-colors p-1"
                                title="Editar detalhes do pagamento"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePaymentItem(item.id)}
                                className="text-[#94A3B8] hover:text-rose-400 transition-colors p-1"
                                title="Excluir pagamento"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* PAINEL EXPANDIDO PARA DEFINIR EXATAMENTE QUANTO R$ SAI DE CADA RECEBIMENTO */}
                          {isExpanded && (
                            <div className="mt-3 p-3.5 bg-[#07111F] rounded-xl border border-amber-500/40 space-y-3">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#294357] pb-2">
                                <div>
                                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                                    <ZapIcon className="w-3.5 h-3.5" />
                                    Especificar Abates Exatos por Recebimento (R$)
                                  </span>
                                  <p className="text-[10px] text-[#94A3B8]">
                                    Distribua o valor da conta entre as fontes de receita selecionadas.
                                  </p>
                                </div>
                                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                                  sumManualAlloc === item.amount 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  Alocado: {fmt(sumManualAlloc)} / {fmt(item.amount)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {incomesList.map(inc => {
                                  const currentVal = item.manualAllocations ? (item.manualAllocations[inc.id] ?? '') : '';
                                  return (
                                    <div key={inc.id} className="flex items-center justify-between bg-[#121F31] p-2 rounded-lg border border-[#294357]">
                                      <div className="truncate max-w-[140px]">
                                        <span className="text-[11px] text-white font-semibold block truncate">{inc.description}</span>
                                        <span className="text-[9px] text-[#94A3B8]">Total: {fmt(inc.amount)} ({inc.responsible})</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-amber-400 font-bold">R$</span>
                                        <input
                                          type="number"
                                          step="0.01"
                                          placeholder="0"
                                          value={currentVal}
                                          onChange={(e) => handleUpdateManualAllocation(item.id, inc.id, e.target.value)}
                                          className="w-16 bg-[#07111F] border border-amber-500/40 text-amber-300 text-xs font-bold px-1.5 py-1 rounded text-right outline-none focus:border-amber-400"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: INVESTIMENTOS & STEP-UP (30 ANOS) */}
        {/* ==================================================================== */}
        {activeTab === 'investimentos' && (
          <section className="space-y-6">
            <div className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5 text-[#2DD4BF]" />
                    Simulador Interativo Step-Up (30 Anos)
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Projeção com o patrimônio atual da carteira, aporte mensal, aumento anual e hipóteses editáveis de retorno e dividendos.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#07111F] px-3 py-1.5 rounded-xl border border-[#294357]">
                  <span className="text-xs text-[#94A3B8]">Retorno Total Anual Estimado:</span>
                  <input
                    type="number"
                    step="0.5"
                    value={simYield}
                    onChange={(e) => setSimYield(Number(e.target.value) || 10)}
                    className="w-16 bg-transparent text-xs font-bold text-emerald-400 outline-none text-right"
                  />
                  <span className="text-xs text-emerald-400 font-bold">% a.a.</span>
                </div>
                <div className="flex items-center gap-2 bg-[#07111F] px-3 py-1.5 rounded-xl border border-[#294357]">
                  <span className="text-xs text-[#94A3B8]">Dividend yield estimado:</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.05"
                    value={dividendYieldPct}
                    onChange={(e) => setDividendYieldPct(Math.min(5, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-14 bg-transparent text-xs font-bold text-emerald-400 outline-none text-right"
                  />
                  <span className="text-xs text-emerald-400 font-bold">% a.m.</span>
                </div>
                <p className="text-[10px] text-slate-500 max-w-2xl">Projeções são cenários: os proventos não são garantidos e a rentabilidade anual pode já incluir dividendos. Não some as duas hipóteses para estimar retorno real.</p>
              </div>

              {/* SLIDERS INTERATIVOS DO STEP-UP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#294357]">
                <div className="space-y-1 bg-[#07111F] p-3 rounded-xl border border-[#294357]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Aporte Inicial (Ano 1):</span>
                    <strong className="text-[#2DD4BF]">{fmt(initialContribution)}/mês</strong>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1000"
                    step="50"
                    value={initialContribution}
                    onChange={(e) => setInitialContribution(Number(e.target.value))}
                    className="w-full accent-[#2DD4BF] cursor-pointer"
                  />
                </div>

                <div className="space-y-1 bg-[#07111F] p-3 rounded-xl border border-[#294357]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Aumento Anual (Degrau):</span>
                    <strong className="text-emerald-400">+{fmt(annualStepUp)}/ano</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={annualStepUp}
                    onChange={(e) => setAnnualStepUp(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1 bg-[#07111F] p-3 rounded-xl border border-[#294357]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Teto Máximo Mensal:</span>
                    <strong className="text-purple-400">{fmt(maxMonthlyContribution)}/mês</strong>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="100"
                    value={maxMonthlyContribution}
                    onChange={(e) => setMaxMonthlyContribution(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* GRÁFICOS COMPOSED CHART DOS 30 ANOS */}
            <div className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChartIcon className="w-5 h-5 text-[#2DD4BF]" />
                Evolução Patrimonial & Dividendos Acumulados (30 Anos)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={investmentSimulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#294357" />
                    <XAxis dataKey="year" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D1527', borderColor: '#2DD4BF', borderRadius: '12px' }}
                      itemStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94A3B8' }}
                      formatter={(val) => [fmt(val), 'Valor']}
                    />
                    <Area type="monotone" dataKey="patrimony" name="Patrimônio Acumulado" fill="#2DD4BF" stroke="#2DD4BF" fillOpacity={0.2} />
                    <Line type="monotone" dataKey="totalDeposited" name="Total Depositado" stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={2} />
                    <Bar dataKey="monthlyDividend" name="Renda Passiva Mensal" fill="#34D399" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '11px' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* MARCOS DA BOLA DE NEVE */}
            <div className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ZapIcon className="w-5 h-5 text-amber-400" />
                Marcos da Bola de Neve (Efeito Reinvestimento de Dividendos)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {snowballMilestones.map((m, idx) => (
                  <div key={idx} className="bg-[#07111F] p-4 rounded-xl border border-amber-500/30 space-y-2">
                    <strong className="text-xs font-bold text-amber-400 block">{m.label}</strong>
                    <div className="text-2xl font-black text-white">{m.yearsWith} <span className="text-xs font-normal text-[#94A3B8]">anos</span></div>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      ⚡ Economiza {m.savedYears} anos graças aos dividendos reinvestidos!
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* REGISTRO DE DEPÓSITOS REALIZADOS */}
            <div className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-emerald-400" />
                Histórico de Depósitos Reais Efetuados
              </h3>
              <form onSubmit={handleAddDeposit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Mês (Ex: Nov/2026)"
                  value={newDepMonth}
                  onChange={(e) => setNewDepMonth(e.target.value)}
                  className="bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#2DD4BF]"
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Valor R$"
                  value={newDepAmount}
                  onChange={(e) => setNewDepAmount(e.target.value)}
                  className="bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold outline-none focus:border-[#2DD4BF]"
                />
                <input
                  type="text"
                  placeholder="Observação (Ex: Aporte FIIs)"
                  value={newDepNotes}
                  onChange={(e) => setNewDepNotes(e.target.value)}
                  className="bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#2DD4BF]"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-4 py-2 transition-all"
                >
                  + Lançar Depósito
                </button>
              </form>

              <div className="divide-y divide-[#294357]">
                {realizedDeposits.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic text-center py-4">Nenhum depósito real registrado ainda.</p>
                ) : (
                  realizedDeposits.map(d => (
                    <div key={d.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white block">{d.monthYear}</strong>
                        <span className="text-[10px] text-[#94A3B8]">{d.notes}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-emerald-400">{fmt(d.amount)}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteDeposit(d.id)}
                          className="text-[#94A3B8] hover:text-rose-400"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: CARTEIRA DE INVESTIMENTOS & CALCULADORA DE REBALANCEAMENTO */}
        {/* ==================================================================== */}
        {activeTab === 'carteira' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121F31] p-5 rounded-2xl border border-[#294357]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Minha Carteira de Investimentos
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Detalhamento da carteira com ajuste rápido de cotas, preços médios e recomendação de aportes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setIsAssetModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-xs font-bold text-[#07111F] hover:bg-teal-300 transition-colors">
                <PlusIcon className="w-4 h-4" /> Novo ativo
              </button>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <PlusIcon className="w-4 h-4" />
                + Comprar Ativo
              </button>
              </div>
            </div>

            {/* NOVO RECURSO 3: CALCULADORA DE REBALANCEAMENTO AUTOMÁTICO DO APORTE */}
            <div className="bg-[#121F31] p-5 rounded-2xl border border-[#2DD4BF]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-[#294357] pb-3">
                <div className="flex items-center gap-2">
                  <CalculatorIcon className="w-5 h-5 text-[#2DD4BF]" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Calculadora de Rebalanceamento do Aporte ({fmt(voceAporte)})</h3>
                    <p className="text-xs text-[#94A3B8]">Sugestão automática de onde aportar o seu dinheiro do mês para reequilibrar a carteira</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-[#2DD4BF]/20 text-[#2DD4BF] rounded-full">
                  Equilíbrio Ideal
                </span>
              </div>

              {/* Ajuste de Alvos de Porcentagem */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#07111F] p-3 rounded-xl border border-[#294357]">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Alvo Renda Fixa (%)</label>
                  <input
                    type="number"
                    value={targetWeights.rendaFixa}
                    onChange={(e) => setTargetWeights({ ...targetWeights, rendaFixa: Number(e.target.value) || 0 })}
                    className="w-full bg-[#121F31] border border-[#294357] text-xs font-bold text-white px-2 py-1 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Alvo Ações (%)</label>
                  <input
                    type="number"
                    value={targetWeights.acoes}
                    onChange={(e) => setTargetWeights({ ...targetWeights, acoes: Number(e.target.value) || 0 })}
                    className="w-full bg-[#121F31] border border-[#294357] text-xs font-bold text-white px-2 py-1 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Alvo FIIs (%)</label>
                  <input
                    type="number"
                    value={targetWeights.fiis}
                    onChange={(e) => setTargetWeights({ ...targetWeights, fiis: Number(e.target.value) || 0 })}
                    className="w-full bg-[#121F31] border border-[#294357] text-xs font-bold text-white px-2 py-1 rounded-lg"
                  />
                </div>
              </div>

              {/* Sugestão de Divisão do Aporte */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#07111F] p-3 rounded-xl border border-cyan-500/30">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">⚡ Aportar em Renda Fixa</span>
                  <strong className="text-base font-extrabold text-white">{fmt(rebalanceSuggestions.allocRf)}</strong>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5">Renda fixa selecionada</span>
                </div>
                <div className="bg-[#07111F] p-3 rounded-xl border border-blue-500/30">
                  <span className="text-[10px] text-blue-400 font-bold uppercase block">⚡ Aportar em Ações</span>
                  <strong className="text-base font-extrabold text-white">{fmt(rebalanceSuggestions.allocAcoes)}</strong>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5">Ações selecionadas</span>
                </div>
                <div className="bg-[#07111F] p-3 rounded-xl border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">⚡ Aportar em FIIs</span>
                  <strong className="text-base font-extrabold text-white">{fmt(rebalanceSuggestions.allocFiis)}</strong>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5">FIIs selecionados</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121F31] rounded-2xl border border-[#294357] overflow-hidden">
              <div className="p-4 bg-[#0A192A] border-b border-[#294357] flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Ativos Selecionados</h3>
                <span className="text-xs font-extrabold text-emerald-400">Total Investido: {fmt(totalPortfolioValue)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#294357] bg-[#07111F]/50 text-[10px] font-extrabold text-[#94A3B8] uppercase">
                      <th className="p-3">Código / Ativo</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Qtd. Planejada</th>
                      <th className="p-3">Preço Estimado</th>
                      <th className="p-3">Qtd. Adquirida</th>
                      <th className="p-3">Preço Médio (PM)</th>
                      <th className="p-3">Preço Atual</th>
                      <th className="p-3">Valor Total Efetivo</th>
                      <th className="p-3">Peso (%)</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#294357] text-xs">
                    {portfolioAssets.map(asset => {
                      const totalVal = (asset.qtdAdquirida || 0) * (asset.precoAtual || 0);
                      const weightPct = totalPortfolioValue > 0 ? ((totalVal / totalPortfolioValue) * 100).toFixed(1) : '0.0';

                      return (
                        <tr key={asset.id} className="hover:bg-[#152B3B] transition-colors">
                          <td className="p-3">
                            <strong className="text-white block font-mono">{asset.ticker}</strong>
                            <span className="text-[10px] text-[#94A3B8]">{asset.name}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#07111F] border border-[#294357] text-[#2DD4BF]">
                              {asset.category}
                            </span>
                          </td>
                          <td className="p-3 text-white font-bold">{asset.qtdPlanejada}</td>
                          <td className="p-3 text-[#94A3B8]">{fmt(asset.precoEstimado)}</td>

                          {/* Quantidade Adquirida com botões + e - e caixa editável */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateAssetQtd(asset.id, (asset.qtdAdquirida || 0) - 1)}
                                className="w-6 h-6 bg-[#07111F] border border-[#294357] hover:border-rose-500 text-rose-400 hover:text-white rounded-md flex items-center justify-center text-xs font-black transition-all"
                                title="Diminuir 1 cota"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={asset.qtdAdquirida}
                                onChange={(e) => handleUpdateAssetQtd(asset.id, e.target.value)}
                                className="w-14 bg-[#07111F] border border-[#2DD4BF]/40 text-center text-emerald-400 font-extrabold text-xs px-1 py-1 rounded-lg outline-none focus:border-emerald-400"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateAssetQtd(asset.id, (asset.qtdAdquirida || 0) + 1)}
                                className="w-6 h-6 bg-[#07111F] border border-[#294357] hover:border-emerald-500 text-emerald-400 hover:text-white rounded-md flex items-center justify-center text-xs font-black transition-all"
                                title="Aumentar 1 cota"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Preço Médio (PM) Editável */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#94A3B8]">R$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={asset.precoMedio}
                                onChange={(e) => handleUpdateAssetPrice(asset.id, 'precoMedio', e.target.value)}
                                className="w-20 bg-[#07111F] border border-[#294357] text-white font-semibold text-xs px-1.5 py-1 rounded-lg outline-none focus:border-white"
                              />
                            </div>
                          </td>

                          {/* Preço Atual Editável */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#94A3B8]">R$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={asset.precoAtual}
                                onChange={(e) => handleUpdateAssetPrice(asset.id, 'precoAtual', e.target.value)}
                                className="w-20 bg-[#07111F] border border-[#2DD4BF]/40 text-[#2DD4BF] font-bold text-xs px-1.5 py-1 rounded-lg outline-none focus:border-[#2DD4BF]"
                              />
                            </div>
                          </td>

                          <td className="p-3 font-extrabold text-white">{fmt(totalVal)}</td>
                          <td className="p-3 text-amber-400 font-bold">{weightPct}%</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setBuyForm({ assetId: asset.id, quantity: '1', price: asset.precoAtual.toString() });
                                setIsBuyModalOpen(true);
                              }}
                              className="w-7 h-7 bg-[#2DD4BF]/20 hover:bg-[#2DD4BF] text-[#2DD4BF] hover:text-white rounded-lg flex items-center justify-center transition-all ml-auto"
                              title="Comprar mais cotas via modal"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteAsset(asset.id)} title="Excluir ativo" className="w-7 h-7 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg inline-flex items-center justify-center ml-1"><TrashIcon className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 7: METAS DE INVESTIMENTOS */}
        {/* ==================================================================== */}
        {activeTab === 'metas' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121F31] p-5 rounded-2xl border border-[#294357]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Metas Financeiras & Marcos de Independência
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Acompanhamento contínuo de conquistas de patrimônio acumulado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-2 bg-[#2DD4BF] hover:bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2DD4BF]/20"
              >
                <PlusIcon className="w-4 h-4" />
                + Nova Meta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {goalsList.map((goal) => {
                const currentVal = totalPortfolioValue;
                const progressPct = Math.min(100, (currentVal / goal.target) * 100).toFixed(1);

                return (
                  <div key={goal.id} className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-4 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
                          <TargetIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{goal.title}</h3>
                          <span className="text-xs text-[#94A3B8]">Alvo: {fmt(goal.target)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-[#94A3B8] hover:text-rose-400 transition-colors p-1"
                        title="Excluir Meta"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#94A3B8]">Progresso Atual: <strong className="text-white">{fmt(currentVal)}</strong></span>
                        <span className="text-[#2DD4BF] font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#07111F] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#2DD4BF] to-emerald-400 transition-all duration-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 8: COMPARATIVO DE MODELOS */}
        {/* ==================================================================== */}
        {activeTab === 'comparativo' && (
          <section className="space-y-6">
            <div className="bg-[#121F31] p-5 rounded-2xl border border-[#294357] space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-[#2DD4BF]" />
                Comparativo de Modelos: Divisão Direta vs. Pool Único
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Entenda a diferença de caixa entre manter contas separadas ou unificar 100% da renda do casal.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MODELO 1: DIVISÃO DIRETA */}
              <div className="bg-[#121F31] p-6 rounded-2xl border border-[#2DD4BF]/40 space-y-4">
                <div className="flex items-center justify-between border-b border-[#294357] pb-3">
                  <h3 className="text-base font-bold text-white">Modelo 1: Divisão Direta por Perfil</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#2DD4BF]/20 text-[#2DD4BF]">Sugerido</span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Cada um paga suas contas do próprio bolso e guarda seu próprio aporte de investimento.
                </p>

                <div className="space-y-3 bg-[#07111F] p-4 rounded-xl border border-[#294357]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Sua Renda Total:</span>
                    <strong className="text-white">{fmt(voceIncome)}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Suas Contas Fixas:</span>
                    <strong className="text-rose-400">- {fmt(voceFixedExpenses)}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Seu Aporte de Investimento:</span>
                    <strong className="text-amber-400">- {fmt(voceAporte)}</strong>
                  </div>
                  <div className="pt-2 border-t border-[#294357] flex justify-between text-sm font-bold">
                    <span className="text-emerald-400">Sua Sobra Livre no Bolso:</span>
                    <span className="text-emerald-400 font-black">{fmt(diretoSobraVoce)}</span>
                  </div>
                </div>
              </div>

              {/* MODELO 2: POOL ÚNICO */}
              <div className="bg-[#121F31] p-6 rounded-2xl border border-purple-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-[#294357] pb-3">
                  <h3 className="text-base font-bold text-white">Modelo 2: Pool Único (100% Unificado)</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300">Alternativo</span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Toda a renda entra numa mesma conta e o saldo líquido final é dividido em 2 mesadas idênticas.
                </p>

                <div className="space-y-3 bg-[#07111F] p-4 rounded-xl border border-[#294357]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Renda Total Conjunta:</span>
                    <strong className="text-white">{fmt(rendaTotalConjunta)}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Despesas Totais Conjuntas:</span>
                    <strong className="text-rose-400">- {fmt(despesasTotaisConjuntas)}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Investimentos Totais Conjuntos:</span>
                    <strong className="text-amber-400">- {fmt(poteTotalConjunto)}</strong>
                  </div>
                  <div className="pt-2 border-t border-[#294357] flex justify-between text-sm font-bold">
                    <span className="text-purple-300">Mesada Livre para Cada Um:</span>
                    <span className="text-purple-300 font-black">{fmt(poolMesadaCada)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* TAB 9: RELATÓRIO EXECUTIVO PARA IMPRESSÃO */}
        {/* ==================================================================== */}
        {activeTab === 'relatorio' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121F31] p-5 rounded-2xl border border-[#294357]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PrinterIcon className="w-5 h-5 text-[#2DD4BF]" />
                  Relatório Executivo do Planejamento
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Resumo pronto para impressão ou geração de PDF do plano financeiro do casal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-[#2DD4BF] hover:bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <PrinterIcon className="w-4 h-4" />
                Imprimir Relatório
              </button>
            </div>

            <div className="bg-[#121F31] p-8 rounded-2xl border border-[#294357] space-y-6 text-white font-sans">
              <div className="border-b border-[#294357] pb-4 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-black">NÓS | PLANEJAMENTO FINANCEIRO</h1>
                  <p className="text-xs text-[#94A3B8]">Relatório Consolidado de Transição Patrimonial</p>
                </div>
                <span className="text-xs font-bold text-[#2DD4BF]">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <strong className="text-[#2DD4BF] block mb-1 uppercase font-extrabold">RESUMO DE CAIXA (VOCÊ)</strong>
                  <p>Renda Total: <strong>{fmt(voceIncome)}</strong></p>
                  <p>Contas Fixas: <strong>{fmt(voceFixedExpenses)}</strong></p>
                  <p>Aporte de Investimento: <strong>{fmt(voceAporte)}</strong></p>
                  <p>Sobra Livre no Bolso: <strong className="text-emerald-400">{fmt(diretoSobraVoce)}</strong></p>
                </div>

                <div>
                  <strong className="text-purple-400 block mb-1 uppercase font-extrabold">RESUMO DE CAIXA (ELA)</strong>
                  <p>Renda Total: <strong>{fmt(elaIncome)}</strong></p>
                  <p>Contas Fixas: <strong>{fmt(elaFixedExpenses)}</strong></p>
                  <p>Aporte de Investimento: <strong>{fmt(elaPote)}</strong></p>
                  <p>Sobra Livre no Bolso: <strong className="text-purple-300">{fmt(diretoSobraEla)}</strong></p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#294357]">
                <strong className="text-amber-400 text-xs uppercase font-extrabold block mb-2">DIVISÃO SUGERIDA DE APORTES</strong>
                <ul className="text-xs text-[#94A3B8] space-y-1">
                  <li>• <strong>Renda Fixa ({targetWeights.rendaFixa}%)</strong>: Renda fixa selecionada ({fmt(rebalanceSuggestions.allocRf)})</li>
                  <li>• <strong>Ações ({targetWeights.acoes}%)</strong>: Ativos da carteira ({fmt(rebalanceSuggestions.allocAcoes)})</li>
                  <li>• <strong>FIIs ({targetWeights.fiis}%)</strong>: FIIs selecionados ({fmt(rebalanceSuggestions.allocFiis)})</li>
                </ul>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* MODAL: CADASTRAR NOVO ATIVO */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddAsset} className="bg-[#121F31] border border-[#294357] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Adicionar ativo à carteira</h3>
            <p className="text-xs text-slate-400">Cadastre ações, FIIs ou renda fixa. Os valores ficam somente no seu navegador.</p>
            <label className="block text-xs font-semibold text-slate-300">Código / ticker
              <input required maxLength={25} value={newAsset.ticker} onChange={e => setNewAsset(p => ({...p, ticker:e.target.value}))} placeholder="Ex: ABCD3" className="mt-1 w-full rounded-lg bg-[#07111F] border border-[#294357] px-3 py-2 text-white" />
            </label>
            <label className="block text-xs font-semibold text-slate-300">Nome
              <input required maxLength={80} value={newAsset.name} onChange={e => setNewAsset(p => ({...p, name:e.target.value}))} placeholder="Nome do investimento" className="mt-1 w-full rounded-lg bg-[#07111F] border border-[#294357] px-3 py-2 text-white" />
            </label>
            <label className="block text-xs font-semibold text-slate-300">Classe
              <select value={newAsset.categoryType} onChange={e => setNewAsset(p => ({...p, categoryType:e.target.value}))} className="mt-1 w-full rounded-lg bg-[#07111F] border border-[#294357] px-3 py-2 text-white">
                <option value="acao">Ação</option><option value="fii-tijolo">FII</option><option value="renda-fixa">Renda fixa</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-300">Quantidade planejada
                <input type="number" min="0" step="1" value={newAsset.qtdPlanejada} onChange={e => setNewAsset(p => ({...p, qtdPlanejada:e.target.value}))} className="mt-1 w-full rounded-lg bg-[#07111F] border border-[#294357] px-3 py-2 text-white" />
              </label>
              <label className="block text-xs font-semibold text-slate-300">Preço estimado (R$)
                <input type="number" min="0" step="0.01" value={newAsset.precoEstimado} onChange={e => setNewAsset(p => ({...p, precoEstimado:e.target.value}))} className="mt-1 w-full rounded-lg bg-[#07111F] border border-[#294357] px-3 py-2 text-white" />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAssetModalOpen(false)} className="rounded-lg px-4 py-2 bg-[#27394D] text-slate-200 text-sm">Cancelar</button>
              <button type="submit" className="rounded-lg px-4 py-2 bg-teal-400 text-[#07111F] text-sm font-bold">Adicionar ativo</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 1: ADICIONAR ITEM EM QUALQUER CARTÃO DE CRÉDITO */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121F31] border border-[#294357] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-[#2DD4BF]" />
              Novo Gasto no Cartão de Crédito
            </h3>
            <form onSubmit={handleAddSub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Selecione o Cartão</label>
                <select
                  value={newSub.cardId || targetCardForModal}
                  onChange={(e) => setNewSub({ ...newSub, cardId: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                >
                  {creditCards.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.owner}) - Limite {fmt(c.limit)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Nome do Item / Assinatura</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: HBO Max, Renner Parcela, etc."
                  value={newSub.name}
                  onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newSub.amount}
                  onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Entretenimento, Vestuário, etc."
                  value={newSub.category}
                  onChange={(e) => setNewSub({ ...newSub, category: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#94A3B8] hover:bg-[#07111F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2DD4BF] text-white hover:bg-[#0D9488]"
                >
                  Adicionar ao Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADICIONAR NOVO RECEBIMENTO */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121F31] border border-[#294357] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-[#2DD4BF]" />
              Novo Recebimento / Lote
            </h3>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Parcela Salário, Freelance, etc."
                  value={newInc.description}
                  onChange={(e) => setNewInc({ ...newInc, description: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newInc.amount}
                  onChange={(e) => setNewInc({ ...newInc, amount: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Data</label>
                  <input
                    type="date"
                    value={newInc.date}
                    onChange={(e) => setNewInc({ ...newInc, date: e.target.value })}
                    className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Titular</label>
                  <select
                    value={newInc.responsible}
                    onChange={(e) => setNewInc({ ...newInc, responsible: e.target.value })}
                    className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                  >
                    <option value="Você">Você</option>
                    <option value="Ela">Ela</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={Boolean(newInc.isReceived)} onChange={e => setNewInc(prev => ({ ...prev, isReceived: e.target.checked }))} className="accent-teal-400" />
                O dinheiro já entrou na conta
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#94A3B8] hover:bg-[#07111F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2DD4BF] text-white hover:bg-[#0D9488]"
                >
                  Salvar Recebimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADICIONAR NOVA DESPESA MESTRE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121F31] border border-[#294357] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-[#2DD4BF]" />
              Nova Despesa / Conta Fixa
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta de Gás, Condomínio, etc."
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newExp.amount}
                  onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Categoria</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                    className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                  >
                    <option value="Moradia">Moradia</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Educação">Educação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Dívidas">Dívidas</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Responsável</label>
                  <select
                    value={newExp.responsible}
                    onChange={(e) => setNewExp({ ...newExp, responsible: e.target.value })}
                    className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                  >
                    <option value="Você">Você</option>
                    <option value="Ela">Ela</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Fase do Planejamento</label>
                <select
                  value={newExp.phase}
                  onChange={(e) => setNewExp({ ...newExp, phase: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                >
                  <option value="Todas">Todas as Fases</option>
                  <option value="Fase 1">Apenas Fase 1</option>
                  <option value="Fase 2">Apenas Fase 2 (Dez-Mar/27)</option>
                  <option value="Fase 3">Apenas Fase 3</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#94A3B8] hover:bg-[#07111F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2DD4BF] text-white hover:bg-[#0D9488]"
                >
                  Adicionar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REGISTRAR COMPRA NA CARTEIRA */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121F31] border border-[#294357] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-emerald-400" />
              Lançar Compra de Ativo
            </h3>
            <form onSubmit={handleRecordPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Selecione o Ativo</label>
                <select
                  required
                  value={buyForm.assetId}
                  onChange={(e) => {
                    const selAsset = portfolioAssets.find(a => a.id === e.target.value);
                    setBuyForm({
                      ...buyForm,
                      assetId: e.target.value,
                      price: selAsset ? selAsset.precoAtual.toString() : ''
                    });
                  }}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                >
                  <option value="">-- Escolha um ativo --</option>
                  {portfolioAssets.map(a => (
                    <option key={a.id} value={a.id}>{a.ticker} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Qtd. Comprada</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1"
                    value={buyForm.quantity}
                    onChange={(e) => setBuyForm({ ...buyForm, quantity: e.target.value })}
                    className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Preço Pago / Cota (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={buyForm.price}
                    onChange={(e) => setBuyForm({ ...buyForm, price: e.target.value })}
                    className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBuyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#94A3B8] hover:bg-[#07111F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Confirmar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADICIONAR NOVA META */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121F31] border border-[#294357] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TargetIcon className="w-5 h-5 text-[#2DD4BF]" />
              Nova Meta Financeira
            </h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Título da Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: R$ 15.000 Investidos, Fundo de Emergência, etc."
                  value={newGoalForm.title}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, title: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Valor Alvo (R$)</label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="15000"
                  value={newGoalForm.target}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, target: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#94A3B8] hover:bg-[#07111F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2DD4BF] text-white hover:bg-[#0D9488]"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADICIONAR NOVO PAGAMENTO NO CHECKLIST */}
      {isAddPayModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121F31] border border-[#294357] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusIcon className="w-5 h-5 text-[#2DD4BF]" />
              Agendar Novo Pagamento
            </h3>
            <form onSubmit={handleAddPaymentItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Descrição do Pagamento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta de Luz extra, Dentista, etc."
                  value={newPayItem.description}
                  onChange={(e) => setNewPayItem({ ...newPayItem, description: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newPayItem.amount}
                  onChange={(e) => setNewPayItem({ ...newPayItem, amount: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={newPayItem.dueDate}
                    onChange={(e) => setNewPayItem({ ...newPayItem, dueDate: e.target.value })}
                    className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Categoria</label>
                  <select
                    value={newPayItem.category}
                    onChange={(e) => setNewPayItem({ ...newPayItem, category: e.target.value })}
                    className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                  >
                    <option value="Moradia">Moradia</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Educação">Educação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Dívidas">Dívidas</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Investimentos">Investimentos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Fonte / Recebimento Sugerido</label>
                <input
                  type="text"
                  placeholder="Ex: Salário, trabalho extra, outros"
                  value={newPayItem.recommendedIncome}
                  onChange={(e) => setNewPayItem({ ...newPayItem, recommendedIncome: e.target.value })}
                  className="w-full bg-[#07111F] border border-[#294357] rounded-xl px-3 py-2 text-sm text-[#E2E8F0] focus:border-[#2DD4BF] outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#94A3B8] hover:bg-[#07111F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2DD4BF] text-white hover:bg-[#0D9488]"
                >
                  Agendar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}