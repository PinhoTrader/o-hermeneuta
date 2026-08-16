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

## ⚠️ Gap real encontrado — animações "no-op"

`animate-in`, `fade-in`, `slide-in-from-right-4`, `zoom-in-95` aparecem em
9 arquivos (`App.tsx`, `StudyStep.tsx`, `StudyController.tsx`, `Dashboard.tsx`,
`FinalReview.tsx`, `AdminPanel.tsx`, `BibleSelection.tsx`, `AcademyPage.tsx`,
`GroupsPage.tsx`) mas **não existe plugin `tailwindcss-animate` nem qualquer
definição dessas classes** no projeto (Tailwind v4 não as inclui por padrão).
Essas classes não geram CSS nenhum — a intenção de "entrada suave" nessas
telas está sendo desenhada, mas não está acontecendo visualmente hoje.

Ao tocar em qualquer uma dessas telas, **não presumir que a animação já
funciona**. Duas saídas possíveis, decisão de produto — não decidir sozinho,
perguntar ao usuário/`arquiteto-de-produto`:
1. Instalar `tailwindcss-animate` e registrar o plugin (aproxima do
   comportamento hoje só "desenhado" em classe).
2. Trocar por animação real via `framer-motion` (`motion.div` +
   `initial`/`animate`/`exit`), já usado em `Layout.tsx` para o menu mobile —
   mais consistente com o resto do código, que já depende de `motion`.

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
