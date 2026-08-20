# O Hermeneuta — Design System

A design system extracted from **O Hermeneuta**, a Brazilian-Portuguese Bible hermeneutics training app built by developer P1n40. The app guides students and preachers through the "Cavar & Descobrir" (Dig & Discover) method — an 8-step process from bible-text selection through observation, questions, genre analysis, historical context, main idea, transforming intent, sermon outline, to a finished sermon — with an AI instructor (Gemini) for pedagogical feedback along the way, plus a lesson-based Academy and group chat rooms for professor/student cohorts.

There is a single product/surface: the O Hermeneuta web app (React 19 + TypeScript + Vite + Tailwind 4, Firebase auth/data, Gemini AI). No separate marketing site or native app exists in the source.

## Sources
- GitHub: [github.com/PinhoTrader/o-hermeneuta](https://github.com/PinhoTrader/o-hermeneuta) (mirror read for this system; official repo linked in-app: [github.com/P1n40/o-hermeneuta](https://github.com/P1n40/o-hermeneuta))
- Design audit already existed in-repo at `.claude/skills/padrao-design/SKILL.md`, dated 2026-08-16 — this system builds directly on that audit plus a full read of `src/index.css`, `src/components/ui/Button.tsx`, `src/components/Layout.tsx`, and all page files under `src/pages/`.
- No Figma file or slide deck was attached. Explore the linked repo for anything this system doesn't cover — service/state logic, Firestore rules, the full Academy curriculum, etc.

## Index
- `tokens/` — colors, typography, spacing, effects (shadows/radii/motion) as CSS custom properties, imported by `styles.css`.
- `components/core/Button.jsx` — the one component the source actually defines.
- `components/forms/Input.jsx`, `components/surfaces/Card.jsx`, `components/feedback/Badge.jsx`, `components/feedback/Modal.jsx`, `components/navigation/StepTabs.jsx` — **intentional additions** (see below).
- `guidelines/` — foundation specimen cards (colors, type, spacing, radii, shadows, brand, iconography) shown in the Design System tab.
- `ui_kits/hermeneuta-app/` — a click-through recreation: Landing → Dashboard → Bible Selection → 8-step Study flow with AI panel → Groups chat → Academy lessons/quiz.
- `assets/hero-mentorship.png` — the landing-page hero photo (only image asset in the source).

## Components
| Component | Source |
|---|---|
| `Button` | `src/components/ui/Button.tsx` — the app's only extracted component |
| `Input`, `Select` | Intentional addition — lifted from the repeated inline form markup (`App.tsx`, `BibleSelection.tsx`) |
| `Card` | Intentional addition — the `.glass-card` utility class + the inline `bg-white rounded-3xl shadow-xl` pattern, unified with a variant prop |
| `Badge` | Intentional addition — the inline role/status pill pattern in `Layout.tsx` / `AcademyPage.tsx` |
| `Modal` | Intentional addition — the inline centered-dialog markup repeated in `Dashboard.tsx` |
| `StepTabs` | Intentional addition — the inline step-rail markup in `StudyController.tsx` |

**Intentional additions rationale:** the source repo only extracts `Button` into a component; every other recurring pattern (inputs, cards, badges, modals, step navigation) is copy-pasted inline across pages. Since a design system with only one primitive is too thin to build screens from, these five were extracted verbatim from that inline markup — no new visual invention, just consolidation. Exact colors, radii, spacing, and states were copied from the inline classes, not rounded to a framework default.

## Content fundamentals
- **Language:** Brazilian Portuguese throughout (`lang="pt-BR"`), formal-but-warm — uses "você" (not "tu"), never "vocês collectively" wording tricks.
- **Voice:** devotional and instructional, not corporate. Copy speaks in second person to the individual learner: "O ambiente de treinamento prático que guia você através da observação, exegese e aplicação bíblica profunda."
- **Tone markers:** frequent use of the method's own vocabulary — "Cavar" (dig), "Descobrir" (discover) — as verbs applied to scripture, not generic UX copy ("Salve seu progresso" never appears as literally "save your progress"; it's "salvar na nuvem", tied to the guest/cloud distinction).
- **Microcopy is direct and short**: button labels are verbs + object ("Começar Estudo Grátis", "Confirmar Seleção e Iniciar", "Revisar com IA"), never generic "Submit"/"Next".
- **Scripture is quoted in italics with an em-dash citation** ("... — Isaías 40:8"), always in serif type, set apart from UI copy.
- **No emoji anywhere** in the source. The only non-text glyphs are a Lucide icon set and the literal "◌" character used as a spinner.
- **Sign-off line**: the footer reads "Desenvolvido para a glória de Deus" (Made for the glory of God) — a real, unironic statement of purpose that should be preserved if the footer copy is reused.
- **Errors and warnings are apologetic and actionable**, not blaming: "Não conseguimos carregar o texto automaticamente agora. Você pode continuar e preencher/conferir o trecho manualmente."

