---
name: padrao-design
description: Use esta skill sempre que criar ou alterar qualquer elemento visual do Hermeneuta — cor, tipografia, espaçamento, componente de UI, animação, estado de loading/erro. Documenta o design system real extraído do código em 2026-08-16 (não um sistema novo). Consulte antes de escolher uma cor, fonte ou padrão de card/botão que não esteja aqui.
---

# Padrão de design — O Hermeneuta

Fonte: auditoria direta de `src/index.css`, `src/components/ui/Button.tsx`,
`src/components/Layout.tsx`, `src/App.tsx` e páginas em `src/pages/` (2026-08-16).
Isto é o que o código faz hoje, não uma proposta — trate como baseline real.

## Identidade

Tema **claro** (não dark theme), tom devocional/editorial: serifada nos
títulos, sans-serif no corpo, paleta terrosa/oliva sobre off-white.

## Tokens (`src/index.css`, bloco `@theme`)

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;      /* corpo */
--font-serif: "Playfair Display", ui-serif, Georgia, serif;      /* h1-h6 */

--color-brand-primary: #5A5A40;   /* oliva — cor de marca, CTAs, links ativos */
--color-brand-secondary: #f5f5f0; /* off-white quente — fundo geral */
--color-brand-paper: #FFFFFF;     /* cards, superfícies elevadas */
```

`h1`–`h6` são `font-serif` globalmente (regra em `@layer base`) — nunca
sobrescrever isso componente a componente.

Neutros usam a escala `slate` padrão do Tailwind (`slate-900` texto principal,
`slate-500`/`slate-400` texto secundário, `slate-200`/`slate-100` bordas)
— não introduzir uma escala de cinza paralela.

## Cores de estado/papel (uso disperso, não centralizado)

Hoje cada página define isso inline (`bg-red-100 text-red-600`, etc.) — não
existe um mapa central. Ao adicionar um badge de papel/status novo, siga o
padrão já em uso em `Layout.tsx`:

| Papel/estado | Classe |
|---|---|
| Professor | `bg-blue-100 text-blue-600` |
| Admin | `bg-red-100 text-red-600` |
| Erro/perigo | `bg-red-50 text-red-500` ou `variant="danger"` do Button |

Se precisar de uma cor de estado nova (ex: "aprovado", "pendente"), escolha a
família semântica mais próxima do Tailwind (`green-*` sucesso, `amber-*`
atenção, `red-*` erro) — não inventar hex novo sem necessidade.

## Botão (`src/components/ui/Button.tsx`)

Componente único, 5 variantes × 3 tamanhos, via `clsx`+`tailwind-merge`. Ao
precisar de um novo estilo de botão, adicionar variante aqui — nunca duplicar
a lógica de botão em outro arquivo.

```
variant: primary | secondary | outline | ghost | danger
size: sm | md | lg
loading?: boolean  → mostra "◌" girando, desabilita o botão
```

`primary` = fundo `brand-primary` sólido. `secondary` = borda `brand-primary`,
fundo branco. Reservar `danger` só para ações destrutivas reais (excluir,
remover).

## Cards e superfícies

Dois padrões coexistem, escolher pelo contexto:

- **`.glass-card`** (`src/index.css`) — `bg-white/80 backdrop-blur-sm
  border border-white/20 shadow-sm` — usado em headers/overlays sobre fundo
  com textura.
- **Card sólido inline** (ex: `App.tsx` `NewStudyRoute`) —
  `bg-white rounded-3xl p-8 shadow-xl border border-slate-100` — usado em
  formulários/modais centrais. `rounded-3xl` (24px) é o raio de card "grande"
  já estabelecido; `rounded-2xl`/`rounded-xl` para elementos menores dentro
  do card (ícone, input).

Não criar um terceiro padrão de card sem necessidade — escolher entre os dois
acima conforme o card estiver sobre fundo texturizado (glass) ou fundo sólido
(card sólido).

## Inputs de formulário

Padrão observado em `App.tsx` (`NewStudyRoute`):

```
bg-slate-50 border border-slate-100 rounded-xl px-4 py-3
outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all
```

Label acima do input: `text-xs font-bold uppercase tracking-widest text-slate-400`.
Erro abaixo do form: `text-xs text-red-500 bg-red-50 p-2 rounded-lg`.

## Layout / Topbar (`Layout.tsx`)

- Header fixo `h-16`, `bg-white/50 backdrop-blur-md sticky top-0 z-40`.
- Conteúdo em `max-w-7xl mx-auto px-4` — respeitar essa largura máxima em
  qualquer página nova, não introduzir outra.
- Desktop: nav horizontal (`hidden md:flex`). Mobile: menu dropdown animado
  via `framer-motion` (`AnimatePresence`), não CSS puro.
- FAB (botão flutuante) para chat/comunidade: `fixed bottom-6 right-6 z-50`,
  classe utilitária `.fab-community` já pronta em `index.css`.

## ✅ Resolvido em 2026-08-17 — animações via framer-motion

O gap de `animate-in`/`fade-in`/`slide-in-from-*`/`zoom-in-95` (9 arquivos,
17 ocorrências, classes sem efeito por falta do plugin `tailwindcss-animate`)
foi resolvido substituindo essas classes por `motion.div` (`framer-motion`,
pacote `motion`), não pela instalação do plugin.

**Motivo da escolha:** `motion` já é dependência do projeto e já é o padrão
real em `Layout.tsx` (menu mobile), `ChatOverlay.tsx` (drawer + backdrop) e
mesmo dentro de `StudyStep.tsx` (painel do Instrutor de IA já usava
`AnimatePresence mode="wait"`) — a própria `div` wrapper do `StudyStep`
usava a classe no-op, ou seja, o arquivo já tinha dois sistemas de animação
coexistindo, um real e um fake. Adotar `tailwindcss-animate` criaria um
terceiro sistema em paralelo, e tem risco de compatibilidade com a API de
plugin do Tailwind v3 rodando sobre Tailwind v4 (`@theme`, sem
`tailwind.config.js`). `motion` não tem esse risco, custo de bundle zero (já
carregado), e centraliza tudo num único mental model.

**Padrão a seguir daqui pra frente — não usar mais classes `animate-in`/
`fade-in`/`slide-in-from-*`/`zoom-in-*` (não existem no projeto, viram no-op
silencioso).** Usar as variantes de `motion.div` em `src/lib/motionVariants.ts`,
todas com `transition={{ duration: <X>, ease: 'easeOut' }}`:

```
fade            → initial={{ opacity: 0 }}             animate={{ opacity: 1 }}
fadeSlideRight  → initial={{ opacity: 0, x: 16 }}       animate={{ opacity: 1, x: 0 }}
fadeSlideBottom → initial={{ opacity: 0, y: 16 }}       animate={{ opacity: 1, y: 0 }}
fadeSlideTop    → initial={{ opacity: 0, y: -8 }}       animate={{ opacity: 1, y: 0 }}
fadeZoom        → initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
```

Duração por contexto: wrapper de página `0.5`–`0.7`s (`fade`); troca de
etapa/conteúdo principal `0.5`s (`fadeSlideRight`/`fadeSlideBottom`); modal
central `0.2`–`0.3`s (`fadeZoom`); dropdown/menu pequeno `0.2`s (`fadeZoom`,
com `style={{ transformOrigin: <canto de ancoragem> }}`); alerta inline
pequeno `0.15`s (`fadeSlideTop`).

Essas animações são só de entrada (mount) — nenhum elemento hoje tem
`AnimatePresence`/`exit` (mesmo comportamento de antes, quando `animate-in`
também só definia entrada). Adicionar animação de saída em modal/dropdown é
melhoria separada, não presumir que já existe.

## Responsividade

Não há uma decisão "desktop-first" ou "mobile-first" explícita no código —
os breakpoints (`md:`, `sm:`) aparecem tratando mobile como caso especial
(`hidden md:flex`, menu dropdown só em mobile), o que sugere desktop como
caso principal, mas isso nunca foi confirmado como decisão de produto. Se uma
tela nova tiver ambiguidade de prioridade mobile vs desktop, perguntar antes
de assumir — ver skill `precedencia-e-gaps`.

## Ícones e microinteração

`lucide-react` para todo ícone (tamanho `size={16|18|20|24|28|32}` conforme
contexto, sem escala própria). Estados ativos usam `active:scale-95` +
`transition-all` (ver Button e `.fab-community`) — manter essa microinteração
de "clique" em qualquer elemento clicável novo tratado como botão.
