---
name: padrao-prompt-ia
description: Use esta skill sempre que alterar api/gemini.ts, o system prompt do Instrutor de IA, o schema de resposta JSON do mentor, os limites de quota/sanitização, ou src/services/geminiService.ts. Consulte antes de mudar qualquer texto do SYSTEM_INSTRUCTION ou o contrato de resposta — mudanças aqui têm implicação teológica, não só técnica.
---

# Padrão do Instrutor de IA (Gemini) — O Hermeneuta

Fonte: `api/gemini.ts` (2026-08-16, atualizado em 2026-08-22 com a fonte
canônica do método). Única rota serverless do projeto, roda em
`gemini-3-flash-preview`.

## Fonte canônica do método — `api/cavarEDescobrirPrinciples.ts` (2026-08-22)

Até 2026-08-22, os "PRINCÍPIOS DO MÉTODO" dentro do `SYSTEM_INSTRUCTION` eram
uma síntese em prosa escrita à mão. Isso foi substituído por texto transcrito
diretamente do livreto oficial **"Princípios do Cavar & Descobrir", Edição
5.0** (WordPartners, 2023, CC BY-SA 4.0) — ver `api/cavarEDescobrirPrinciples.ts`.
Esse arquivo é a fonte única de verdade do conteúdo doutrinário/pedagógico do
método; `SYSTEM_INSTRUCTION` continua controlando só persona/comportamento/
formato de saída.

**Por que não é RAG/embeddings**: o livreto inteiro tem ~9 mil palavras
(~22 mil caracteres) — cabe folgado em qualquer chamada ao Gemini. Não há
necessidade de busca semântica porque a etapa atual já é conhecida com
certeza (vem do app via `stage`, não de inferência) — é só um lookup
determinístico, não recuperação difusa.

Duas funções de acesso:
- `getMethodContextForStage(stageLabel?)` — usada por `stageFeedback`. Injeta
  só "A Linha" (sempre) + o(s) princípio(s) mapeado(s) à etapa atual via
  `STAGE_LABEL_TO_PRINCIPLES`, cujas chaves são os `label` de `STEPS` em
  `src/pages/StudyController.tsx` (`'Observação'`, `'Perguntas'`, `'Gênero &
  Estilo'`, `'Contexto'`, `'Ideia Principal'`, `'Intento'`, `'Esboço'`,
  `'Sermão'`) — **não** os valores do enum `etapaMetodo`. Se o `label` de uma
  etapa mudar em `StudyController.tsx`, o mapeamento quebra silenciosamente
  (cai no fallback de só "A Linha") — atualizar os dois juntos.
- `getFullMethodText()` — usada por `askInstructor` e `generalChat`, que não
  têm uma etapa única conhecida. Injeta o livreto completo.

O princípio **"Texto e Estrutura"** (página 20 do livreto, "o texto é rei" —
sobre estruturas mentais/teológicas do leitor, diferente do princípio
"Estrutura" sobre unidades de pensamento do texto) foi adicionado como 9º
princípio e como novo valor `texto_estrutura` no enum `etapaMetodo` — não
existia na síntese anterior. A tabela de características por gênero (uma
página do livreto em layout de colunas que a extração de texto do PDF
embaralhou) foi transcrita manualmente a partir do original pelo dono do
produto e está incorporada ao princípio `genero`.

Mudar o **conteúdo** de `cavarEDescobrirPrinciples.ts` é decisão doutrinária/
pedagógica do dono do produto, igual a mudar o `SYSTEM_INSTRUCTION` — ver
regra abaixo. Mudar a lógica de lookup/mapeamento é território técnico
normal.

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
               "teologia_biblica" | "texto_estrutura" | "rota_direta" | null,
  baseUsada: "texto_do_usuario" | "texto_biblico_do_contexto" | "ambos",
  nivelPercebido: "iniciante" | "intermediario" | "avancado" | null,
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

## Quota — resolvido em 2026-08-17 para usuários autenticados

