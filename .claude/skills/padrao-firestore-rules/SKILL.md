---
name: padrao-firestore-rules
description: Use esta skill sempre que alterar firestore.rules, o modelo de dados em src/types.ts, ou qualquer service que leia/escreva no Firestore do Hermeneuta. Cobre as coleções reais, os limites de campo já validados nas regras, e as armadilhas de segurança já conhecidas (JWT sem verificação de assinatura, super-admin hardcoded). Consulte antes de escrever qualquer `allow` novo.
---

# Padrão de Firestore e regras — O Hermeneuta

Fonte: `firestore.rules`, `firebase-blueprint.json`, `src/types.ts`
(2026-08-16). É zero-trust por padrão (`allow read, write: if false` no
document raiz) — qualquer coleção nova precisa de regra explícita ou fica
inacessível.

## Coleções reais

| Coleção | Dono do dado | Observação |
|---|---|---|
| `users/{userId}` | O próprio usuário (+ admin) | `role`/`isApproved` só admin muda |
| `studies/{studyId}` | `userId` do dono | Único, dono lê/escreve; `list` exige filtro por `userId` |
| `groups/{groupId}` | `professorId` | + subcoleções `members/{userId}`, `messages/{messageId}` |
| `academyProgress/{userId}` | O próprio usuário | Exige `isApproved()` |
| `aiUsage/{usageId}` | `uid` do documento | Contador só pode crescer (`queryCount >= existing().queryCount`) |

## Helpers já definidos (reusar, não recriar)

```
isSignedIn()       — request.auth != null
isSuperAdminEmail() — request.auth.token.email == 'escoladetradersead@gmail.com'
isAdmin()           — isSuperAdminEmail() OU users/{uid}.role == 'admin'
isApproved()        — isSuperAdminEmail() OU users/{uid}.isApproved == true
isOwner(userId)      — request.auth.uid == userId
isValidId(id)        — string, ≤128 chars, regex ^[a-zA-Z0-9_-]+$
isMember(groupId)    — existe groups/{groupId}/members/{uid}
isProfessorOf(groupId) — groups/{groupId}.professorId == uid
```

Toda checagem de papel/aprovação em uma regra nova deve usar esses helpers —
não escrever `get(...).data.role == 'admin'` inline de novo.

## Limites de campo já validados (`isValidStudy`)

```
title             ≤ 200
observations      ≤ 50000
questionsText     ≤ 50000
genre             ≤ 100
structure         ≤ 10000
contextText       ≤ 50000
mainIdea          ≤ 1000
transformingIntent ≤ 1000
sermonOutline     ≤ 50000
detailedSermon    ≤ 100000
bibleSelection.book ≤ 80, .translation ≤ 16, .text ≤ 50000
```

Qualquer campo novo em `Study` (`src/types.ts`) precisa de um limite
equivalente em `isValidStudy` antes de ir para produção — sem isso a coleção
fica aberta a documentos arbitrariamente grandes (poisoning). Escolher o
limite pelo campo mais parecido já na tabela (texto curto ~100-1000, texto
longo ~10000-50000, texto muito longo como sermão detalhado ~100000).

## Anti-spoofing já em produção (não remover)

- `studies`: `createdAt` é imutável no update
  (`incoming().get('createdAt', existing().createdAt) == existing().createdAt`)
  e `updatedAt` **deve** ser exatamente `request.time` — impede timestamp
  forjado pelo cliente.
- `users`: `role` e `isApproved` são imutáveis por update de não-admin — só
  `isAdmin()` pode promovê-los.
- `aiUsage`: `queryCount` só pode subir, nunca descer, no update.

Ao adicionar um campo que registra "quando" algo aconteceu, seguir o mesmo
padrão de `updatedAt == request.time` — nunca confiar em timestamp vindo do
cliente.

## Gaps de segurança — histórico

1. ~~JWT sem verificação de assinatura~~ — **resolvido em 2026-08-17**.
   `api/gemini.ts::verifyFirebaseIdToken` agora verifica a assinatura RS256
   de verdade via `jose` contra o JWKS público do Google, sem precisar de
   `firebase-admin`/service account. Detalhe completo em `padrao-prompt-ia`.
   `firebase-admin` continua instalado e sem uso — não foi o caminho
   escolhido (a verificação por JWKS público é mais simples de rodar no
   Vercel sem gerenciar credencial de serviço), mas segue reservado caso
   uma necessidade futura de Firestore Admin (bypass de regra) apareça.
2. ~~Super-admin hardcoded em 3 lugares~~ — **parcialmente resolvido em
   2026-08-17**. Era na verdade 7 arquivos no cliente (não 3 — número
   corrigido nesta revisão), todos agora centralizados em
   `src/config/superAdmin.ts` (`SUPER_ADMIN_EMAIL`,
   `isSuperAdminEmail(email)`). `firestore.rules` (`isSuperAdminEmail()`
   da regra, função própria da linguagem) **continua com sua própria
   cópia** — não dá pra eliminar sem custom claims via Admin SDK (exige
   credencial de serviço, fora de escopo desta fase). Se o e-mail mudar,
   ainda são 2 lugares a tocar: `src/config/superAdmin.ts` e
   `firestore.rules`, não mais 7+1.
3. **`firestore.rules.test.ts` nunca existiu** apesar de `security_spec.md`
   mencionar a intenção de criar — ainda em aberto, ver skill
   `padrao-teste`.

## Regra de ouro

Fail closed: nunca escrever `allow write: if true` ou uma condição frouxa
como atalho temporário. Se a regra de acesso de uma coleção/campo novo não
está clara, **parar e perguntar** (ver `arquiteto-de-produto`) em vez de
copiar por analogia de `studies`/`users` sem confirmação — o padrão de acesso
pode ser diferente.
