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

1. ~~`doc/stack/03_infraestrutura_deploy.md` descreve Cloud Run/Google AI
   Studio Build~~ — **resolvido em 2026-08-17**, reescrito para refletir a
   stack real (Vercel + Firestore não-default + deploy automático via
   Git↔Vercel).
2. **`firebase-admin` e `express`** estão em `dependencies` do
   `package.json` sem nenhuma referência em `src/`/`api/`. Remover é seguro
   tecnicamente, mas confirmar com o usuário antes (podem ser plano para uso
   futuro — `firebase-admin` inclusive resolveria o gap de JWT sem
   verificação, ver `padrao-firestore-rules`).
3. ~~`handleFirestoreError`/`OperationType` duplicados~~ em 4 arquivos de
   service — **resolvido em 2026-08-17**. `adminService.ts`,
   `groupService.ts` e `academyService.ts` agora importam de
   `src/lib/firebase.ts` em vez de redeclarar; ver `padrao-componente-frontend`.
4. **`er.name P1n40`** na raiz do repositório — arquivo lixo versionado por
   acidente (parece saída truncada de `git config user.name`, commit
   `1e9a3aa "Teste de autor"`). Sem função no app. Seguro remover, mas
   confirmar com o usuário antes de apagar histórico de commit relacionado.
5. ~~Nomenclatura dupla~~ — **resolvido em 2026-08-17**. Confirmado com o
   usuário que não era intencional; títulos de `security_spec.md`,
   `doc/qa/QA_CHECKLIST.md` e `doc/qa/VALIDACAO_FINAL.md` padronizados para
   "O Hermeneuta". Menções a "Cavar & Descobrir" no corpo do texto (como
   nome do método, não do produto) foram mantidas — são uso correto.
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
12. ~~`firestore.rules.test.ts` nunca criado~~ — **resolvido em 2026-08-17**,
    ver `padrao-teste`. Exigiu instalar Java (Temurin 21, via winget) e
    `firebase-tools` nesta máquina — registrado porque é um requisito de
    ambiente, não só de `npm install`, para quem for rodar `npm run
    test:rules` numa máquina nova.
14. **Novo, achado ao escrever os testes de regra**: `isSuperAdminEmail()`
    em `firestore.rules` usa `request.auth.token.email` (acesso direto) em
    vez de `.get('email', '')` — um token sem a claim `email` faz a regra
    lançar erro de avaliação em vez de negar limpo. Ver `padrao-firestore-rules`.
16. ~~Convidado local disparava chamada ao Firestore sem sessão real~~ —
    **resolvido em 2026-08-17**. `getGuestProfile()`
    (`src/context/AuthContext.tsx`) define `isApproved: true` no perfil
    client-side de qualquer convidado local (`isGuest`), de propósito, pra
    liberar itens de navegação. Três lugares usavam esse `isApproved` (ou só
    `profile?.uid`) pra decidir se consultavam o Firestore de verdade, sem
    excluir `user?.isGuest` — e convidado local nunca tem sessão do Firebase
    Auth, então a chamada sempre era negada por `firestore.rules`:
    - `ChatOverlay.tsx` — lista de conversas ficava vazia (sem cair no
      fallback `[AI_GROUP]`), erro não tratado (confirmado ao vivo, capturado
      via Playwright).
    - `AcademyPage.tsx` — **o mais grave**: sem `.catch()`, a página ficava
      presa em "Carregando..." pra sempre pro convidado (confirmado ao vivo).
    - `GroupsPage.tsx` — mesmo padrão, sem `.catch()`.

    Fix: as três checagens agora excluem `!user?.isGuest` explicitamente, e
    as três chamadas ganharam `.catch()` com fallback seguro. Validado com
    smoke test real (Playwright + Chromium) antes e depois da correção.
15. **Novo, achado na Fase 3 (UX)**: `src/pages/GroupsPage.tsx` tem, no seu
    próprio `handleSendMessage` (branch de chat com IA, ~linha 195), o mesmo
    padrão de erro silencioso que foi corrigido em `StudyStep.tsx` e
    `ChatOverlay.tsx` (catch só com `console.error`, sem avisar o usuário).
    Ficou fora do escopo pedido na Fase 3 (só `ChatOverlay.tsx` foi
    mencionado) — mesmo fix (reaproveitar/adicionar estado de erro visível)
    se aplica aqui quando alguém for tocar nesse arquivo.
13. ~~Só existia `doc/stack/03_...md`, sem `01_`/`02_`~~ — **resolvido em
    2026-08-17**: `01_arquitetura.md` e `02_modelo_de_dados.md` criados.

## Como um agente deve reagir a um gap desta lista

1. Se a tarefa pedida esbarra num gap listado, citar o número do gap e
   perguntar ao usuário como proceder — nunca assumir a resposta mais
   "óbvia" tecnicamente sem confirmação, porque vários destes têm
   componente de decisão de produto (não só técnica).
2. Se um gap for resolvido numa sessão futura, atualizar esta skill
   marcando como resolvido (seguir o padrão do Cactos-Hub:
   `~~texto do gap~~ — resolvido em <data>, ver <arquivo>`), não apagar a
   linha — mantém histórico de por que a decisão foi tomada.
