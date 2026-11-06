# NÓS | Financeiro — login privado e sincronização para duas pessoas

## O que foi implementado

- Login por **e-mail e senha**, com **contas individuais** para os dois participantes.
- Um único espaço do casal: cada alteração aparece para os dois após sincronização.
- Convite de **uso único**, válido por **7 dias** e restrito ao **e-mail** escolhido pelo responsável.
- Permissões **Row Level Security (RLS)** no banco: usuários fora do espaço não podem ler nem editar os dados.
- Atualizações por revisão com mesclagem por ID: alterações em lançamentos diferentes não devem se sobrescrever, mesmo com edição simultânea.
- Atualização em tempo real via Supabase Realtime, com verificação adicional a cada 20 segundos.
- Rascunho temporário local em caso de interrupção da internet, por usuário e espaço, com novo envio quando reconectar.
- Importação dos backups antigos e exportação JSON, sem inserir dados financeiros no GitHub.

**Limitação importante:** se os dois alterarem o MESMO lançamento ao mesmo tempo, a última edição sincronizada poderá prevalecer. Evitem editar o mesmo item simultaneamente.

## Antes de publicar: configurar o Supabase

1. Abra https://supabase.com/dashboard e crie ou escolha **um projeto de vocês**.
2. Abra **SQL Editor** e execute o arquivo `supabase_setup.sql` presente neste projeto, em um banco novo ou avaliado para essa finalidade. Não execute em um banco com tabelas de mesmo nome sem revisar o script.
3. Em **Authentication → Providers → Email**, habilite e-mail/senha e **confirmação de e-mail**.
4. Em **Project Settings → API**, copie somente a **Project URL** e a **Publishable key** (ou `anon` key). **NUNCA** use a `service_role` key no navegador ou GitHub.
5. No GitHub, abra o repositório `Financeiro-Casal` → **Settings → Secrets and variables → Actions → Variables**. Crie exatamente:
   - `VITE_SUPABASE_URL` com a Project URL (https://...supabase.co)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` com a chave pública publishable (ou anon)
6. Em **Authentication → URL Configuration** do Supabase, configure **Site URL** para o endereço publicado do GitHub Pages (`https://andrebarbosasdesign-blip.github.io/Financeiro-Casal/`) e adicione esse endereço às **Redirect URLs** permitidas. Para desenvolvimento local, adicione também `http://localhost:5173/**` somente se necessário.
7. Após aplicar o SQL e as variáveis, publique uma nova build pelo GitHub Actions. No código, a ausência dessas duas variáveis mantém **somente a prévia local**, sem sincronização.

**Não compartilhe suas senhas, chave `service_role`, token pessoal do GitHub ou backup JSON neste repositório.** A publishable key é pública por definição; a segurança depende das políticas RLS configuradas no passo 2.

## Primeiro acesso

1. Acesse o GitHub Pages do dashboard.
2. Clique em **Criar uma conta**. Confirme o e-mail e entre com suas credenciais.
3. Clique em **Criar nosso espaço**.
4. No canto superior da área financeira, abra **Acesso** → informe o e-mail da sua namorada → **Gerar convite privado**.
5. Envie o link por um canal privado. **Ela deve abrir o convite e criar a conta com exatamente o e-mail convidado**, confirmá-lo e entrar. O convite expira em 7 dias e só pode ser usado uma vez.
6. Os dois verão o mesmo espaço financeiro; vocês têm logins separados e acesso aos mesmos lançamentos.
7. Só depois de testar com lançamentos fictícios, **importe o backup financeiro JSON no dashboard publicado**, usando sua conta. Aguarde o indicador **Dados compartilhados • sincronizados** e confira se aparece no dispositivo dela.

## Teste em dois dispositivos

1. Com ambos conectados ao mesmo espaço, cadastre uma receita de teste no computador A.
2. Confira se ela aparece no computador B; pode levar alguns segundos.
3. No B, marque a receita como recebida. Confira no A.
4. Exporte um backup após a primeira sincronização.
5. Exclua apenas o lançamento de teste, não os dados reais.

## Segurança e operação

- Publicar o **código** no GitHub é aceitável; **os dados reais não devem ser enviados para o repositório**.
- Os dados compartilhados ficam no projeto Supabase escolhido, com RLS. Quando a conexão falhar, observe a mensagem **Falha na sincronização** e não feche a janela antes de o status voltar a sincronizado, quando possível.
- Um rascunho pendente pode ficar no `localStorage` deste navegador para recuperação. Evite computadores compartilhados e finalize a sessão ao terminar.
- Faça backups JSON periódicos armazenados em local seguro. Backup não é uma forma de sincronização automática.
- GitHub Pages hospeda a interface estática; Supabase Auth, PostgreSQL e Realtime fazem login e sincronização. Google Sites pode incorporar a URL publicada mais tarde.

## Situação atual

A integração do código e o script de banco estão preparados no repositório. **A sincronização NÃO estará ativa até a configuração do projeto Supabase, execução do SQL, inclusão das variáveis e publicação de nova build.** Não publique nem importe os dados reais antes dos testes de acesso.
