# NÓS | Financeiro

Este projeto foi adaptado do dashboard React criado no Gemini. Mantém as funcionalidades originais e acrescenta recorrências, histórico e visão de caixa realizado. Pode ser desenvolvido e publicado sem Gemini. **Os dados pessoais antigos não foram incluídos nos arquivos deste pacote.**

## O que mudou

- Aba **Recorrências** para cadastrar salários e pagamentos mensais, com geração ao visitar cada mês, proteção contra duplicatas e pausa/remoção de regras.
- Receita **prevista** separada de **confirmada**; entradas de backup antigo ficam como previstas até serem marcadas como recebidas.
- **Saldo confirmado**, a diferença entre receitas confirmadas e contas quitadas do cronograma, sem dupla contagem das despesas mestre.
- Histórico visual dos últimos 12 meses considerando lançamentos existentes, confirmado e planejado.
- Importação de JSON com validação de IDs duplicados, datas, valores e estrutura antes da confirmação.
- Avisos para abates manuais superiores a pagamentos e receitas com alocação superior ao valor recebido.

- **Cartões de crédito:** por padrão, um Nubank para Você e três para Ela (Nubank, Inter e Renner). A atualização completa cartões faltantes sem perder limites, IDs e assinaturas de cartões existentes.
- Nova identidade visual: verde-água, azul-petróleo e detalhes violeta.
- Corrigidos os totais de receitas/pagamentos para respeitar o mês selecionado e removidos valores salariais fixos nos comparativos.
- Reserva de emergência considera despesas dos dois parceiros na fase atual.
- Projeções usam o patrimônio cadastrado, aportes por ano e hipótese de proventos editável.
- Fontes combinadas do cronograma passam a ser montadas com base nas receitas do mês, sem exemplos pessoais embutidos no site.
- Cadastro e exclusão de ativos da carteira, além dos recursos de compras e edição já existentes.
- Exportação JSON via arquivo Blob, confirmação antes de importar ou zerar, e aviso de restauração na primeira visita.
- Removida a dependência do Supabase: este primeiro pacote roda inteiramente no navegador.

## AVISO DE PRIVACIDADE — LEIA ANTES DE PUBLICAR

**GitHub Pages é um site público, sem autenticação de acesso.** Não coloque o backup, os seus dados financeiros, senhas, chaves de API ou um `.env` com segredos no repositório. As receitas/despesas/ativos reais ficam no `localStorage` do navegador em que você importar o backup — não no código fonte nem no GitHub. No entanto, qualquer pessoa que usar o **mesmo navegador e perfil** poderá acessar os valores guardados localmente. Em dispositivo diferente, os dados não aparecerão sozinhos. Isso NÃO oferece privacidade adequada em computador compartilhado e NÃO equivale a um app com login.

O domínio `sites.google.com` e a URL `github.io` possuem armazenamentos diferentes. Para migrar, você **precisa importar seu arquivo JSON no novo site**, mesmo se acessar ambos no mesmo computador.

## Publicar pelo GitHub Pages (sem Gemini)

1. Crie uma conta em https://github.com se ainda não tiver.
2. Crie um repositório, por exemplo `nos-financeiro` (pode ser público; veja o aviso de privacidade acima).
3. Extraia o arquivo ZIP e envie **todos os arquivos do projeto, mantendo pastas e nomes**, incluindo a pasta `.github/workflows`, para a raiz do repositório. Não envie o arquivo ZIP como se fosse o projeto; é preciso extrair.
4. Abra **Settings → Pages → Build and deployment → Source** e selecione **GitHub Actions**.
5. Abra a aba **Actions** e aguarde o fluxo `Publicar NÓS Financeiro no GitHub Pages` completar com sucesso. Se não iniciar, abra a ação e clique em `Run workflow`.
6. Acesse a URL informada em **Settings → Pages** (normalmente `https://SEU-USUARIO.github.io/nos-financeiro/`).
7. Na versão nova do dashboard, clique em **Carregar** ou **Importar meu backup**, selecione seu JSON salvo e confirme. Confira as receitas, despesas, pagamentos e cartões antes de usar.
8. Somente após conferir, se quiser, incorpore a URL do GitHub Pages no seu Google Sites. **Não apague a publicação original antes.**

Dica: quem usa GitHub Desktop pode criar o repositório local, arrastar os arquivos extraídos para a pasta, fazer o primeiro commit e publicar. Ao adicionar arquivos pelo navegador, confira se a pasta oculta `.github` também foi enviada.

## Usar no computador para desenvolvimento

Instale Node.js 22 ou superior e, na pasta raiz:

```bash
npm install
npm run dev
```

Para gerar os arquivos estáticos: `npm run build` (cria `dist/`).

## Restaurar o backup

Clique em **Carregar**. O formato do arquivo JSON exportado pela versão anterior é compatível. Não publique esse arquivo no GitHub. Após confirmar que os dados foram importados, gere um novo backup da versão atualizada.

## O que NÃO está incluído

- Não há banco de dados, login ou sincronização automática entre vocês dois.
- Não há cotações automáticas de ações; os preços são manuais.
- Projeções de retorno e dividendos são cenários hipotéticos, não promessas.
- Despesas mestre continuam organizadas por fase. O fluxo de caixa e o histórico usam somente os lançamentos datados de receitas e cronograma; não somam despesas mestre de novo.
- Recorrências criam entradas somente nos meses visitados; não são projetadas retroativamente para os 12 meses do gráfico.
- Uma receita legada sem confirmação é tratada como **prevista**, mesmo se a data for passada. Marque manualmente como recebida para entrar no saldo confirmado.
- Não há proteção de privacidade contra quem utiliza o mesmo computador/perfil do navegador.

## Testes antes da publicação

```bash
npm install
npm test
npm run build
```

A branch de revisão tem um workflow de CI para executar testes e build; isso **não publica** o site automaticamente.

## Validação realizada neste ambiente

Sintaxe JSX/JavaScript inspecionada por transpilição com TypeScript; testes básicos das funções de renderização e leitura do backup rodados localmente quando possível. **Não foi possível executar `npm install`/build completo aqui porque o registro npm não estava acessível neste ambiente.** O GitHub Actions está configurado para instalar as dependências na publicação; confira o resultado da execução para confirmar.