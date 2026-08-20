# Handoff: O Hermeneuta — App UI (recuperado do design system)

## Overview
Click-through prototype of the O Hermeneuta app: Landing → Dashboard (meus estudos) → Seleção Bíblica → Fluxo de Estudo (8 passos + Instrutor de IA) → Salas Virtuais (chat) → Academia (lições/quiz). Built from a design system audit of the real repo (`github.com/PinhoTrader/o-hermeneuta`, branch `main`) plus a deliberate modernization pass (evergreen palette, single sans typeface, deeper shadows/radii).

## About the Design Files
The files in `prototype/` are **design references built in HTML/React (CDN, no build step)** — they show intended look, layout, and interaction, not production code to copy verbatim. The task is to **recreate these screens in the real o-hermeneuta codebase** (React 19 + TypeScript + Vite + Tailwind 4), reusing its existing `Button` component and adding the other components below to its component library, following its existing file/folder conventions.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and copy (in Portuguese) are final. Recreate pixel-close using Tailwind classes/tokens equivalent to the values below — don't re-guess values.

## Design Tokens

### Colors
- Brand primary (evergreen): `#3F6B4F` — CTAs, active nav state, links, focus rings
- App background (mint off-white): `#eef4f0`
- Card/paper: `#fff`
- Landing page background: `slate-950` (near-black) — the ONLY dark surface in the app
- Neutrals: Tailwind `slate` scale (`slate-100`…`slate-950`)
- Amber (AI-accent / warning): `amber-050` bg, `amber-100` border, `amber-600`/`amber-700`/`#78350f` text — used for "Dica de Ouro do Método" callouts and AI badges
- Success: `--state-success-bg` / `--state-success-text` (green) — completed study status, quiz success
- Danger: `#dc2626` — destructive actions only (e.g. "Sair")

### Typography
- Single family: **Plus Jakarta Sans** (sans) for all UI text; a serif (`var(--font-serif)`, e.g. Playfair Display-equivalent) reserved for headings/quotes/scripture only
- Landing hero: 56px/900 weight, `line-height:0.95`, negative tracking
- In-app headings: 18–28px, 700 weight
- Body: 13–15px
- Micro-labels (eyebrows, tab labels): 9–11px, 700 weight, uppercase, `letter-spacing:0.1em–0.15em`
- Scripture quotes: serif, italic, with em-dash citation (e.g. `— Isaías 40:8`)

### Spacing & Radii
- Section padding: 24–48px
- Card radius: 16–28px (up to 48px for hero/modal "big cards")
- Small elements (inputs, pills): 10–16px radius
- Buttons: `rounded-lg` (not pill), except FAB and status dots (fully round)

### Shadows & Effects
- Soft, large-blur, low-opacity shadows only — no hard drop shadows
- `.glass-card`: translucent white ~80%, `backdrop-blur-sm`, hairline white border
- FAB: tinted glow shadow matching brand color (`var(--shadow-brand)`)

### Motion
- Button press: `scale(0.95)` on `:active` — never a color change
- Hover on solid buttons: opacity dip (~90%); outline/ghost buttons get a light bg tint
- FAB: `scale(1.1)` on hover, plus a pulsing red notification dot (`pulseDot`, 2s ease-in-out infinite)
- Landing hero content: fade + slide-up entrance (`fadeSlideUp`, 0.8s ease-out; feature grid follows 0.3s later)
- Feature cards: background/border lighten + icon `scale(1.1)` on hover, 0.3–0.5s ease

## Screens / Views

### 1. Topbar (persistent nav, all screens except Landing)
- Fixed/sticky header, dark `slate-900` background (per latest revision — was translucent white/blurred; changed to a darker tone for contrast), height 64px, `max-width:1100px` centered content
- Left: wordmark "O Hermeneuta" (serif, white, clickable → Dashboard) + 4 nav items (icon + label): Meus Estudos, Academia, Novo Estudo, Salas Virtuais. Active item is full white; inactive is `rgba(255,255,255,0.65)`
- Right: **user menu** (click to open) — avatar circle (brand-color bg, user icon) + "Convidado(a) / modo visitante" label + chevron-down. Opens a white dropdown card (14px radius, shadow-lg) with: Minha Conta, Configurações, Editar Perfil, divider, Sair (red text)

### 2. Landing Screen
- Full-bleed dark hero (`slate-950`) with `hero-mentorship.png` background photo at low opacity under a dark gradient overlay (`rgba(2,6,23,0.45)→0.2→0.8` top to bottom)
- Header row: logo mark (white rounded square + book-open icon) + wordmark, "Entrar" ghost button top-right
- Eyebrow pill: "Um método que transforma sua pregação" (white text, amber sparkle icon, translucent pill bg)
- H1: "Trabalhe o Texto." (56px/900, tight)
- Subhead paragraph, 19px, `#cbd5e1`
- CTA row: primary button "Começar Estudo Grátis" + secondary text-button "Crie sua conta" (chevron-right icon) — **note: previously said "Salvar com Google", corrected per feedback since there's no real Google auth flow implied yet**
- 3-column feature grid (Método Estruturado / Instrutor de IA / Fidelidade Textual), each a card with icon chip, title (uppercase serif), description
- **Footer** (added per feedback — legal/required links): "Desenvolvido para a glória de Deus" left-aligned, right-aligned links: Política de Privacidade, Termos de Uso, Licenças — all `#94a3b8`, hover white

