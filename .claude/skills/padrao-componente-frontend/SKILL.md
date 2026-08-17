---
name: padrao-componente-frontend
description: Use esta skill sempre que criar ou alterar uma página em src/pages/, componente em src/components/, hook, ou os contexts (AuthContext/StudyContext) do Hermeneuta. Cobre estrutura de pastas, roteamento, o padrão de autosave, e como os services são chamados. Consulte antes de criar qualquer arquivo .tsx novo em src/.
---

# Padrão de componente frontend — O Hermeneuta

Fonte: `src/App.tsx`, `src/context/*`, `src/pages/StudyStep.tsx`,
`src/hooks/usePermissions.ts` (2026-08-16).

## Estrutura de pastas

```
src/pages/       — uma página por rota, quase todas React.lazy em App.tsx
src/components/  — Layout, AuthRoutes (ProtectedRoute/AdminRoute), ChatOverlay
src/components/ui/ — componentes de UI genéricos reutilizáveis (hoje só Button)
src/context/     — AuthContext (sessão/perfil), StudyContext (estudo em edição)
src/hooks/       — usePermissions (matriz de permissão por papel)
src/services/    — uma chamada de Firestore/API por arquivo, um arquivo por domínio
src/lib/firebase.ts — único ponto de init do SDK Firebase
```

## Roteamento (`src/App.tsx`)

Todas as páginas exceto `NewStudyRoute` (definida inline em `App.tsx`) são
`React.lazy`. Ao adicionar uma rota nova:
1. Criar a página em `src/pages/`.
2. Importar com `React.lazy(() => import('./pages/NovaPage'))`.
3. Envolver em `<ProtectedRoute>` (usuário logado + aprovado) ou
   `<AdminRoute>` (só `role === 'admin'`) conforme o caso — ver
   `src/components/AuthRoutes.tsx`. Rota pública fica sem wrapper (só a
   `/` hoje).
4. Fallback de rota desconhecida é sempre `<Navigate to="/" />` — manter.

`PageFallback` (spinner simples `bg-brand-secondary text-brand-primary`) é o
loading padrão do `Suspense` — reusar, não criar um novo fallback por página.

## StudyContext e o padrão de autosave

`StudyContext` guarda o `currentStudy` em memória. Toda alteração de campo
passa por `updateCurrentStudy({ [field]: valor })`.

Para usuários **convidados** (`user.isGuest`) ou estudos com id `local_*`,
`updateCurrentStudy` persiste só em `localStorage`
(`guest_study_{id}`) — nunca chama o Firestore. Qualquer novo campo do
`Study` deve funcionar nos dois caminhos (Firestore real e localStorage local)
sem branch adicional no componente — a diferenciação já acontece dentro do
context, não deve vazar para a página.

Padrão de autosave usado em `StudyStep.tsx` (referência para qualquer campo
editável novo):
```
1. estado local (content) + estado do "último salvo" (lastSavedContent)
2. useEffect com debounce de 3000ms comparando content !== lastSavedContent
3. handleSave manual chamando o mesmo updateCurrentStudy, para o botão "Salvar"
```
Não introduzir um segundo mecanismo de autosave (ex: salvar a cada
`onChange`) — o debounce de 3s é o padrão em todo o fluxo de estudo.

## Services (`src/services/*.ts`)

Um arquivo por domínio (`studyService`, `adminService`, `groupService`,
`academyService`, `aiUsageService`, `bibleService`, `geminiService`). Páginas
e context chamam services diretamente — não existe camada de "repository"
adicional.

**Duplicação resolvida em 2026-08-17**: `handleFirestoreError`/
`OperationType` viviam reimplementados de forma quase idêntica em
`adminService.ts`, `groupService.ts` e `academyService.ts` além de
`src/lib/firebase.ts`. Os três services agora importam de
`src/lib/firebase.ts` em vez de redeclarar. Ao criar um service novo,
**sempre importar de `src/lib/firebase.ts`** — nunca copiar a implementação
de novo.

## `bibleService.ts` — busca de texto bíblico

Não há bíblia própria no Firestore. Cascata de fallback: 4-5 APIs públicas
externas (GitHub raw, `prayerpulse.io` via proxy `r.jina.ai`,
`abibliadigital.com.br`, `bible-api.com`) tentadas em sequência, mais
`src/assets/biblia_arc.json` local para a tradução ARC, com cache em
`localStorage`. Ao adicionar uma tradução nova, seguir esse mesmo padrão de
fallback — não assumir que uma única API é suficiente (todas já mostraram
instabilidade real o bastante para justificar a cascata atual).

## Permissões (`usePermissions.ts`)

Ler a matriz de permissão a partir do hook, nunca reimplementar a lógica de
papel (`guest`/`student`/`contributor`/`admin`) inline num componente. Se uma
feature nova precisa de uma checagem de permissão que não existe em
`Permissions`, adicionar o campo ali — não checar `profile?.role` direto na
página.

## Formato de página nova

Página completa, sem `// TODO` solto. Se depender de um service/rota que
ainda não existe, avisar explicitamente em vez de mockar dado como se fosse
definitivo (mesmo princípio do Cactos-Hub). Consultar a skill `padrao-design`
antes de estilizar — não inventar cor/token fora do que já está documentado
lá.
