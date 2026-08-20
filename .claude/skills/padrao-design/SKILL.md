---
name: padrao-design
description: Use esta skill sempre que criar ou alterar qualquer elemento visual do Hermeneuta — cor, tipografia, espaçamento, componente de UI, animação, estado de loading/erro. Documenta o design system real extraído do código em 2026-08-16 (não um sistema novo). Consulte antes de escolher uma cor, fonte ou padrão de card/botão que não esteja aqui.
---

# Padrão de design — O Hermeneuta

Fonte: auditoria direta de `src/index.css`, `src/components/ui/Button.tsx`,
`src/components/Layout.tsx`, `src/App.tsx` e páginas em `src/pages/` (2026-08-16,
rebrand de tokens aplicado em 2026-08-19 a partir do handoff de design em
`design_handoff_hermeneuta_app/`).
Isto é o que o código faz hoje, não uma proposta — trate como baseline real.

## Identidade

Tema **claro** (não dark theme, exceto o topbar — ver seção Layout/Topbar),
tom devocional/editorial: fonte única (Plus Jakarta Sans) em títulos e corpo,
paleta verde evergreen sobre um off-white esverdeado (mint).

## Tokens (`src/index.css`, bloco `@theme`)

```css
--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;  /* corpo */
--font-serif: "Plus Jakarta Sans", ui-serif, Georgia, serif;             /* h1-h6 */

--color-brand-primary: #3F6B4F;   /* evergreen — cor de marca, CTAs, links ativos */
--color-brand-secondary: #eef4f0; /* mint off-white — fundo geral */
--color-brand-paper: #FFFFFF;     /* cards, superfícies elevadas */

--radius-lg: 1.125rem;
--radius-xl: 1.75rem;
--radius-2xl: 2.25rem;
--radius-3xl: 3rem;

--shadow-sm: 0 2px 6px rgba(15,23,42,0.07);
--shadow-md: 0 8px 20px rgba(15,23,42,0.10);
--shadow-lg: 0 24px 48px rgba(15,23,42,0.14);
--shadow-xl: 0 32px 72px rgba(15,23,42,0.20);
```

`h1`–`h6` são `font-serif` globalmente (regra em `@layer base`) — nunca
sobrescrever isso componente a componente. Como `--font-serif` e
`--font-sans` apontam para a mesma família (Plus Jakarta Sans), a distinção
visual entre título e corpo hoje vem só de peso/tamanho, não de família —
não presumir que existe uma serifada real no projeto.

A escala de `rounded-*`/`shadow-*` acima é um override do namespace padrão
do Tailwind v4 (mesmas chaves `--radius-*`/`--shadow-*` de `theme.css`
interno do pacote) — raios e sombras ficaram mais profundos/arredondados
que o default do framework. Não redefinir essas chaves de novo em outro
arquivo; se precisar de um raio/sombra fora dessa escala, usar um valor
arbitrário Tailwind (`rounded-[Npx]`) e justificar por que a escala não
serve.

Neutros usam a escala `slate` padrão do Tailwind (`slate-900` texto principal,
`slate-500`/`slate-400` texto secundário, `slate-200`/`slate-100` bordas)
— não introduzir uma escala de cinza paralela.

## Cores de estado/papel (`src/components/ui/Badge.tsx`)

Centralizado num componente `Badge` — não são mais classes inline repetidas
por página. Uso: `<Badge tone="professor">Professor</Badge>`.

```
tone: professor | admin | success | warning | danger | neutral
```

| tone | Classe |
|---|---|
| `professor` | `bg-blue-100 text-blue-600` |
| `admin` | `bg-red-100 text-red-600` |
| `success` | `bg-green-100 text-green-600` |
| `warning` | `bg-amber-100 text-amber-700` |
| `danger` | `bg-red-100 text-red-600` |
| `neutral` | `bg-slate-100 text-slate-600` |

Base comum a todos os tones: `inline-flex items-center gap-1 text-[9px]
px-2 py-0.5 font-bold rounded-full uppercase tracking-wide`. Ao precisar de
uma cor de estado nova (ex: "aprovado", "pendente"), adicionar um `tone` novo
neste componente — não voltar a escrever a classe inline na página, e
escolher a família semântica mais próxima do Tailwind (`green-*` sucesso,
`amber-*` atenção, `red-*` erro) em vez de inventar hex novo.

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

## Cards e superfícies (`src/components/ui/Card.tsx`)

Os dois padrões que antes eram marcação inline repetida agora são um único
componente `Card` compartilhado, com `variant: 'solid' | 'glass'` (default
`solid`) — a lógica de quando usar cada um não mudou, só a forma de aplicar:

- **`variant="glass"`** — aplica a classe `.glass-card` (`src/index.css`,
  `bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm`) — usado em
  headers/overlays sobre fundo com textura.
- **`variant="solid"`** (default) — aplica `bg-white rounded-3xl shadow-xl
  border border-slate-100` — usado em formulários/modais centrais.
  `rounded-3xl` (3rem/48px, valor sobrescrito — ver tokens acima) é o raio de
  card "grande" já estabelecido; `rounded-2xl`/`rounded-xl` para elementos
  menores dentro do card (ícone, input).

