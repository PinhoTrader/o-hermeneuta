---
name: padrao-deploy
description: Use esta skill antes de mexer em deploy, variáveis de ambiente de produção, `vercel.json`, ou qualquer coisa que toque na topologia de hospedagem do Hermeneuta. Documenta o que existe de fato (Vercel + função serverless única) e a armadilha real do MCP da Vercel não autorizado nesta sessão.
---

# Padrão de deploy — O Hermeneuta

Fonte: `vercel.json`, `firebase-applet-config.json`, `.env.example`,
`package.json`, `api/gemini.ts`, `README.md`, `doc/stack/03_infraestrutura_deploy.md`
(revisado em 2026-08-17). Skill autocontida — não presumir que quem a lê já
leu `doc/stack/03_infraestrutura_deploy.md`.

## Topologia real

- **Hospedagem**: Vercel, projeto `o-hermeneuta`, time
  `escoladetraders-projects`. URL de produção: `o-hermeneuta.vercel.app`.
- **Frontend**: `vite build` gera `dist/`, servido estático pela Vercel.
- **Backend**: **uma única função serverless**, `api/gemini.ts` — handler
  Node puro (`IncomingMessage`/`ServerResponse`), não usa Express (mesmo
  `express` tendo estado historicamente em `package.json`, ver
  `precedencia-e-gaps` gap 2). Não presumir Cloud Run, Cloud Functions ou
  qualquer outro serviço do Google Cloud — não existem neste projeto.
- **Roteamento**: `vercel.json` define dois rewrites: `/api/(.*)` → função
  serverless, `/(.*)` → `index.html` (fallback de SPA para as rotas do React
  Router).
- **Dados**: Firebase Firestore + Auth (ver `firebase-applet-config.json` e
  `padrao-firestore-rules`) — não hospedado pela Vercel, é um projeto
  Firebase separado (`gen-lang-client-0860065051`).
- **Deploy automático**: todo push em `main` no repositório
  `github.com/PinhoTrader/o-hermeneuta` dispara build + deploy via
  integração Git↔Vercel nativa. Desde 2026-08-23 existe
  `.github/workflows/ci.yml` (typecheck, build, testes unitários e
  `firestore.rules` contra o emulador) rodando em push/PR para `main` — mas
  ele **não bloqueia** o deploy da Vercel, que segue seu próprio gatilho
  independente. Ou seja: mesmo com CI verde ou vermelho, um `git push` para
  `main` vai para produção sem esperar o resultado do GitHub Actions (ver
  `padrao-teste` para o que o CI cobre e não cobre).

## Variáveis de ambiente

Só duas, documentadas em `.env.example`:

| Variável | Uso | Onde configurar |
|---|---|---|
| `GEMINI_API_KEY` | Lida em `api/gemini.ts` (`getAiClient`, via `process.env.GEMINI_API_KEY`). Nunca deve chegar ao bundle do cliente — só existe no runtime da função serverless. | Vercel → Project Settings → Environment Variables, marcada para Production (e Preview, se quiser IA funcionando em preview deploys). |
| `APP_URL` | Documentada em `.env.example` e mencionada no README, mas **não há nenhuma referência a ela em `src/`, `api/`, ou nos arquivos de config** (`vite.config.ts` incluído) — confirmado via grep. Não presumir que algo depende dela hoje; se for cortada, checar de novo antes, código pode ter mudado. | Mesmo lugar, se voltar a ser usada. |

`GEMINI_API_KEY` também está ausente do `.env.local` local desta máquina
(ver `precedencia-e-gaps` gap 7) — o Instrutor de IA provavelmente não
funciona em `npm run dev` local até o usuário configurar a chave. Para
testar a rota serverless localmente, o README recomenda `vercel dev` (não
`npm run dev` puro, que não serve `api/gemini.ts`).

**Regra geral**: variáveis de ambiente de produção vivem na Vercel, não em
arquivo local versionado. `.env.example` só documenta o *nome* esperado, não
o valor. Nunca sugerir commitar um `.env` com segredo real.

## Armadilha real: MCP da Vercel não autorizado

