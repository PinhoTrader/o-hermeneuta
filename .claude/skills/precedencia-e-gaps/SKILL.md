---
name: precedencia-e-gaps
description: Use esta skill sempre que houver dúvida sobre qual documento vale em caso de conflito, ou quando esbarrar em uma das lacunas conhecidas do Hermeneuta (documentação desatualizada, dependência morta, arquivo estranho na raiz). Consulte antes de qualquer mudança estrutural e sempre que dois arquivos de contexto parecerem se contradizer.
---

# Precedência entre documentos e gaps conhecidos — O Hermeneuta

## Ordem de precedência

```
CLAUDE.md → AGENTS.md → skill relevante em .claude/skills/ → README.md
```

`README.md` é material voltado ao usuário humano/GitHub, não fonte de
verdade técnica — se ele divergir de `CLAUDE.md` ou de uma skill, os
últimos vencem. Nenhum dos documentos de `doc/` tem prioridade sobre
`CLAUDE.md`/`AGENTS.md`/skills — ver gaps abaixo, `doc/` está desatualizado
em pontos concretos.

## Gaps conhecidos — não resolver sozinho, sinalizar ao usuário

Lista consolidada do raio-X inicial (2026-08-16). Cada item aqui é uma
decisão de produto/engenharia ainda em aberto, não um bug óbvio para
corrigir de improviso.

1. **`doc/stack/03_infraestrutura_deploy.md` descreve Cloud Run/Google AI
   Studio Build** como hospedagem — a stack real é Vercel (`vercel.json` +
   `api/gemini.ts` no formato serverless da Vercel). Não seguir esse
   documento para decisão de infra; ele precisa ser reescrito ou removido,
   mas isso é decisão do usuário, não algo para sobrescrever silenciosamente.
2. **`firebase-admin` e `express`** estão em `dependencies` do
   `package.json` sem nenhuma referência em `src/`/`api/`. Remover é seguro
   tecnicamente, mas confirmar com o usuário antes (podem ser plano para uso
   futuro — `firebase-admin` inclusive resolveria o gap de JWT sem
   verificação, ver `padrao-firestore-rules`).
3. **`handleFirestoreError`/`OperationType` duplicados** em 4 arquivos de
   service (ver `padrao-componente-frontend`) — consolidar é refactor de
   baixo risco, mas tocar múltiplos arquivos de uma vez; fazer como mudança
   isolada, não misturada com uma feature nova.
4. **`er.name P1n40`** na raiz do repositório — arquivo lixo versionado por
   acidente (parece saída truncada de `git config user.name`, commit
   `1e9a3aa "Teste de autor"`). Sem função no app. Seguro remover, mas
   confirmar com o usuário antes de apagar histórico de commit relacionado.
5. **Nomenclatura dupla**: código/README chamam o produto de "O Hermeneuta";
   `security_spec.md` e `doc/qa/*`/`doc/stack/*` chamam de "Cavar &
   Descobrir" (nome do método, não do produto) nos títulos. Não "corrigir"
   isso automaticamente — pode ser intencional (docs de uma fase de naming
   anterior).
6. **`doc/qa/QA_CHECKLIST.md`** todo com checkbox `[ ]` — não há evidência
   de execução. Não reportar itens como "testados" com base nesse arquivo.
7. **`GEMINI_API_KEY` ausente do `.env.local` atual** — Instrutor de IA
   provavelmente não funciona em `npm run dev` local até o usuário
   configurar a chave (`vercel env pull` não traz segredos re-encriptados
   utilizáveis localmente sem a chave real).
8. ~~Rate limit do Instrutor de IA é in-memory~~ — **resolvido em
   2026-08-17**, ver `padrao-prompt-ia`. Usuários autenticados agora têm
   quota persistida no Firestore (coleção `aiUsage`, doc reservado
   `{uid}_daily_{data}`); convidados continuam em memória por não terem
   identidade durável (limitação aceita, documentada, não é regressão).
9. **Divergência de schema `Study`**: `questions`/`context` foram desenhados
   como objetos estruturados em `firebase-blueprint.json`, mas o MVP real
   usa texto livre (`questionsText`, `contextText`) — `firestore.rules` e
   `types.ts` já refletem a versão texto-livre (fonte da verdade), o
   blueprint é o documento desatualizado.
10. ~~JWT decodificado sem verificar assinatura~~ em `api/gemini.ts` —
    **resolvido em 2026-08-17**, ver `padrao-prompt-ia`. Verificação real de
    assinatura RS256 via `jose` + JWKS público do Google, sem precisar de
    service account.
11. ~~Super-admin hardcoded em 3+ lugares~~ — **resolvido em 2026-08-17**
    para o lado do cliente: centralizado em `src/config/superAdmin.ts`
    (eram na verdade 7 arquivos, não 3 — número corrigido nesta revisão).
    `firestore.rules` continua com sua própria cópia por ser linguagem
    própria (não importa TS) — ver `padrao-firestore-rules`. Eliminar essa
    última cópia exigiria custom claims via Firebase Admin SDK (credencial
    de serviço), fora do escopo desta fase.
12. **`firestore.rules.test.ts` nunca criado** apesar de intenção declarada
    em `security_spec.md` — ver `padrao-teste`.
13. **Só existe `doc/stack/03_...md`**, sem `01_`/`02_` — sugere documentos
    de arquitetura/modelo de dados que nunca foram escritos ou foram
    removidos. Não presumir que existem em outro lugar.

## Como um agente deve reagir a um gap desta lista

1. Se a tarefa pedida esbarra num gap listado, citar o número do gap e
   perguntar ao usuário como proceder — nunca assumir a resposta mais
   "óbvia" tecnicamente sem confirmação, porque vários destes têm
   componente de decisão de produto (não só técnica).
2. Se um gap for resolvido numa sessão futura, atualizar esta skill
   marcando como resolvido (seguir o padrão do Cactos-Hub:
   `~~texto do gap~~ — resolvido em <data>, ver <arquivo>`), não apagar a
   linha — mantém histórico de por que a decisão foi tomada.
