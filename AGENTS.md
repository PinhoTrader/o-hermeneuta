# AGENTS.md — O Hermeneuta

> Sequência obrigatória de consulta antes de qualquer mudança estrutural:
> **CLAUDE.md → AGENTS.md → skill relevante em `.claude/skills/`**

---

## Regras para agentes de IA neste projeto

### 1. Tailwind CSS 4 — não usar sintaxe do Tailwind 3

Este projeto usa **Tailwind 4.x** via `@tailwindcss/vite`. Tokens vivem em
`src/index.css` (`@import "tailwindcss"` + bloco `@theme`), não em
`tailwind.config.js` com `theme.extend`. Se um agente sugerir sintaxe de
config antiga do Tailwind 3, rejeitar.

### 2. Firebase client SDK — nunca `firebase-admin` no cliente

`src/lib/firebase.ts` é o único ponto de init do SDK. `firebase-admin` está
instalado mas **não é usado em lugar nenhum** hoje — não importar em
código que roda no browser.

### 3. `GEMINI_API_KEY` só no servidor

Vive só em `process.env` dentro de `api/gemini.ts`. Nunca referenciar em
`src/` (bundle do cliente) nem logar seu valor.

### 4. Firestore rules é a fonte da verdade de acesso, não a UI

`usePermissions.ts` decide o que a interface mostra; `firestore.rules`
decide o que o banco realmente permite. Uma tela que "esconde" um botão não
substitui a regra correspondente — sempre testar acesso direto ao Firestore
com um usuário do papel certo, não só revisão de código da UI.

### 5. O contrato JSON do Instrutor de IA é rígido

`api/gemini.ts` espera resposta do Gemini em JSON estrito com campos fixos
(`desvioDetectado`, `gravidade`, `feedback`, `proximaPergunta`, etc.). Mudar
esse schema sem atualizar os validadores `isMentor*` e `formatMentorText`
faz o parser cair em fallback genérico silenciosamente. Ver skill
`padrao-prompt-ia`.

### 6. Conteúdo do Instrutor de IA não é decisão técnica

O `SYSTEM_INSTRUCTION` define fronteiras teológicas/pedagógicas (fontes
permitidas, os desvios "legalismo"/"liberalismo"). Nenhum agente edita esse
conteúdo por conta própria — é decisão do usuário. Ver `especialista-ia` e
skill `padrao-prompt-ia`.

### 7. TypeScript — sem atalhos

Sem `any` novo. Sem `as T` em dado vindo de Firestore/API sem necessidade —
usar os tipos de `src/types.ts` e narrowing.

### 8. `npm run lint` não cobre `.tsx`/`.ts`

`eslint.config.js` só aplica `@firebase/eslint-plugin-security-rules` a
`firestore.rules`. `lint` roda `tsc --noEmit` — cobre erro de tipo, não
qualidade de código React. Não reportar "lint limpo" como se cobrisse o app
inteiro.

### 9. Padrão de autosave do fluxo de estudo

Todo campo editável das 8 etapas segue debounce de 3000ms +
`updateCurrentStudy` (ver `StudyStep.tsx`), com salvamento manual disponível
também. Não introduzir um segundo mecanismo de autosave.

### 10. Super-admin — fonte única no cliente, regra separada

`escoladetradersead@gmail.com` vive em `src/config/superAdmin.ts`
(`SUPER_ADMIN_EMAIL`/`isSuperAdminEmail()`) — importado por todo componente
que precisa dessa checagem, nunca mais copiado como string literal.
`firestore.rules` continua com sua própria cópia (linguagem própria, não
importa TS). Trocar esse e-mail exige tocar os dois — ver skill
`padrao-firestore-rules`.

### 11. Armadilha real já encontrada: animações "no-op"

Classes `animate-in`/`fade-in`/`slide-in-from-right-4`/`zoom-in-95` aparecem
em 9 arquivos mas não existe plugin `tailwindcss-animate` nem definição
delas no projeto — não geram CSS nenhum. Não presumir que uma tela já tem
animação de entrada só porque a classe está escrita. Ver skill
`padrao-design`.

### 12. Ordem de consulta antes de mudanças estruturais

```
1. CLAUDE.md   — contexto do projeto, stack, princípios
2. AGENTS.md   — este arquivo, regras técnicas para agentes
3. skill relevante em .claude/skills/
```

Se houver conflito entre o que um agente "sabe" do treinamento e o que está
nos arquivos acima, os arquivos acima têm prioridade absoluta.

---

### 13. Subagentes e skills deste projeto

Este projeto usa subagentes especializados (`.claude/agents/`) e skills
(`.claude/skills/`) para dividir o trabalho e garantir que cada tipo de
mudança consulte a fonte certa antes de escrever código.

**Subagentes:**

| Agente | Escopo |
|---|---|
| `arquiteto-de-produto` | Descoberta antes de qualquer feature nova sem especificação completa; dono dos 13 gaps conhecidos; decide precedência entre documentos. Não escreve código. |
| `especialista-ux` | Design visual, fluxo de usuário, acessibilidade; mantém a skill `padrao-design`. Não implementa `.tsx` — define e revisa. |
| `especialista-frontend` | Páginas/componentes React, roteamento, context, hooks. |
| `especialista-firestore` | `firestore.rules`, modelo de dados, `src/services/*`. |
| `especialista-ia` | `api/gemini.ts`, prompt do Instrutor, contrato JSON, quotas — nunca decide conteúdo doutrinário sozinho. |
| `especialista-pipeline` | Vitest, lint, pipeline/deploy; mantém as skills `padrao-teste` e `padrao-deploy`. |

**Skills:** `padrao-design`, `padrao-componente-frontend`,
`padrao-firestore-rules`, `padrao-prompt-ia`, `padrao-teste`, `padrao-deploy`,
`precedencia-e-gaps` — cada uma consultada pelo agente correspondente antes
de escrever o tipo de arquivo relevante. A skill `precedencia-e-gaps` é a
lista viva dos 13 gaps encontrados no raio-X inicial (2026-08-16) — qualquer
agente que esbarrar num desses gaps deve sinalizar ao usuário, não decidir
sozinho.

**Padrão estabelecido**: mudança em `firestore.rules` ou no
`SYSTEM_INSTRUCTION` do Instrutor de IA é sempre confirmada explicitamente
com o usuário antes de aplicada — mesmo quando a mudança parece
tecnicamente óbvia, porque ambas têm componente de decisão de produto/
segurança/teologia que não é só técnica.