`reserveQuota` bifurca por `identity.kind`:
- **`guest`**: continua em `guestQuotaStore` (`Map` no escopo do módulo) —
  limitação aceita e permanente, porque convidado não tem UID Firebase
  durável pra persistir contra. Em Vercel serverless, cada instância fria
  tem seu próprio `Map`, então a quota de convidado (5/dia) só é confiável
  dentro de uma mesma instância "quente". Isso é conhecido, não é bug.
- **`user`**: `reserveUserQuota` lê e grava na coleção `aiUsage` do
  Firestore (mesma coleção que `aiUsageService.ts` usa no cliente), num
  documento reservado `{uid}_daily_{yyyy-mm-dd}` com `studyId:
  '__daily_quota__'` — reaproveita o schema já validado em
  `firestore.rules` (nenhuma regra nova foi necessária). A chamada é feita
  via API REST do Firestore, autenticada com o **próprio ID token do
  usuário** (já verificado de verdade, ver seção "Identidade" abaixo) —
  sem precisar de credencial de admin. Grava `lastQueryAt` via
  `updateTransforms: [{ fieldPath: 'lastQueryAt', setToServerValue:
  'REQUEST_TIME' }]`, o equivalente de baixo nível ao `serverTimestamp()`
  do SDK — necessário porque a regra exige `incoming().lastQueryAt ==
  request.time` exatamente. Falha de leitura/escrita no Firestore é tratada
  como "fail closed" (nega a requisição, não abre exceção).

**Limitação conhecida e aceita**: não há transação — duas requisições
simultâneas do mesmo usuário podem ler a mesma contagem antes de qualquer
uma commitar, permitindo passar do limite por 1 em concorrência rara. Dado
o volume baixo (30/dia, uso interativo de uma pessoa por vez), não foi
implementada transação Firestore (`:beginTransaction`) para isso — se abuso
real for observado, é o próximo passo natural.

Testes em `src/test/geminiSecurity.test.ts` cobrem o formato exato da
chamada REST (mock de `fetch`) — qualquer mudança no wire format do
Firestore deve manter esses testes passando.

## Identidade da requisição (`getIdentity`)

Usuário autenticado: `Authorization: Bearer <idToken>`, verificado de
verdade via `verifyFirebaseIdToken` (assinatura RS256 contra o JWKS público
do Google, `issuer`/`audience`/`exp` validados por `jose`) — ver seção
"JWT" abaixo. Convidado: header `X-Hermeneuta-Guest-Id`, regex
`^guest_[a-zA-Z0-9_-]{4,64}$`. Qualquer rota nova de IA precisa aceitar os
dois caminhos de identidade — não assumir que todo usuário está logado.

## Consciência de gênero e nível do aluno (2026-08-23)

Duas lacunas pedagógicas fechadas nesta revisão, ambas descobertas porque o
contexto (`bibleSelection.book`) já ia para a IA desde a etapa de Observação,
mas nada instruía a usá-lo cedo, e a instrução "adapte-se ao nível do
usuário" nunca teve nenhum dado real para se basear.

- **Dica de gênero** (`api/bibleBookGenres.ts`, `getGenreHint`) — tabela
  determinística livro→gênero (66 livros, categorias do próprio livreto),
  injetada em `getStudyContext`/`getInstructorContext` em toda etapa, não só
  em "Gênero & Estilo". Regra explícita no `SYSTEM_INSTRUCTION`: a IA usa
  isso só para calibrar que tipo de observação puxar do aluno - **nunca**
  para anunciar o gênero antes da etapa certa (identificá-lo é parte do que
  o método ensina o aluno a fazer sozinho). Livros de gênero
  misto/contestado (Jó, Cantares, Jonas, Daniel) carregam um `caveat` no
  texto injetado, para a IA não tratar a classificação como absoluta.