### 3. Dashboard Screen ("Meus Estudos")
- Hero banner (220px tall, full width): library/bookshelf photo (`library-shelf.jpg`) with dark gradient overlay, title "Seus Estudos" + subtitle over it
- Toolbar row: search input (placeholder "Pesquisar por título ou referência...") + 3 status filter pills (Todos / Em andamento / Concluídos) + "Novo Estudo" outline button
- Guest-mode notice banner (amber) with "Faça login com Google" link
- **Study card grid** — recently resized to ~50% of original size (per feedback, anticipating many sermons): cards now ~140px min width, 10px gap, 12px padding, 10px radius; each shows status icon chip, title (9px), reference (6px), "Última atualização" + chevron (5px). *(Note: these sizes are very small for real typography minimums — when implementing, verify against the target platform's minimum readable text size; consider a "compact vs. comfortable" density toggle instead of shrinking text below ~11–12px.)*
- Empty state: search-x icon + "Nenhum estudo encontrado para "..."."

### 4. Bible Selection Screen
- Centered narrow column (max-width 640px)
- Title + subtitle
- Glass-card form: 2-col (Livro select, Capítulo input), 3-col (Versículo Inicial, Versículo Final, Tradução select)
- Full-width primary button "Confirmar Seleção e Iniciar"
- Scripture quote callout below (Isaías 40:8)

### 5. Study Step Screen (8-step "Cavar & Descobrir" flow)
- Header: "Estudo: {referência}", progress %, `StepTabs` component showing all 8 steps + "Finalização"
- 2-column layout (2fr content / 1fr AI sidebar):
  - Content column: step title + description; **reference-text card** (white, 16px radius) — now has a **collapse/expand toggle** (chevron-up/down button, per feedback) to free up space for the textarea below; large textarea for the user's notes; footer row: "Salvar rascunho" ghost button (left), "Voltar"/"Próximo Passo" buttons (right)
  - Sidebar: glass-card "Instrutor de IA" panel — collapsed state shows a prompt + "Revisar com IA" button (dark bg); expanded state shows AI feedback text + "Entendi, obrigado!" button. Below it, an amber "Dica de Ouro do Método" tip card, unique copy per step

### 6. Groups Screen (Salas Virtuais)
- Two-pane layout, fixed height, white rounded container (24px radius)
- Left sidebar (280px, sunken bg): "Salas Virtuais" header, list of rooms (AI instructor + class room), each a pill button; selected state uses brand-color bg
- Right pane: room name header, scrollable message list (sender label + bubble; own messages right-aligned brand-color bubble, AI messages amber bubble, others white bubble), input row + send button

### 7. Academy Screen
- Trail view: eyebrow pill "Academia do Método", title "Trilha O Hermeneuta" (italic serif), 3 modules each with a numbered circle + title/desc + lesson button grid
- Lesson view: back button, lesson body card (devotional text + scripture), then either a quiz CTA card (brand-color bg) or a success state (check-circle icon, "Excelente Trabalho!")

## Interactions & Behavior
- All navigation is client-side state swap (no real routing in the prototype — implement with the app's actual router)
- FAB (bottom-right, all screens except Landing): opens Groups screen; has a pulsing unread-message dot
- User menu, AI panel, and reference-text card are toggle/disclosure patterns (open/closed local state)
- Dashboard search + status filter are client-side filtering over the studies list
- Groups chat: sending a message to the AI room triggers a canned reply after 600ms (replace with real Gemini API call)

## Assets
- `assets/hero-mentorship.png` — landing hero photo (warm-toned, dim, intimate mentorship framing)
- `assets/library-shelf.jpg` — Dashboard hero banner photo (user-provided)
- Icons: Lucide icon set (line-only), referenced by name — use the codebase's existing `lucide-react` install

## Files
- `prototype/` — full HTML/JS prototype (`index.html` is the entry point; `Shared.jsx` = Topbar/Icon; one `.jsx` file per screen)
- `prototype/o-hermeneuta-design-system-.../` — design tokens (`tokens/*.css`), the `Button` component source, and the guidelines specimens referenced above

## Known gaps / open questions for the dev
- Dashboard card sizing (50% reduction) may be too small for real typography minimums — recommend a density toggle instead of fixed shrink.
- Footer legal links (Privacidade, Termos, Licenças) are placeholders — need real destinations/pages.
- User menu items (Minha Conta, Configurações, Editar Perfil) have no wired destinations yet in the prototype.
