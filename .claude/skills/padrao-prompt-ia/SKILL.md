---
name: padrao-prompt-ia
description: Use esta skill sempre que alterar api/gemini.ts, o system prompt do Instrutor de IA, o schema de resposta JSON do mentor, os limites de quota/sanitização, ou src/services/geminiService.ts. Consulte antes de mudar qualquer texto do SYSTEM_INSTRUCTION ou o contrato de resposta — mudanças aqui têm implicação teológica, não só técnica.
---

# Padrão do Instrutor de IA (Gemini) — O Hermeneuta

Fonte: `api/gemini.ts` (2026-08-16). Única rota serverless do projeto, roda
em `gemini-3-flash-preview`.

## Regra mais importante: isto não é só engenharia

O `SYSTEM_INSTRUCTION` define uma persona teológica com fronteiras
explícitas (fontes permitidas/proibidas, os dois desvios "legalismo" e
"liberalismo/permissividade", uso ou não de Cristologia). **Nenhum
especialista de IA deve alterar o conteúdo doutrinário/pedagógico do prompt
por conta própria** — isso é decisão do usuário (dono do produto, que já
sinalizou em `doc/qa/TEST_GAPS.md` a necessidade de homologação teológica por
especialistas antes de ir para produção real). Mudanças estruturais (formato
JSON, limites de tamanho, forma de fallback) são território técnico normal;
mudanças de conteúdo doutrinário não são.

## As 3 ações (`GeminiAction`)

```
stageFeedback  — feedback sobre a etapa atual do método (payload: stage, study)
askInstructor  — pergunta livre com contexto do estudo (payload: question, study)
generalChat    — chat geral do overlay, com histórico (payload: message, history?)
```

Adicionar uma ação nova exige: tipo em `GeminiRequestBody`, branch em
`validateBody`, branch em `normalizeBody`, branch em `generateText`. Seguir
exatamente essa mesma sequência das 3 existentes.

## Contrato de resposta — JSON estrito, não mudar sem atualizar os dois lados

```ts
{
  desvioDetectado: "legalismo" | "liberalismo/permissividade" | null,
  gravidade: "leve" | "moderado" | "recorrente" | null,
  acertoParcial: string | null,
  feedback: string,
  proximaPergunta: string,        // "" quando não houver pergunta
  dica?: string | null,
  etapaMetodo: "linha" | "boas_perguntas" | "genero" | "estrutura" |
               "contexto" | "ideia_principal" | "intento_transformador" |
               "teologia_biblica" | null,
  baseUsada: "texto_do_usuario" | "texto_biblico_do_contexto" | "ambos",
}
```

Se esse schema mudar, **as duas funções `isMentor*` (validadores de tipo) e
`formatMentorText` precisam mudar junto** — são o parser tolerante que
extrai o JSON da resposta do modelo (via `extractJsonObject`, que ignora
cercas de code-block e faz parsing de chaves balanceadas) e formatam em
Markdown para o frontend. Um campo novo sem o validador correspondente faz
`parseMentorResponse` cair no fallback genérico silenciosamente.

## Limites (não afrouxar sem necessidade real)

```
MAX_MESSAGE_LENGTH        = 4000    (pergunta/mensagem do usuário)
MAX_CONTEXT_FIELD_LENGTH  = 12000   (cada campo do Study truncado no prompt)
MAX_HISTORY_ITEMS         = 6       (últimas mensagens do generalChat)
MAX_GUEST_REQUESTS_PER_DAY = 5
MAX_USER_REQUESTS_PER_DAY  = 30
```

`sanitizeStudy` trunca cada campo do `Study` antes de montar o prompt — ao
adicionar um campo novo em `Study` que deva entrar no contexto da IA,
adicionar o truncamento correspondente em `sanitizeStudy` (ver limites
espelhados em `padrao-firestore-rules`, mas aqui é limite de *prompt*, não de
gravação no Firestore — podem divergir).

## ⚠️ Gap real: quota é `Map` em memória, não confiável em produção

`quotaStore` é um `Map` no escopo do módulo. Em Vercel serverless, cada
instância fria tem seu próprio `Map` — a quota diária de 5/30 **não é
garantida entre invocações diferentes**, só dentro de uma mesma instância
"quente". Isso não é um bug a "corrigir" silenciosamente: trocar para um
store persistente (Firestore, Redis) é uma mudança de arquitetura, decisão
do usuário. Ao ser questionado sobre confiabilidade de quota, apontar este
gap em vez de assumir que já está resolvido pelo `aiUsageService.ts`
client-side (que é só telemetria/limite de UX, não enforcement real).

## Identidade da requisição (`getIdentity`)

Usuário autenticado: `Authorization: Bearer <idToken>`, decodificado sem
verificar assinatura (ver gap de segurança em `padrao-firestore-rules`).
Convidado: header `X-Hermeneuta-Guest-Id`, regex
`^guest_[a-zA-Z0-9_-]{4,64}$`. Qualquer rota nova de IA precisa aceitar os
dois caminhos de identidade — não assumir que todo usuário está logado.

## Frontend (`src/services/geminiService.ts`)

Chama `fetch('/api/gemini')` com o Bearer token (ou header de convidado);
retenta **uma vez** com refresh forçado do token em 401/403. Não adicionar
um segundo mecanismo de retry — esse já é o padrão.
