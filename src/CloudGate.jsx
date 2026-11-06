import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cloudClient, cloudConfigured } from './cloudClient.js';
import { rebaseSnapshot, snapshotsEqual } from './cloudMerge.js';
import App from './App.jsx';

import { SharedContext } from './SharedContext.js';

const panel = 'max-w-md mx-auto mt-16 rounded-2xl border border-[#294357] bg-[#101f30] p-7 text-slate-100 shadow-2xl';
const input = 'w-full rounded-xl border border-[#345367] bg-[#081525] px-3 py-2.5 text-slate-100 placeholder:text-slate-500';
const primary = 'rounded-xl bg-teal-400 px-4 py-2.5 font-bold text-[#07111f] hover:bg-teal-300 disabled:opacity-50';
const muted = 'text-sm text-slate-400';

function cloudErrorMessage(error) { return error?.message || 'Houve um erro de conexão. Tente novamente.'; }

export default function CloudGate() {
  const [user, setUser] = useState(undefined);
  const [workspace, setWorkspace] = useState(null);
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(cloudConfigured);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newName, setNewName] = useState('Nosso financeiro');
  const [inviteValue, setInviteValue] = useState(() => new URLSearchParams(window.location.search).get('invite') || '');

  useEffect(() => {
    if (!cloudClient) return;
    let mounted = true;
    cloudClient.auth.getUser().then(({ data, error }) => {
      if (mounted) { setUser(data?.user || null); setError(error ? cloudErrorMessage(error) : ''); }
    });
    const { data: { subscription } } = cloudClient.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
      if (!session?.user) { setWorkspace(null); setRemote(null); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const loadWorkspace = useCallback(async (skipInvite = false) => {
    if (!cloudClient || !user) return;
    setLoading(true); setError('');
    try {
      const { data: memberships, error: memberError } = await cloudClient.from('finance_members')
        .select('workspace_id,role').eq('user_id', user.id).limit(1);
      if (memberError) throw memberError;
      let member = memberships?.[0] || null;
      if (inviteValue && !member && !skipInvite) {
        const { error: joinError } = await cloudClient.rpc('accept_finance_invite', { p_invite_id: inviteValue.trim() });
        if (joinError) throw joinError;
        const { data: joined, error: joinedError } = await cloudClient.from('finance_members')
          .select('workspace_id,role').eq('user_id', user.id).limit(1);
        if (joinedError) throw joinedError;
        member = joined?.[0] || null;
        window.history.replaceState(null, '', window.location.pathname);
        setInviteValue('');
      }
      if (member) {
        const { data: state, error: stateError } = await cloudClient.from('finance_state')
          .select('data,revision').eq('workspace_id', member.workspace_id).single();
        if (stateError) throw stateError;
        setRemote({ data: state.data || {}, version: state.revision, workspaceId: member.workspace_id });
        setWorkspace(member);
      } else {
        setWorkspace(null); setRemote(null);
      }
    } catch (e) { setError(cloudErrorMessage(e)); }
    finally { setLoading(false); }
  }, [user?.id, inviteValue]);

  useEffect(() => { if (user && cloudClient) loadWorkspace(); else if (user === null) setLoading(false); }, [user?.id, loadWorkspace]);

  const handleAuth = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'register') {
        const redirect = `${window.location.origin}${window.location.pathname}${inviteValue ? '?invite=' + encodeURIComponent(inviteValue) : ''}`;
        const { data, error } = await cloudClient.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirect } });
        if (error) throw error;
        if (!data.session) setError('Conta criada. Confirme o e-mail recebido e depois faça login.');
        else setUser(data.user);
      } else {
        const { data, error } = await cloudClient.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setUser(data.user);
      }
    } catch (e) { setError(cloudErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const createWorkspace = async () => {
    setLoading(true); setError('');
    try {
      const { error } = await cloudClient.from('finance_workspaces').insert({ name: newName.trim() || 'Nosso financeiro', owner_id: user.id });
      if (error) throw error;
      await loadWorkspace();
    } catch (e) { setError(cloudErrorMessage(e)); setLoading(false); }
  };

  const joinWorkspace = async () => {
    if (!inviteValue.trim()) return;
    setLoading(true); setError('');
    try {
      const { error } = await cloudClient.rpc('accept_finance_invite', { p_invite_id: inviteValue.trim() });
      if (error) throw error;
      setInviteValue('');
      window.history.replaceState(null, '', window.location.pathname);
      await loadWorkspace(true);
    } catch (e) { setError(cloudErrorMessage(e)); setLoading(false); }
  };

  if (!cloudConfigured) return <><div className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-2 text-center text-xs text-amber-200">Prévia local: sincronização não configurada. Não registre dados reais nesta prévia pública.</div><App /></>;
  if (user === undefined || (user && loading && !remote && !error)) return <div className={panel}>Conectando ao NÓS | Financeiro…</div>;
  if (!user) return <div className="min-h-screen bg-[#07111f] p-5"><form className={panel} onSubmit={handleAuth}>
    <h1 className="mb-2 text-3xl font-extrabold text-teal-300">NÓS | Financeiro</h1>
    <p className="mb-6 text-sm text-slate-400">Entradas privadas para vocês dois, com dados sincronizados.</p>
    {inviteValue && <p className="mb-4 rounded-lg bg-teal-950/50 p-3 text-xs text-teal-200">Convite recebido. Crie sua própria conta ou faça login com o e-mail convidado.</p>}
    <label className="mb-1 block text-sm" htmlFor="cloud-email">E-mail</label><input id="cloud-email" className={input} type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
    <label className="mb-1 mt-4 block text-sm" htmlFor="cloud-pass">Senha</label><input id="cloud-pass" className={input} type="password" required minLength={8} autoComplete={mode==='register'?'new-password':'current-password'} value={password} onChange={e => setPassword(e.target.value)} />
    <button className={`${primary} mt-5 w-full`} disabled={loading}>{mode === 'register' ? 'Criar minha conta' : 'Entrar'}</button>
    <button className="mt-4 w-full text-sm text-teal-300 underline" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Criar uma conta' : 'Já tenho uma conta'}</button>
    {error && <p role="status" className="mt-4 text-sm text-amber-300">{error}</p>}
  </form></div>;
  if (!workspace || !remote) return <div className="min-h-screen bg-[#07111f] p-5"><div className={panel}>
    <h1 className="mb-2 text-2xl font-extrabold text-teal-300">NÓS | Financeiro</h1>
    <p className="mb-5 text-sm text-slate-400">Crie o espaço do casal ou aceite um convite enviado pelo parceiro.</p>
    <label htmlFor="workspace-name" className="block text-sm mb-1">Nome do espaço</label>
    <input id="workspace-name" className={input} value={newName} onChange={e=>setNewName(e.target.value)} />
    <button type="button" className={`${primary} mt-3 w-full`} onClick={createWorkspace} disabled={loading}>Criar nosso espaço</button>
    <p className="my-5 text-center text-xs text-slate-500">ou</p>
    <label htmlFor="invite-code" className="block text-sm mb-1">Código do convite recebido</label>
    <input id="invite-code" className={input} value={inviteValue} onChange={e=>setInviteValue(e.target.value)} placeholder="Cole o código do convite" />
    <button type="button" className={`${primary} mt-3 w-full`} onClick={joinWorkspace} disabled={loading || !inviteValue.trim()}>Entrar no espaço compartilhado</button>
    {error && <p role="alert" className="mt-4 text-sm text-amber-300">{error}</p>}
    <button type="button" className="mt-6 text-xs text-slate-400 underline" onClick={()=>cloudClient.auth.signOut()}>Sair desta conta</button>
  </div></div>;
  return <SharedDataProvider key={`${user.id}-${workspace.workspace_id}`} user={user} workspace={workspace} initial={remote} />;
}

function SharedDataProvider({ user, workspace, initial }) {
  const sessionKey = `nos_finance_draft_${user.id}_${workspace.workspace_id}`;
  // Resgata rascunhos ANTES de montar o App para não perder alterações offline.
  const [sharedData, setSharedData] = useState(() => {
    try {
      const raw = window.localStorage.getItem(sessionKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft?.base && draft?.data) return rebaseSnapshot(draft.base, draft.data, initial.data);
      }
    } catch (e) { console.warn('Rascunho local não pôde ser recuperado.', e); }
    return initial.data;
  });
  const dataRef = useRef(sharedData);
  const baseRef = useRef({ data: initial.data, version: initial.version });
  const [status, setStatus] = useState('sincronizado');
  const [tick, setTick] = useState(0);
  const savingRef = useRef(false);
  const retryAfterRef = useRef(0);

  const setShared = useCallback((key, update) => {
    setSharedData(current => {
      const prev = current[key];
      const next = typeof update === 'function' ? update(prev) : update;
      if (next === prev) return current;
      const updated = { ...current, [key]: next };
      dataRef.current = updated;
      return updated;
    });
  }, []);

  const fetchRemote = useCallback(async () => {
    const { data, error } = await cloudClient.from('finance_state')
      .select('data,revision').eq('workspace_id', workspace.workspace_id).single();
    if (error) throw error;
    return { data: data.data || {}, version: data.revision };
  }, [workspace.workspace_id]);

  const refreshFromCloud = useCallback(async () => {
    try {
      const newest = await fetchRemote();
      const prevBase = baseRef.current;
      if (newest.version <= prevBase.version) return;
      baseRef.current = newest;
      setSharedData(current => {
        const merged = rebaseSnapshot(prevBase.data, current, newest.data);
        dataRef.current = merged;
        return merged;
      });
    } catch (error) { setStatus('erro'); console.error('Falha ao atualizar dados remotos:', error); }
  }, [fetchRemote]);

  const saveChanges = useCallback(async () => {
    if (savingRef.current) return;
    if (snapshotsEqual(dataRef.current, baseRef.current.data)) { setStatus('sincronizado'); return; }
    savingRef.current = true;
    setStatus('salvando');
    const base = baseRef.current;
    const desired = dataRef.current;
    try {
      window.localStorage.setItem(sessionKey, JSON.stringify({ base: base.data, data: desired }));
      const { data: newRevision, error } = await cloudClient.rpc('save_finance_state', {
        p_workspace_id: workspace.workspace_id,
        p_expected_revision: base.version,
        p_data: desired,
      });
      if (error) throw error;
      retryAfterRef.current = 0;
      if (newRevision === null || newRevision === undefined) {
        const newer = await fetchRemote();
        baseRef.current = newer;
        setSharedData(current => {
          const merged = rebaseSnapshot(base.data, current, newer.data);
          dataRef.current = merged;
          return merged;
        });
        setStatus('pendente');
      } else {
        baseRef.current = { data: desired, version: newRevision };
        // Só remove rascunho se nenhuma edição adicional aconteceu durante o envio.
        if (snapshotsEqual(dataRef.current, desired)) {
          window.localStorage.removeItem(sessionKey);
          setStatus('sincronizado');
        } else setStatus('pendente');
      }
    } catch (error) { retryAfterRef.current = Date.now() + 12000; setStatus('erro'); console.error('Erro ao sincronizar dados:', error); }
    finally { savingRef.current = false; setTick(x => x + 1); }
  }, [fetchRemote, sessionKey, workspace.workspace_id]);

  useEffect(() => {
    if (snapshotsEqual(sharedData, baseRef.current.data)) return;
    // Salva imediatamente um rascunho local em caso de fechamento abrupto.
    try { window.localStorage.setItem(sessionKey, JSON.stringify({ base: baseRef.current.data, data: sharedData })); }
    catch (e) { console.warn('Não foi possível guardar o rascunho local:', e); }
    const delay = Math.max(800, retryAfterRef.current - Date.now());
    const timer = window.setTimeout(saveChanges, delay);
    return () => window.clearTimeout(timer);
  }, [sharedData, tick, saveChanges, sessionKey]);

  useEffect(() => {
    const channel = cloudClient.channel(`finance-state-${workspace.workspace_id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'finance_state', filter: `workspace_id=eq.${workspace.workspace_id}` }, () => { refreshFromCloud(); })
      .subscribe();
    const poll = window.setInterval(refreshFromCloud, 20000);
    return () => { window.clearInterval(poll); cloudClient.removeChannel(channel); };
  }, [workspace.workspace_id, refreshFromCloud]);

  const value = { data: sharedData, set: setShared, status, user, workspace };
  return <SharedContext.Provider value={value}><App /></SharedContext.Provider>;
}

