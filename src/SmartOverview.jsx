import React, { useMemo } from 'react';
import { smartSummary, makeMonthClosing, closingChanged, formatMoney } from './smartFinance.js';

const heading = 'text-[11px] font-extrabold tracking-[.19em] uppercase text-slate-400';
const pane = 'nos-panel rounded-[22px] p-5 sm:p-6';
function Metric({ label, value, detail, accent='text-white' }) {
  return <div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4">
    <p className={heading}>{label}</p>
    <p className={'mt-2 text-xl sm:text-2xl font-black tracking-tight '+accent}>{value}</p>
    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{detail}</p>
  </div>;
}
export default function SmartOverview({
 month, incomes, payments, cards, items, assets, closings, setClosings,
 onIncome, onPayment, onRecurring, onInvest, onGoals
}) {
 const data = useMemo(()=>smartSummary(month,incomes,payments,cards,items),[month,incomes,payments,cards,items]);
 const closing=(closings||[]).find(x=>x.month===month);
 const stale=closingChanged(closing,data.cash);
 const labelMonth = new Date(Number(month.slice(0,4)),Number(month.slice(5,7))-1,1)
    .toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 const handleClosing=()=>{
   const count=data.cash.scheduledPayments+data.cash.plannedIncome;
   if (!count) { window.alert('Cadastre receitas e pagamentos antes de fechar o mês.'); return; }
   const question = closing ? 'Atualizar o resumo salvo de '+labelMonth+'? O resumo anterior será substituído para os dois participantes.' :
     'Registrar um retrato financeiro de '+labelMonth+'? Este fechamento não altera pagamentos ou receitas.';
   if (!window.confirm(question)) return;
   setClosings(prev=>{
     const current=Array.isArray(prev)?prev:[];
     const old=current.find(x=>x.month===month);
     const next=makeMonthClosing(month,{incomesList:incomes,paymentChecklist:payments,portfolioAssets:assets},old);
     return [...current.filter(x=>x.month!==month),next].sort((a,b)=>a.month.localeCompare(b.month));
   });
 };
 const quick=[
   {label:'Nova receita',action:onIncome, icon:'↗'},
   {label:'Novo pagamento',action:onPayment,icon:'↘'},
   {label:'Recorrências',action:onRecurring,icon:'↻'},
   {label:'Investimentos',action:onInvest,icon:'◇'},
   {label:'Metas',action:onGoals,icon:'◎'}
 ];
 return <section aria-label="Visão inteligente do casal" className="space-y-4 mb-6">
   <div className="nos-hero rounded-[26px] p-5 sm:p-7">
     <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
       <div>
         <p className="text-[11px] uppercase tracking-[.24em] font-extrabold text-teal-200/90">VISÃO FINANCEIRA COMPARTILHADA</p>
         <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">Seu dinheiro, com mais clareza.</h2>
         <p className="mt-1.5 text-sm text-slate-300">Acompanhem juntos os números de {labelMonth}.</p>
       </div>
       <span className="rounded-full border border-teal-300/25 bg-teal-200/10 px-3 py-2 text-[11px] font-bold text-teal-100">✦ Resumo inteligente</span>
     </div>
     <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
       <Metric label="Disponível confirmado" value={formatMoney(data.cash.confirmedNet)} detail="Recebido − efetivamente pago" accent={data.cash.confirmedNet<0?'text-rose-300':'text-[#7ce9d1]'} />
       <Metric label="Saldo projetado" value={formatMoney(data.cash.plannedNet)} detail="Entradas previstas − contas agendadas" accent="text-sky-200" />
       <Metric label="Ainda a pagar" value={formatMoney(data.cash.scheduledPayments-data.cash.paidPayments)} detail={data.pending.length+' pagamento(s) pendente(s)'} accent="text-violet-200" />
     </div>
   </div>
   <div className={pane}>
     <div className="flex items-center justify-between gap-3 flex-wrap">
       <div><h3 className="text-base font-bold text-white">Ações rápidas</h3><p className="text-xs text-slate-400 mt-1">Menos cliques para organizar o dia a dia.</p></div>
     </div>
     <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
       {quick.map(q=><button key={q.label} type="button" onClick={q.action} className="nos-quick group rounded-xl border border-white/10 bg-white/[.035] px-3 py-3 text-left text-xs font-semibold text-slate-100 hover:bg-teal-300/10 hover:border-teal-300/30 transition-colors">
        <span className="block text-xl mb-2 text-teal-300 group-hover:text-teal-200">{q.icon}</span>{q.label}
       </button>)}
     </div>
   </div>
   <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
     <div className={pane+' lg:col-span-3'}>
       <div className="flex items-center justify-between gap-2"><h3 className="text-base font-bold text-white">Alertas do mês</h3>
         <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-slate-300">{data.alerts.length} alerta(s)</span>
       </div>
       <p className="text-xs mt-1 mb-4 text-slate-400">Vencimentos, recebimentos e limites. Não são notificações externas.</p>
       {data.alerts.length? <div className="space-y-2">{data.alerts.map(a=><div key={a.id} className={'rounded-xl p-3 border flex items-start gap-3 '+(a.level==='urgent'?'bg-rose-500/[.075] border-rose-500/20':a.level==='warning'?'bg-amber-500/[.07] border-amber-500/20':'bg-sky-500/[.07] border-sky-500/20')}>
         <span className={'mt-0.5 text-base '+(a.level==='urgent'?'text-rose-300':a.level==='warning'?'text-amber-300':'text-sky-300')}>{a.level==='urgent'?'!':a.level==='warning'?'◷':'i'}</span>
         <div><p className="text-xs font-extrabold text-slate-100">{a.title}</p><p className="text-xs text-slate-400 mt-1">{a.detail}</p></div>
       </div>)}</div> : <div className="rounded-xl border border-teal-400/15 bg-teal-400/5 p-4 text-sm text-teal-100">✓ Nenhum alerta importante encontrado para os lançamentos registrados.</div>}
     </div>
     <div className={pane+' lg:col-span-2'}>
       <h3 className="text-base font-bold text-white">Leituras automáticas</h3>
       <p className="text-xs mt-1 mb-4 text-slate-400">Cálculos a partir dos dados cadastrados.</p>
       {data.insights.length? <div className="space-y-3">{data.insights.map(x=><div key={x.id} className="border-b border-white/[.07] pb-3 last:border-0 last:pb-0">
         <p className="text-[11px] font-semibold text-slate-400">{x.label}</p>
         <p className="mt-0.5 text-xl font-black text-white">{x.percent?(x.value>0?'+':'')+x.value.toFixed(1).replace('.',',')+'%':formatMoney(x.value)}</p>
         <p className="text-[11px] leading-relaxed text-slate-500">{x.explanation}</p>
       </div>)}</div> : <p className="rounded-xl bg-white/5 p-3 text-xs text-slate-400">Adicionem receitas e pagamentos para visualizar tendências.</p>}
     </div>
   </div>
   <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
     <div className={pane+' lg:col-span-3'}>
       <div className="flex flex-wrap items-center justify-between gap-3">
         <div><h3 className="text-base font-bold text-white">Fechamento do mês</h3><p className="mt-1 text-xs text-slate-400">Registro manual de um retrato financeiro. Não paga contas automaticamente.</p></div>
         <button type="button" onClick={handleClosing} className="nos-primary px-4 py-2.5 rounded-xl text-xs font-extrabold">{closing?'Atualizar fechamento':'Registrar fechamento'}</button>
       </div>
       {closing?<div className="mt-4 flex flex-wrap gap-3 items-center justify-between rounded-xl border border-white/10 bg-white/[.03] p-4">
         <div><p className="text-sm font-extrabold text-teal-200">✓ Fechamento registrado</p><p className="text-xs text-slate-400 mt-1">Última atualização: {new Date(closing.updatedAt).toLocaleString('pt-BR')}</p>
           {stale&&<p className="text-xs text-amber-300 mt-1">O mês mudou após o fechamento. Atualize para refletir novos lançamentos.</p>}</div>
         <div className="text-right"><p className="text-xs text-slate-400">Saldo confirmado no fechamento</p><p className="text-xl font-black text-white">{formatMoney(closing.confirmedNet)}</p></div>
       </div>:<p className="mt-4 text-xs text-slate-400">Ainda não há fechamento registrado para {labelMonth}. O resumo será sincronizado com a outra pessoa.</p>}
     </div>
     <div className={pane+' lg:col-span-2'}>
       <h3 className="text-base font-bold text-white">Cartões de vocês</h3>
       <p className="mt-1 text-xs text-slate-400">Uso estimado pelos itens cadastrados, não pela fatura bancária.</p>
       <div className="space-y-3 mt-4">
         {data.cardUsage.map(c=><div key={c.id}>
           <div className="flex justify-between items-center gap-2"><span className="text-xs font-semibold text-slate-200">{c.name}</span><span className="text-[11px] text-slate-400">{c.ratio===null?'Limite não definido':Math.round(c.ratio*100)+'%'}</span></div>
           <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className={'h-full rounded-full '+(c.ratio!==null&&c.ratio>=1?'bg-rose-400':'bg-gradient-to-r from-teal-400 to-violet-400')} style={{width: (c.ratio===null?0:Math.min(100,c.ratio*100))+'%'}} /></div>
         </div>)}
       </div>
     </div>
   </div>
 </section>;
}
