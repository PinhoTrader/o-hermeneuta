---
name: padrao-teste
description: Use esta skill sempre que escrever ou revisar um teste Vitest, configurar CI/CD, ou avaliar o que já está coberto no Hermeneuta antes de propor um pipeline de deploy. Documenta o que existe hoje (incluindo firestore.rules.test.ts contra o Firestore Emulator, resolvido em 2026-08-17) e as lacunas ainda abertas.
---

# Padrão de teste e pipeline — O Hermeneuta

Fonte: `src/test/*`, `package.json`, `doc/qa/TEST_GAPS.md`, `security_spec.md`
(2026-08-16, revisado 2026-08-17).

## O que existe

`npm run test` = `vitest run`. Vitest + Testing Library + `jsdom`, mocks
manuais do Firebase SDK (`vi.mock('firebase/auth')`,
`vi.mock('firebase/firestore')`). 12 arquivos em `src/test/` (o 12º,
`firestore.rules.test.ts`, roda separado — ver seção própria abaixo):

```
AuthContext.test.tsx     — fluxo de login/perfil/promoção de admin
AuthRoutes.test.tsx      — ProtectedRoute/AdminRoute
AdminPanel.test.tsx      — painel admin
LandingLogin.test.tsx    — login na landing
FinalReview.test.tsx     — tela de revisão final
Button.test.tsx          — componente UI
BibleSelection.test.ts   — validateBibleSelection (função pura)
usePermissions.test.tsx  — matriz de permissões por papel
aiUsageService.test.ts   — contagem local de uso (convidado)
geminiFormatter.test.ts  — formatMentorText (parsing da resposta da IA)
geminiSecurity.test.ts   — verifyFirebaseIdToken/getIdentity/reserveUserQuota
                            (mock de fetch e de jose, ver padrao-prompt-ia)
basic.test.ts            — sanity check
```

Cobertura é unitária/componente isolado com mocks — não integração real
(exceto `firestore.rules.test.ts`, que roda contra o emulador de verdade).

## `firestore.rules.test.ts` — resolvido em 2026-08-17

Existe agora em `src/test/firestore.rules.test.ts`, 18 testes rodando contra
o **Firestore Emulator de verdade** (não mock) via `@firebase/rules-unit-testing`.
Cobre `users`, `studies`, `aiUsage` (a quota do Instrutor de IA da Fase 1) e
`groups` — isolamento por dono, imutabilidade de `createdAt`/`role`, limite
de tamanho de campo, e o contador `queryCount` só podendo crescer.

**Como rodar**: `npm run test:rules` (não `npm run test` — ver por quê
abaixo). Precisa de **Java (JDK 17+)** instalado — o emulador do Firestore é
um binário Java, sem alternativa. Nesta máquina foi instalado Temurin 21 via
`winget install --id EclipseAdoptium.Temurin.21.JDK`. O script já cuida de
subir e derrubar o emulador (`firebase emulators:exec --only firestore
--project demo-o-hermeneuta "..."`) — não precisa deixar nada rodando manualmente.

**Por que é um `vitest.rules.config.ts` separado, não parte de `npm run
test`**: essas provas dependem do emulador estar de pé; se fossem incluídas
na suíte padrão, `npm test` quebraria em qualquer máquina/CI sem Java e sem
o emulador rodando. `vite.config.ts` exclui explicitamente esse arquivo do
`npm run test` normal (ver `test.exclude`).

**Limitação de design da própria lib**: `@firebase/rules-unit-testing` não
permite escolher um `databaseId` — os testes sempre rodam contra a base
"(default)" do emulador, nunca contra o nome real de produção
(`ai-studio-...`). Isso não compromete a validade dos testes: o CONTEÚDO de
`firestore.rules` é o mesmo independente de qual base o hospeda, as regras
não referenciam o nome do banco.

**Achado real durante a escrita destes testes**: `isSuperAdminEmail()`
(`firestore.rules`) usa `request.auth.token.email` (acesso direto de
propriedade). Um token de auth sem a claim `email` faz a regra inteira
lançar um erro de avaliação (em vez de simplesmente retornar `false`) nos
poucos lugares que chamam `isApproved()`/`isAdmin()` antes de qualquer outra
condição (ex: `groups` create/update). Na prática isso nunca quebra em
produção porque o único provedor de login (Google) sempre retorna e-mail —
mas é frágil a qualquer provedor futuro que não garanta essa claim. Não foi
corrigido (mudança em `firestore.rules` sempre confirmada com o usuário
antes, ver `AGENTS.md`) — só documentado aqui e sinalizado ao usuário.

## O que ainda NÃO existe (não presumir que existe)

1. **Testes de integração real com Firestore para services/páginas** — os
   testes de regra (acima) cobrem `firestore.rules` isoladamente, mas
   `src/services/*.ts` e as páginas React ainda são testados só com mocks
   do SDK (ver seção "O que existe"), não contra o emulador. Recomendado em
   `doc/qa/TEST_GAPS.md` via emuladores, não implementado.
2. **Testes de chamada real ao Gemini** — mockado por design (custo/latência),
   `geminiFormatter.test.ts` testa só o parsing, não a chamada em si.
3. **E2E** (Playwright/Cypress) — não existe.
4. **`npm run lint` só roda `tsc --noEmit`** — `eslint.config.js` só aplica
   `@firebase/eslint-plugin-security-rules` a `firestore.rules`; nenhum
   `.ts`/`.tsx` do app passa por ESLint. Não reportar "lint limpo" como se
   cobrisse qualidade de código React/TS — só cobre erro de tipo.
5. **Nenhum coverage configurado** — sem `@vitest/coverage-*`, sem script
   `test:coverage`. Não inventar número de cobertura.
6. **CI/CD**: não há `.github/workflows/` nem qualquer pipeline configurado
   além do deploy automático da Vercel por push (padrão da integração
   Git↔Vercel, não um pipeline de testes). Um pipeline real precisaria
   instalar Java pra rodar `test:rules` — anotar isso no workflow se/quando
   o CI for criado.

## Ao propor pipeline novo

Mesmo princípio do Cactos-Hub: deixar explícito o que é fato observado do
projeto (a lista de testes acima) e o que é decisão de engenharia sua (ex:
rodar Vitest a cada PR vs só local) — perguntar ao usuário antes de assumir
gate de deploy obrigatório, já que hoje não existe nenhum.

## `firebase-admin` foi removido — 2026-08-19

Estava instalado mas sem nenhuma referência em `src/`/`api/` (confirmado via
grep). A verificação de JWT (Fase 1, 2026-08-17) acabou não usando
`firebase-admin` — foi resolvida com `jose` + JWKS público do Google, sem
precisar de service account (ver `padrao-prompt-ia`). Removido de
`dependencies` em `package.json` nesta data (ver `precedencia-e-gaps` gap 2),
com `npm install` regenerando `package-lock.json` e `npm run lint`/`npm run
test` confirmados limpos depois. Se surgir necessidade real de Firestore
Admin (bypass de regra a partir do servidor) no futuro, reinstalar então —
não presumir que já está disponível.
