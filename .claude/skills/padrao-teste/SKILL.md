---
name: padrao-teste
description: Use esta skill sempre que escrever ou revisar um teste Vitest, configurar CI/CD, ou avaliar o que já está coberto no Hermeneuta antes de propor um pipeline de deploy. Documenta o que existe hoje e as lacunas conhecidas, incluindo firestore.rules.test.ts, que nunca foi criado apesar de mencionado em security_spec.md.
---

# Padrão de teste e pipeline — O Hermeneuta

Fonte: `src/test/*`, `package.json`, `doc/qa/TEST_GAPS.md`, `security_spec.md`
(2026-08-16).

## O que existe

`npm run test` = `vitest run`. Vitest + Testing Library + `jsdom`, mocks
manuais do Firebase SDK (`vi.mock('firebase/auth')`,
`vi.mock('firebase/firestore')`). 11 arquivos em `src/test/`:

```
AuthContext.test.tsx    — fluxo de login/perfil/promoção de admin
AuthRoutes.test.tsx     — ProtectedRoute/AdminRoute
AdminPanel.test.tsx     — painel admin
LandingLogin.test.tsx   — login na landing
FinalReview.test.tsx    — tela de revisão final
Button.test.tsx         — componente UI
BibleSelection.test.ts  — validateBibleSelection (função pura)
usePermissions.test.tsx — matriz de permissões por papel
aiUsageService.test.ts  — contagem local de uso (convidado)
geminiFormatter.test.ts — formatMentorText (parsing da resposta da IA)
basic.test.ts           — sanity check
```

Cobertura é unitária/componente isolado com mocks — não integração real.

## O que NÃO existe (não presumir que existe)

1. **`firestore.rules.test.ts`** — mencionado em `security_spec.md` seção 3
   ("vou implementar se necessário") mas nunca criado. Testar regras exige
   `@firebase/rules-unit-testing` + Firestore Emulator — nenhum dos dois está
   configurado no projeto hoje.
2. **Testes de integração real com Firestore** — recomendado em
   `doc/qa/TEST_GAPS.md` via emuladores, não implementado.
3. **Testes de chamada real ao Gemini** — mockado por design (custo/latência),
   `geminiFormatter.test.ts` testa só o parsing, não a chamada em si.
4. **E2E** (Playwright/Cypress) — não existe.
5. **`npm run lint` só roda `tsc --noEmit`** — `eslint.config.js` só aplica
   `@firebase/eslint-plugin-security-rules` a `firestore.rules`; nenhum
   `.ts`/`.tsx` do app passa por ESLint. Não reportar "lint limpo" como se
   cobrisse qualidade de código React/TS — só cobre erro de tipo.
6. **Nenhum coverage configurado** — sem `@vitest/coverage-*`, sem script
   `test:coverage`. Não inventar número de cobertura.
7. **CI/CD**: não há `.github/workflows/` nem qualquer pipeline configurado
   além do deploy automático da Vercel por push (padrão da integração
   Git↔Vercel, não um pipeline de testes).

## Ao propor pipeline novo

Mesmo princípio do Cactos-Hub: deixar explícito o que é fato observado do
projeto (a lista de testes acima) e o que é decisão de engenharia sua (ex:
rodar Vitest a cada PR vs só local) — perguntar ao usuário antes de assumir
gate de deploy obrigatório, já que hoje não existe nenhum.

## `firebase-admin` está instalado mas não é usado

Confirmado via grep em `src/` e `api/` — zero referências. Se um teste ou
pipeline futuro precisar verificar JWT de verdade (ver gap de segurança em
`padrao-firestore-rules`), este é o pacote já disponível para isso — não
instalar um segundo SDK admin do Firebase.
