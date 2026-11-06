-- NÓS | Financeiro — executar UMA VEZ no SQL Editor de um projeto Supabase novo.
-- Nunca incluir service_role ou senhas no frontend ou repositório GitHub.
-- Dois usuários autenticados têm acesso à mesma carteira via convite de e-mail.

create table if not exists public.finance_workspaces (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null default 'Nosso financeiro',
 created_at timestamptz not null default now()
);
create table if not exists public.finance_members (
 workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('owner','member')),
 joined_at timestamptz not null default now(),
 primary key (workspace_id,user_id),
 unique (user_id)
);
create index if not exists finance_members_user_idx on public.finance_members(user_id);
create table if not exists public.finance_state (
 workspace_id uuid primary key references public.finance_workspaces(id) on delete cascade,
 data jsonb not null default '{}'::jsonb,
 revision bigint not null default 0,
 updated_at timestamptz not null default now(),
 constraint finance_state_is_object check(jsonb_typeof(data)='object')
);
create table if not exists public.finance_invites (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
 recipient_email text not null check (length(recipient_email) between 5 and 254 and recipient_email = lower(recipient_email)),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '7 days'),
 used_at timestamptz
);
create index if not exists finance_invites_workspace_idx on public.finance_invites(workspace_id);

alter table public.finance_workspaces enable row level security;
alter table public.finance_members enable row level security;
alter table public.finance_state enable row level security;
alter table public.finance_invites enable row level security;

-- Serviços anônimos não leem dados; permissões são concedidas explicitamente.
revoke all on public.finance_workspaces, public.finance_members, public.finance_state, public.finance_invites from anon, authenticated;
grant select, insert on public.finance_workspaces to authenticated;
grant select on public.finance_members to authenticated;
grant select on public.finance_state to authenticated;
grant select, insert on public.finance_invites to authenticated;

-- Policies de leitura não são recursivas: cada usuário consulta apenas suas próprias memberships.
create policy "members see own membership" on public.finance_members for select to authenticated
 using (user_id = (select auth.uid()));
create policy "members see shared workspace" on public.finance_workspaces for select to authenticated
 using (exists (select 1 from public.finance_members m where m.workspace_id = finance_workspaces.id and m.user_id = (select auth.uid())));
create policy "create personal workspace" on public.finance_workspaces for insert to authenticated
 with check (owner_id = (select auth.uid()));
create policy "members read financial snapshot" on public.finance_state for select to authenticated
 using (exists (select 1 from public.finance_members m where m.workspace_id = finance_state.workspace_id and m.user_id = (select auth.uid())));
create policy "owner sees sent invitations" on public.finance_invites for select to authenticated
 using (exists (select 1 from public.finance_members m where m.workspace_id=finance_invites.workspace_id and m.user_id=(select auth.uid()) and m.role='owner'));
create policy "owner issues invitation" on public.finance_invites for insert to authenticated
 with check (exists (select 1 from public.finance_members m where m.workspace_id=finance_invites.workspace_id and m.user_id=(select auth.uid()) and m.role='owner'));

-- Trigger rodando com privilégios do criador, escopo fixo e verificando owner_id.
create or replace function public.finance_workspace_bootstrap() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.owner_id <> auth.uid() then raise exception 'Acesso negado'; end if;
  insert into public.finance_members(workspace_id,user_id,role) values(new.id,new.owner_id,'owner');
  insert into public.finance_state(workspace_id) values(new.id);
  return new;
end; $$;
revoke execute on function public.finance_workspace_bootstrap() from public, anon, authenticated;
drop trigger if exists tr_finance_workspace_bootstrap on public.finance_workspaces;
create trigger tr_finance_workspace_bootstrap after insert on public.finance_workspaces
 for each row execute function public.finance_workspace_bootstrap();

-- Convite de uso único: exige sessão autenticada, e-mail destinatário e expiração.
create or replace function public.accept_finance_invite(p_invite_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare inv public.finance_invites%rowtype; caller uuid := auth.uid(); caller_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
 if caller is null or caller_email = '' then raise exception 'Faça login com o e-mail convidado'; end if;
 select * into inv from public.finance_invites where id=p_invite_id for update;
 if not found or inv.used_at is not null or inv.expires_at < now() or inv.recipient_email <> caller_email then
   raise exception 'Convite inválido, expirado ou destinado a outro e-mail';
 end if;
 if exists (select 1 from public.finance_members where user_id=caller) then
   raise exception 'Esta conta já pertence a outro espaço';
 end if;
 if (select count(*) from public.finance_members where workspace_id=inv.workspace_id)>=2 then
   raise exception 'Espaço já tem dois participantes';
 end if;
 insert into public.finance_members(workspace_id,user_id,role) values(inv.workspace_id,caller,'member');
 update public.finance_invites set used_at=now() where id=inv.id;
 return inv.workspace_id;
end; $$;
revoke execute on function public.accept_finance_invite(uuid) from public, anon;
grant execute on function public.accept_finance_invite(uuid) to authenticated;

-- Atualização otimista por revisão; não permite escrita fora do espaço autenticado.
create or replace function public.save_finance_state(p_workspace_id uuid, p_expected_revision bigint, p_data jsonb) returns bigint
language plpgsql security definer set search_path = '' as $$
declare next_revision bigint;
begin
 if auth.uid() is null or not exists(
   select 1 from public.finance_members m where m.workspace_id=p_workspace_id and m.user_id=auth.uid()
 ) then raise exception 'Sem permissão para editar esta carteira'; end if;
 if p_data is null or jsonb_typeof(p_data)<>'object' or pg_catalog.pg_column_size(p_data)>2000000 then
   raise exception 'Dados inválidos ou muito grandes'; end if;
 update public.finance_state
   set data=p_data, revision=revision+1, updated_at=now()
   where workspace_id=p_workspace_id and revision=p_expected_revision
   returning revision into next_revision;
 return next_revision; -- null significa conflito; cliente deve buscar e mesclar nova versão
end; $$;
revoke execute on function public.save_finance_state(uuid,bigint,jsonb) from public, anon;
grant execute on function public.save_finance_state(uuid,bigint,jsonb) to authenticated;

-- Realtime: o payload só chega aos membros autorizados pelo RLS da tabela.
do $$ begin
 if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='finance_state') then
   alter publication supabase_realtime add table public.finance_state;
 end if;
end $$;