Este ambiente Claude Code tem uma integração MCP da Vercel disponível, mas
**ela não está autorizada/autenticada nesta sessão**. Nenhum agente deve
tentar usá-la para ler ou alterar env vars, disparar deploys, ou promover
rollback de produção sem o usuário autorizar primeiro explicitamente (via
`claude mcp` ou `/mcp`). Até isso acontecer, qualquer mudança de
configuração de deploy na Vercel (env vars, domínios, rollback) é **manual
pelo usuário no painel** — um agente pode instruir os passos, não executá-los
por conta própria assumindo que o MCP já está pronto para uso.

## Rollback

- **Frontend/função serverless**: painel da Vercel tem histórico de
  deployments — "Instant Rollback" promove um deployment anterior
  diretamente; alternativa é reverter o commit em `main` e deixar o push
  disparar um novo deploy. As duas funcionam; a primeira é mais rápida em
  incidente.
- **`firestore.rules`**: **não sobe junto com o deploy da Vercel.** É
  publicado separadamente via Firebase Console ou `firebase deploy --only
  firestore:rules` (usa `firebase.json` deste repositório). Reverter é
  restaurar a versão anterior do arquivo e publicar de novo — esquecer isso
  é o erro mais fácil de cometer ao reverter um incidente que envolveu regra
  de acesso.
- **Dados do Firestore**: sem rotina de backup automatizado configurada
  neste projeto — não presumir que existe um snapshot para restaurar.

## Armadilha real: a função serverless roda como Node ESM "puro", não bundle completo

Incidente real em 2026-08-23/24: adicionar dois módulos novos com import
relativo simples (`cavarEDescobrirPrinciples.ts`, `bibleBookGenres.ts`,
importados de `api/gemini.ts`) e manter o import de
`firebase-applet-config.json` sem atributo derrubou **toda** chamada a
`/api/gemini` em produção, em dois incidentes sequenciais:

1. `ERR_IMPORT_ATTRIBUTE_MISSING` — Node exige `with { type: 'json' }` em
   import ESM de arquivo `.json`. Fix: `import firebaseConfig from
   '../firebase-applet-config.json' with { type: 'json' };`.
2. `ERR_MODULE_NOT_FOUND` — o runtime Node ESM da função serverless da
   Vercel executa os arquivos **compilados diretamente**, sem bundling
   completo estilo Vite; nesse modo o loader nativo do Node exige extensão
   explícita `.js` em todo import relativo, mesmo apontando para um arquivo
   fonte `.ts`. Fix: `import { ... } from './cavarEDescobrirPrinciples.js'`
   (não `.ts` — o loader resolve para o artefato compilado).

**Regra geral daqui para frente**: qualquer import relativo novo dentro de
`api/gemini.ts` (ou de um módulo que ele importa) precisa da extensão
`.js` explícita, e qualquer import de `.json` precisa de `with { type:
'json' }`. Isso é diferente do resto do projeto (`src/`, compilado pelo
Vite, que tolera import sem extensão) — a armadilha é específica da função
serverless. `npm run build` (Vite) e `tsc --noEmit` **não pegam esse erro**
- só aparece em runtime real da função na Vercel. Só foi descoberto rodando
`vercel logs` em produção e reproduzindo localmente via `vercel build` +
invocação direta do handler compilado.

## O que NÃO existe (não presumir)

- Sem staging formal — só Production e Preview deployments automáticos da
  Vercel por PR/branch (comportamento padrão da integração, não configurado
  à parte).
- Sem gate de teste que bloqueie o deploy (ver seção de CI acima e
  `padrao-teste`) — o CI existe e roda, mas não impede um push ruim de virar
  produção.
- Sem verificação de custo/plano documentada — não confirmado se Firebase
  está em Spark ou Blaze, nem se Vercel está em Hobby ou Pro; checar direto
  nos painéis antes de qualquer decisão baseada em custo.

## Ao propor mudança de deploy/infra

Distinguir fato observado (topologia acima) de decisão de engenharia sua
(ex.: sugerir adicionar gate de CI antes do deploy). Antes de configurar CI
real ou usar o MCP da Vercel para qualquer coisa, perguntar ao usuário —
ver limites em `precedencia-e-gaps` e no perfil do `especialista-pipeline`.
