import React, { useState } from 'react';
import { useSharedContext } from './SharedContext.js';
import { cloudClient } from './cloudClient.js';
const input = 'w-full rounded-xl border border-[#345367] bg-[#081525] px-3 py-2.5 text-slate-100';
const primary = 'rounded-xl bg-teal-400 px-4 py-2.5 font-bold text-[#07111f] hover:bg-teal-300';
const cloudErrorMessage = (e) => e?.message || 'Erro ao convidar';
export default function CloudToolbar() {
  const shared = useSharedContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [message, setMessage] = useState('');
  if (!shared) return null;
  const makeInvite = async (event) => {
    event.preventDefault(); setMessage('');
    try {
      if (shared.workspace.role !== 'owner') throw new Error('Somente quem criou o espaço pode convidar.');
      const { data, error } = await cloudClient.from('finance_invites')
        .insert({ workspace_id: shared.workspace.workspace_id, recipient_email: inviteEmail.trim().toLowerCase() })
        .select('id').single();
      if (error) throw error;
      setInviteLink(`${window.location.origin}${window.location.pathname}?invite=${data.id}`);
    } catch (e) { setMessage(cloudErrorMessage(e)); }
  };
  return <div className="w-full sm:w-auto rounded-xl border border-teal-500/25 bg-teal-500/10 px-3 py-2 text-xs text-teal-200">
    <div className="flex items-center justify-between gap-2"><span aria-live="polite">☁ {shared.status === 'sincronizado' ? 'Dados compartilhados • sincronizados' : shared.status === 'salvando' ? 'Salvando na nuvem…' : shared.status === 'erro' ? 'Falha na sincronização • verifique sua conexão' : 'Alterações pendentes'}</span>
    <button type="button" className="underline" onClick={()=>setIsOpen(x=>!x)}>Acesso</button></div>
    {isOpen && <div className="mt-3 max-w-xs space-y-2"><p className="break-all text-slate-300">Conta: {shared.user.email}</p>
      {shared.workspace.role === 'owner' && <form onSubmit={makeInvite} className="space-y-2"><label htmlFor="partner-email" className="block">Convidar a segunda pessoa (e-mail dela)</label>
        <input id="partner-email" className={input} type="email" required value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
        <button type="submit" className={primary}>Gerar convite privado</button>
        {inviteLink && <><p>Copie o link e envie somente para sua parceira:</p><input aria-label="Link de convite" className={input} readOnly value={inviteLink} onFocus={e=>e.target.select()} />
        <button className="underline" type="button" onClick={()=>navigator.clipboard?.writeText(inviteLink)}>Copiar link</button></>}
      </form>}
      {message && <p role="alert" className="text-amber-300">{message}</p>}
      <button className="underline text-rose-300" type="button" onClick={()=>cloudClient.auth.signOut()}>Sair da conta</button>
    </div>}
  </div>;
}