- **Nível do aluno** (`UserProfile.experienceLevel` em `src/types.ts`) —
  autodeclarado uma vez em `EditProfile.tsx`, enviado no payload de
  `stageFeedback`/`askInstructor` (campo `experienceLevel`, opcional) e
  injetado no contexto via `getExperienceLevelLine`. O modelo relata de
  volta, no campo **interno** `nivelPercebido` do JSON (nunca renderizado em
  `formatMentorText` - mesma categoria de `etapaMetodo`/`baseUsada`), o
  nível que percebeu na interação atual. Se divergir do autodeclarado,
  `maybeAdjustPerceivedLevel` grava a atualização direto em
  `users/{uid}.experienceLevel` via REST do Firestore com o idToken do
  próprio usuário (mesmo padrão de `reserveUserQuota`) - efeito colateral
  não-crítico, silencioso, nunca derruba a resposta principal se falhar.
  **Limitação conhecida**: o app não tem listener em tempo real no perfil
  (só `getDoc` no login em `AuthContext.tsx`), então esse ajuste só é
  percebido pelo cliente na próxima sessão, não na aba já aberta.

## Técnicas de engajamento pedagógico (2026-08-23)

Seção `TÉCNICAS DE ENGAJAMENTO` no `SYSTEM_INSTRUCTION`, adicionada a partir
de pesquisa do dono do produto (via NotebookLM) sobre técnicas de ensino de
três fontes de hermenêutica - **não conteúdo hermenêutico delas, só a forma
de ensinar**: Henry Virkler (estudos de caso/"exercícios DM" onde o usuário
julga um cenário fictício), David I. Starling (convidar o usuário a imitar
o procedimento do próprio autor bíblico), Richard Palmer/Gadamer
("fortalecer o argumento do usuário antes de desafiá-lo", pergunta aberta
tipo "não será que...?").

**Distinção que motivou isto**: o dono do produto foi explícito que o
objetivo é ampliar a *forma de ensinar* o método já fixo, nunca acrescentar
princípio ou conteúdo hermenêutico novo (isso ficaria em
`cavarEDescobrirPrinciples.ts`, e não foi tocado aqui). Mudança de
comportamento/didática é território técnico normal; mudança de conteúdo
doutrinário não é - ver regra no topo desta skill.

**Ressalva importante identificada durante a revisão, não presente no
material de origem**: a técnica de Palmer vem de Gadamer, cuja filosofia
hermenêutica rejeita que exista um sentido fixo do autor a ser recuperado
(diálogo como processo sem fim, não convergente). Usar só a *forma*
dialética dele ("fortalecer antes de desafiar") sem essa premissa exigiu um
parágrafo de trava explícito logo após a lista de técnicas ("não adote a
postura de que a interpretação é um processo sem fim...") - remover essa
trava se a seção for editada no futuro reintroduziria uma tensão doutrinária
real com Ideia Principal/Intento Transformador (P6).

Duas correções pontuais feitas junto, achadas ao comparar com um rascunho
externo: a lista de princípios no próprio `SYSTEM_INSTRUCTION` não numerava
"Estude o Sermão" como 9º princípio (só ia até 8, "Texto e Estrutura"),
mesmo esse princípio já existindo em `cavarEDescobrirPrinciples.ts` desde
2026-08-22; e a calibração de nível (iniciante/intermediário/avançado) era
vaga demais, agora amarrada a conteúdo concreto por nível.

## JWT — verificação real de assinatura, resolvido em 2026-08-17

`verifyFirebaseIdToken` (`api/gemini.ts`) substitui o antigo
`decodeJwtPayload` (que só fazia base64-decode do payload, sem checar nada
criptográfico). Agora usa `jose` (`createRemoteJWKSet` + `jwtVerify`)
contra as chaves públicas do Google
(`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`),
validando assinatura RS256, `issuer`
(`https://securetoken.google.com/<projectId>`), `audience` (`projectId`) e
expiração. **Não precisa de service account** — o `projectId` usado vem de
`firebase-applet-config.json` (já público). `jose` é dependência direta do
projeto (antes só transitiva via `firebase-admin` → `jwks-rsa`).

Testes em `src/test/geminiSecurity.test.ts` mockam `jose` (`vi.mock('jose',
...)`) para testar a lógica de `verifyFirebaseIdToken`/`getIdentity` sem
rede real — qualquer mudança nessa função deve manter esses testes
passando.

## Frontend (`src/services/geminiService.ts`)

Chama `fetch('/api/gemini')` com o Bearer token (ou header de convidado);
retenta **uma vez** com refresh forçado do token em 401/403. Não adicionar
um segundo mecanismo de retry — esse já é o padrão.
