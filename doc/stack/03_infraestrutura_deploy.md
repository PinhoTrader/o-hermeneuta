# Infraestrutura e Deploy - O Hermeneuta

> Reescrito em 2026-08-17: a versão anterior deste documento descrevia Cloud
> Run + Google AI Studio Build, que nunca foi a stack real de produção deste
> projeto. O texto abaixo reflete o que está de fato configurado (Vercel +
> Firebase), verificado diretamente no projeto Vercel e no repositório.

## 1. Ambiente de Execução

O frontend (React 19 + Vite) e a única rota serverless (`api/gemini.ts`, o
Instrutor de IA) rodam na **Vercel**, projeto `o-hermeneuta` no time
`escoladetraders-projects`. O backend de dados é **Firebase** (Firestore +
Auth) — não há Cloud Run, Cloud Functions nem nenhum serviço do Google Cloud
além do próprio Firebase e a API do Gemini.

## 2. Componentes de Infraestrutura

- **Hospedagem (frontend + função serverless):** Vercel. `vercel.json`
  define os rewrites (`/api/(.*)` para a função, `/(.*)` para `index.html`
  como fallback de SPA).
- **Persistência (NoSQL):** Firebase Firestore, projeto
  `gen-lang-client-0860065051`, banco **não-default**
  (`firestoreDatabaseId: ai-studio-9096b2f1-8519-43e9-a451-732bdd171b00` em
  `firebase-applet-config.json`). Regras em `firestore.rules` (ver skill
  `padrao-firestore-rules`).
- **Autenticação:** Firebase Auth, só provedor Google (popup) + modo
  convidado 100% client-side (sem Firebase Auth nenhum).
- **Provedor de IA:** Google Gemini (`gemini-3-flash-preview`) via
  `@google/genai`, chamado só do lado do servidor em `api/gemini.ts`.

## 3. Fluxo de Publicação

1. **Repositório:** `github.com/PinhoTrader/o-hermeneuta`, branch `main`.
2. **Deploy automático:** todo push em `main` dispara build e deploy na
   Vercel via integração Git↔Vercel nativa — não há pipeline de CI
   (GitHub Actions ou similar) fazendo isso, é a própria Vercel observando o
   repositório.
3. **Build:** a Vercel roda `npm run build` (`vite build`), gera `dist/`, e
   empacota `api/gemini.ts` como função serverless Node separadamente.
4. **Variáveis de ambiente:** configuradas em Project Settings > Environment
   Variables no painel da Vercel — hoje são `GEMINI_API_KEY` (Production +
   Preview) e `APP_URL` (Production + Preview). Não usar `.env` versionado
   para segredos reais; `.env.example` documenta as chaves esperadas.
5. **URL de produção:** `o-hermeneuta.vercel.app`.

## 4. Guia de Rollback

- **Frontend/função serverless:** a Vercel mantém histórico de deployments;
  reverter é promover um deployment anterior direto no painel ("Instant
  Rollback") ou reverter o commit no Git e deixar o push disparar um novo
  deploy — as duas formas funcionam, a primeira é mais rápida em incidente.
- **`firestore.rules`:** não sobe junto com o deploy da Vercel — precisa ser
  publicada separadamente (Firebase Console ou `firebase deploy --only
  firestore:rules`, usando o `firebase.json` deste repositório). Reverter é
  restaurar a versão anterior do arquivo e publicar de novo.
- **Dados do Firestore:** sem rotina de backup automatizado configurada
  neste projeto até este documento ser escrito — se for necessário, avaliar
  exports agendados do Firestore (Cloud Console) como próximo passo, não
  presumir que já existe.

## 5. Custos

Não verificado neste documento qual plano de fato está ativo (Firebase
Spark/Blaze, Vercel Hobby/Pro) — confirmar diretamente no Firebase Console e
no painel de billing da Vercel antes de tomar qualquer decisão baseada em
custo. O texto anterior deste documento afirmava Spark Plan/free tier sem
essa verificação; não repetir essa afirmação sem checar.