`Card` aceita `children`, `style` e demais props de `<div>` (via
`React.HTMLAttributes<HTMLDivElement>`), então className extra passa por
`tailwind-merge` normalmente. Não criar um terceiro padrão de card sem
necessidade — escolher entre `glass`/`solid` conforme o card estiver sobre
fundo texturizado ou fundo sólido, e não voltar a escrever a marcação inline
numa página nova.

## Inputs de formulário (`src/components/ui/Input.tsx`)

Componente compartilhado, exporta `Input` (`<input>`) e `Select` (`<select>`,
recebe `options: (string | { value; label })[]`). Ambos aceitam `label?` e
`error?` além das props nativas do elemento.

```
bg-slate-50 border border-slate-100 rounded-xl px-4 py-3
outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all
```

Label acima do input: `text-xs font-bold uppercase tracking-widest
text-slate-400 px-1`. Erro abaixo do campo: `text-xs text-red-500 bg-red-50
p-2 rounded-lg`. Ao precisar de um campo de formulário novo, usar `Input`/
`Select` em vez de recriar essa marcação — se o campo não couber no
contrato desses dois (ex: textarea, campo de arquivo), seguir as mesmas
classes de `fieldClassName`/label/erro por consistência visual, mas
confirmar antes de estender o componente com um novo caso.

## Modal (`src/components/ui/Modal.tsx`)

Componente compartilhado para o padrão que antes estava repetido em 4
lugares (`fixed inset-0 bg-slate-950/60 backdrop-blur-sm` + card central).
Props: `open`, `onClose`, `title?`, `children`, `footer?`. Renderiza `null`
quando `open` é falso (sem `AnimatePresence`/exit — mesmo gap de animação de
saída documentado na seção de motion abaixo). Overlay usa `fade(0.2)`, o
card interno usa `fadeZoom(0.3)` (`src/lib/motionVariants.ts`), clique no
overlay fecha (`onClose`), clique no card não propaga. `title` opcional
renderiza um cabeçalho com botão de fechar (`X` do `lucide-react`);
`footer` opcional renderiza uma faixa com `flex gap-4` abaixo do conteúdo
(uso típico: botões de ação do modal).

## StepTabs (`src/components/ui/StepTabs.tsx`)

Componente compartilhado que substituiu a barra de abas do fluxo de estudo
que antes era cravada inline em `StudyController.tsx`. Props: `steps:
string[]`, `activeIndex`, `onSelect(index)`. Só visível em telas `md:` pra
cima (`hidden md:flex`) — não é a navegação mobile do fluxo de estudo.

Estado visual por aba: ativa = `bg-brand-primary text-white shadow-md
scale-105`; concluída (`idx < activeIndex`) = `text-brand-primary
bg-brand-primary/10`; futura = `text-slate-400 hover:bg-slate-100`.

**Divergência conhecida com a versão anterior:** essa extração removeu os
ícones por step que existiam antes (cada step do método tinha um ícone
Lucide próprio) — o componente só aceita `steps: string[]`, sem slot de
ícone. É uma simplificação visual deliberada (vinda do design system que
originou o componente), não um bug. Se um ícone por step voltar a ser
necessário, isso exige estender a prop `steps` para aceitar um objeto
`{ label, icon? }` — não presumir que já existe esse suporte.

## Layout / Topbar (`Layout.tsx`)

- Header fixo `h-16`, `bg-slate-900 border-b border-slate-800 sticky top-0
  z-40` — único trecho do app com fundo escuro sólido (sem blur/translúcido;
  todo o resto da UI é tema claro). Textos e ícones dentro do header usam
  `text-white`/`text-white/65`/`text-white/60`/`text-white/70` (nunca
  `text-slate-900`/`text-slate-500`, que ficam ilegíveis sobre esse fundo) —
  as únicas exceções são as badges de papel (Professor/Admin), que já têm
  fundo claro próprio e não precisam de ajuste.
- O menu mobile (`motion.div` que abre abaixo do header) continua
  `bg-white` — é um painel claro por baixo de um header escuro, decisão
  intencional, não um bug de contraste.
- Conteúdo em `max-w-7xl mx-auto px-4` — respeitar essa largura máxima em
  qualquer página nova, não introduzir outra.
- Desktop: nav horizontal (`hidden md:flex`). Mobile: menu dropdown animado
  via `framer-motion` (`AnimatePresence`), não CSS puro.
- FAB (botão flutuante) para chat/comunidade: `fixed bottom-6 right-6 z-50`,
  classe utilitária `.fab-community` já pronta em `index.css`.
- O menu de usuário no header é um avatar circular clicável que abre um
  dropdown (não mais nome/e-mail inline + botão Sair solto). Itens, em
  ordem: "Minha Conta" (`/account`, `src/pages/Account.tsx`),
  "Configurações" (`/settings`, `src/pages/Settings.tsx`), "Editar Perfil"
  (`/edit-profile`, `src/pages/EditProfile.tsx`), divisor, "Sair". As 3
  primeiras rotas existem de fato em `App.tsx` — não presumir mais que é só
  protótipo de handoff sem rota real por trás.

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