## Visual foundations
- **Palette:** deep evergreen `#3F6B4F` (brand primary — CTAs, active states, links) on a soft mint-tinted off-white `#eef4f0` app background, with white (`#fff`) paper for cards. Neutrals are plain Tailwind `slate`. Semantic colors (success/green, danger/red, warning & AI-accent/amber, info/blue) are used sparingly and only for real state — never decoratively. **Only the landing page departs from the light theme**, going near-black (`slate-950`) with a photographic hero and amber accent for the tagline italic — an intentional contrast between the "invitation" surface and the "workspace" surface. *(Refreshed from the source's original olive `#5A5A40` — a deliberate modernization pass.)*
- **Type:** a single modern grotesk, Plus Jakarta Sans, used for everything — display headings, body copy, labels, and scripture quotes (italic weight for quotes) — replacing the source's original serif/sans pairing (Playfair Display + Inter) for a cleaner, more contemporary voice. Display sizes go very large and tight (`text-5xl`–`text-8xl`, `leading-[0.95]`, negative tracking) on the landing hero only; in-app headings stay modest (`text-xl`–`text-3xl`).
- **Spacing:** loose, generous padding inside cards (24–48px) and full-bleed sections; no dense/compact UI anywhere in the source.
- **Backgrounds:** solid off-white for the whole authenticated app; the landing page alone uses full-bleed photography (`hero-mentorship.png`) under multiple stacked dark gradients plus soft color-blur orbs (`blur-[120px]`) for depth. No repeating patterns, no illustrations, no textures elsewhere.
- **Cards, exactly two patterns:** `.glass-card` (translucent white 80%, `backdrop-blur-sm`, hairline white border, soft shadow) used over the off-white app background for study/dashboard cards; a solid white card (`rounded-3xl`, `shadow-xl`, slate-100 hairline border) for modals and centered forms. Never a colored left-border accent card.
- **Corner radii:** generous and consistent, bumped up in this modernization pass — `rounded-xl`/`rounded-2xl` for inputs and small elements, up to `rounded-[48px]` for the "big card" (modals, forms, hero/feature panels). Buttons use `rounded-lg`, not pill-shaped, except the FAB and status dots which are fully round.
- **Shadows:** refined to be softer but deeper — larger blur radii and lower opacity than the source's originals, still directional-neutral (no hard drop shadows); the FAB gets a bespoke tinted glow matching the new evergreen brand color.
- **Motion:** `framer-motion` (`motion`) drives real animation — mobile nav dropdown, chat drawer slide-in (spring, damping 25), lesson-view crossfades. Tailwind's `animate-in`/`fade-in`/`zoom-in-95` utility classes appear all over the codebase's intent but **do not actually render** — `tailwindcss-animate` is never installed, so these are dead classes today (flagged as a known gap in the source's own design audit). Treat any "fade/zoom-in" utility class as aspirational, not real, unless paired with `framer-motion` or a real `@keyframes` rule.
- **Hover/press states:** hover lightens via `opacity-90` on solid buttons or a light background tint on outline/ghost buttons — never a darker shade. Press state on every clickable control is a `scale(0.95)` shrink (`active:scale-95`), not a color change. The FAB additionally grows on hover (`hover:scale-110`).
- **Borders:** hairline `slate-100`/`slate-200`, 1px, used generously as the primary way to separate white-on-white surfaces (since shadows are kept subtle).
- **Transparency/blur:** used specifically for "floating over content" surfaces — the sticky header, `.glass-card`, and the mobile nav/chat drawer backdrop — always `backdrop-blur-sm`/`-md`, never on ordinary page content.
- **Imagery color vibe:** the one photograph in the app (landing hero) is warm-toned, dim, and intimate (mentorship/conversation framing) rather than bright or corporate; it sits under a cool dark gradient overlay so text stays legible.
- **Layout rule:** `max-w-7xl` centers all in-app content; the sticky topbar (`h-16`) and a bottom-right FAB are the only fixed-position chrome.

## Iconography
- **Lucide** (`lucide-react`) is the only icon system in the source — line-only, no filled variants, sized `16`/`18`/`20`/`24`/`28`/`32` depending on context (never a custom scale). This system's cards and UI kit reference the equivalent icons from the `lucide-static` CDN build so no icon files need bundling.
- No custom SVG icon set, no icon font, no PNG icon sprites, and no emoji were found in the source.
- The single non-Lucide glyph is the literal Unicode character "◌" (dotted circle), used as a spinning loading indicator on buttons and page loaders via `animate-spin`.

## Brand assets
- **No logo file exists in the source repo.** Wherever a mark would go (landing header, favicon), the app currently just renders a Lucide `BookOpen` icon inside a white rounded square next to the wordmark "O Hermeneuta" set in Playfair Display. This system follows the same approach — a plain-type wordmark, never an invented logo — see `guidelines/brand-wordmark.card.html`. If real logo files exist outside this repo, please add them and this system will incorporate them.
- `assets/hero-mentorship.png` is the only photographic asset in the source; it is used exactly once (landing page background).

## Caveats
- This system covers only the surfaces read from `PinhoTrader/o-hermeneuta`'s `main` branch on 2026-08-17. `AdminPanel.tsx` and the full multi-lesson Academy catalog were not built out as UI-kit screens (only representative modules/lessons) — ask if you'd like those added.
- Fonts are loaded live from Google Fonts (already the source's own approach — no self-hosted `.ttf`/`.woff2` files existed to copy), so no font substitution was needed or flagged.
- A modernization pass (per request) shifted the brand color from olive to evergreen, consolidated type to a single sans family, and deepened shadows/radii — this is a deliberate departure from the source, documented above rather than silently applied.
- The Dashboard now has a library-themed hero image slot (empty by default — drop in a real photo) plus search/status-filter controls, anticipating the study archive growing over time.
