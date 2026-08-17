# CLAUDE.md — O Hermeneuta

Contexto de produto para qualquer agente de IA trabalhando neste repositório.
Este documento é fato observado no código em 2026-08-16 (raio-X inicial), não
um plano — se o código divergir no futuro, o código vence e este arquivo deve
ser atualizado.

## O que é

Ferramenta de hermenêutica bíblica que guia o usuário pelo método **Cavar &
Descobrir** em 8 etapas (Seleção, Observação, Perguntas, Gênero & Estilo,
Contexto, Ideia Principal, Intento Transformador, Esboço & Sermão), com um
"Instrutor de IA" (Gemini) atuando como mentor socrático em cada etapa.

Produto de um só desenvolvedor (`P1n40` / conta GitHub `PinhoTrader`), em
produção na Vercel (`o-hermeneuta.vercel.app`, time `escoladetraders-projects`).

## Stack real (não presumir outra)

- **Frontend**: React 19 + TypeScript + Vite 6, React Router 7, Tailwind CSS 4
  (`@tailwindcss/vite`, sintaxe `@theme`/`@import "tailwindcss"` — não é
  Tailwind 3), `motion` (framer-motion), `lucide-react`, `react-markdown`.
- **Dados**: Firebase client SDK — Firestore + Auth. **Não há Supabase** apesar
  do README sugerir isso como evolução futura — não é real hoje.
- **IA**: Google Gemini (`gemini-3-flash-preview`) via `@google/genai`, só no
  servidor (`api/gemini.ts`), nunca no bundle do cliente.
- **Deploy**: Vercel, uma única função serverless (`api/gemini.ts`, handler
  Node puro com `IncomingMessage`/`ServerResponse` — não usa Express, mesmo
  `express` estando em `package.json`).
- **Testes**: Vitest + Testing Library + jsdom, mocks manuais do Firebase SDK.

## Estrutura

```
src/
├── pages/       — uma página por rota (ver App.tsx)
├── components/  — Layout, AuthRoutes, ChatOverlay, ui/Button
├── context/     — AuthContext, StudyContext
├── services/    — uma camada por domínio (studyService, adminService,
│                  groupService, academyService, aiUsageService,
│                  bibleService, geminiService)
├── hooks/       — usePermissions
├── lib/firebase.ts — init do SDK
└── types.ts     — todas as interfaces de domínio

api/gemini.ts    — única rota serverless (Instrutor de IA)
firestore.rules  — regras zero-trust
```

## Modelo de permissão (usePermissions.ts)

4 papéis normalizados: `guest` (convidado local, localStorage, nunca toca
Firestore) → `student` → `contributor` (agrega `professor`/`monitor` do
Firestore) → `admin`. `aiQueryLimit`: 3 (convidado local) / 5 (guest role no
Firestore) / 30 por dia no servidor (`api/gemini.ts`) para usuário autenticado,
`Infinity` no client-side para student/contributor/admin (a quota real que
importa é a do servidor).

Super-admin: `escoladetradersead@gmail.com`, centralizado em
`src/config/superAdmin.ts` no lado do cliente (2026-08-17); `firestore.rules`
mantém sua própria cópia por ser linguagem própria. Qualquer mudança nesse
e-mail exige tocar os dois.

## Princípios não-negociáveis

1. **`GEMINI_API_KEY` nunca no bundle do cliente** — só `process.env` dentro
   de `api/gemini.ts`.
2. **RLS/Firestore rules é a fonte da verdade de acesso a dado**, não a lógica
   de UI. `usePermissions` decide o que a interface mostra, não o que o
   Firestore permite.
3. **O Instrutor de IA nunca usa fonte externa** — só o texto bíblico
   fornecido, a resposta do usuário e o contexto do estudo atual. Ver skill
   `padrao-prompt-ia` antes de tocar em `api/gemini.ts`.
4. **Responder sempre em JSON estrito** é contrato do Instrutor de IA — mudar
   o schema de resposta (`desvioDetectado`, `gravidade`, etc.) quebra
   `formatMentorText` e o parsing no frontend.
5. **Tailwind é v4** — sintaxe de v3 (`tailwind.config.js` com `theme.extend`)
   não é o padrão deste projeto; tokens vivem em `src/index.css` via `@theme`.

## Ordem de consulta antes de mudança estrutural

```
CLAUDE.md → AGENTS.md → skill relevante em .claude/skills/
```

Se um agente especialista encontrar uma decisão de produto/design não coberta
por nenhum desses três, ele para e pergunta — não inventa (ver
`arquiteto-de-produto` e skill `precedencia-e-gaps`).
