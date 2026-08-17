# Arquitetura - O Hermeneuta

> Escrito em 2026-08-17, com base no estado real do código (não um plano).
> Fonte primária de verdade continua sendo `CLAUDE.md` e as skills em
> `.claude/skills/` — este documento é uma visão geral mais longa para quem
> está chegando ao projeto agora.

## Visão geral

React 19 + TypeScript + Vite no frontend, uma única função serverless na
Vercel para o Instrutor de IA, e Firebase (Firestore + Auth) como backend de
dados. Sem servidor de aplicação próprio — o "backend" é a combinação de
regras do Firestore (autorização) + uma função serverless pontual (IA).

```
┌─────────────────────────────────────────────────────────────┐
│  Navegador                                                    │
│  React 19 + React Router 7 (SPA, client-side routing)          │
│  ├─ Firebase Auth SDK  ──────► Google OAuth popup               │
│  ├─ Firebase Firestore SDK ──► leitura/escrita direta (regras)  │
│  └─ fetch('/api/gemini') ────► função serverless (abaixo)       │
└─────────────────────────────────────────────────────────────┘
                    │                              │
                    ▼                              ▼
        ┌───────────────────────┐      ┌─────────────────────────┐
        │ Firebase (projeto      │      │ Vercel                    │
        │ gen-lang-client-...)   │      │ ├─ dist/ (build estático)  │
        │ ├─ Firestore           │      │ └─ api/gemini.ts (Node)    │
        │ │   (regras: veto      │      │     ├─ verifica JWT (jose) │
        │ │    zero-trust)       │      │     ├─ chama Gemini        │
        │ └─ Auth (só Google)    │      │     └─ grava quota no      │
        │                        │      │        Firestore via REST  │
        └───────────────────────┘      └─────────────────────────┘
                                                     │
                                                     ▼
                                          Google Gemini API
                                          (gemini-3-flash-preview)
```

## Por que não há backend próprio

O projeto deliberadamente não tem um servidor de aplicação (Express, Fastify
etc.) por trás do Firestore — o Firebase client SDK fala direto com o banco,
e a autorização é 100% responsabilidade de `firestore.rules` (zero-trust,
`allow read, write: if false` por padrão — ver skill
`padrao-firestore-rules`). A única exceção é o Instrutor de IA: a
`GEMINI_API_KEY` não pode existir no bundle do cliente, então essa única
funcionalidade precisa de um servidor - daí a única rota serverless do
projeto, `api/gemini.ts`.

## Fluxo de uma requisição típica (ex: salvar uma etapa do estudo)

1. Usuário digita em `StudyStep.tsx`.
2. Debounce de 3s dispara `updateCurrentStudy()` (`StudyContext`).
3. Se for usuário autenticado: grava direto no Firestore
   (`studies/{studyId}`), validado por `firestore.rules` (limite de tamanho
   por campo, `updatedAt` obrigatoriamente igual a `request.time`).
4. Se for convidado local (`user.isGuest`): grava em `localStorage`, nunca
   toca o Firestore.

## Fluxo de uma chamada ao Instrutor de IA

1. Frontend (`geminiService.ts`) chama `fetch('/api/gemini')` com
   `Authorization: Bearer <idToken>` (usuário) ou header
   `X-Hermeneuta-Guest-Id` (convidado).
2. `api/gemini.ts` verifica a assinatura do token via `jose` + JWKS público
   do Google (sem Admin SDK, sem service account - ver skill
   `padrao-prompt-ia`).
3. Reserva quota: usuário autenticado → lê/escreve no Firestore (coleção
   `aiUsage`, via REST API autenticada com o próprio token do usuário);
   convidado → contador em memória (`Map`, não sobrevive a instância fria).
4. Monta o prompt com o `SYSTEM_INSTRUCTION` do mentor + contexto do estudo
   (sanitizado/truncado) e chama `@google/genai`.
5. Resposta do Gemini (JSON estrito) é parseada e formatada em Markdown
   (`formatMentorText`) antes de voltar ao cliente.

## Autenticação e autorização - duas camadas independentes

- **Autenticação**: Firebase Auth (só Google) ou modo convidado
  (100% client-side, sem sessão do Firebase). `AuthContext.tsx` decide qual
  dos dois está ativo.
- **Autorização de dado**: `firestore.rules` é a única fonte da verdade -
  qualquer checagem de permissão feita em componente React
  (`usePermissions.ts`, checagens inline de `profile.role`) é só uma camada
  de UX (esconder botão, mostrar aviso), nunca a proteção real.
- **Papel especial**: super-admin (`escoladetradersead@gmail.com`),
  centralizado em `src/config/superAdmin.ts` no cliente + cópia própria em
  `firestore.rules` (a regra não pode importar TS) - ver
  `padrao-firestore-rules`.

## Deploy

Detalhe completo em `03_infraestrutura_deploy.md`. Resumo rápido: push em
`main` no GitHub → build e deploy automático na Vercel (sem CI próprio) →
`dist/` servido estático + `api/gemini.ts` como função serverless separada.

## Por que Firebase, não Supabase

O README já sugere Supabase como evolução futura possível (se surgir
necessidade de queries relacionais complexas que o Firestore não atende
bem) - mas isso é só uma nota de visão, não uma decisão em andamento. Hoje
100% do projeto usa Firebase; não presumir nenhuma integração Supabase
existente (ver skill `precedencia-e-gaps`, verificado várias vezes ao longo
deste projeto).
