# Modelo de Dados - O Hermeneuta

> Escrito em 2026-08-17, com base em `src/types.ts` e `firestore.rules`
> (fontes de verdade reais - este documento é leitura, não especificação).
> Detalhe de regra por regra, helpers e limites exatos: skill
> `padrao-firestore-rules`. Aqui é a visão de conjunto das coleções e como
> se relacionam.

## Coleções

```
users/{userId}
studies/{studyId}
groups/{groupId}
  └─ members/{userId}
  └─ messages/{messageId}
academyProgress/{userId}
aiUsage/{usageId}
```

Todas no banco Firestore **não-default**
(`firestoreDatabaseId: ai-studio-9096b2f1-8519-43e9-a451-732bdd171b00`, ver
`firebase-applet-config.json`) do projeto `gen-lang-client-0860065051`.

## `users/{userId}`

Perfil do usuário. `userId` é o próprio UID do Firebase Auth (ou, para
contas pré-registradas por um admin antes do primeiro login, um UID
temporário substituído no primeiro login real - ver `AuthContext.tsx`).

```ts
{
  email: string,
  role: 'guest' | 'student' | 'professor' | 'monitor' | 'contributor' | 'admin',
  isApproved: boolean,
  displayName?: string,
  photoURL?: string,
  phone?: string,
  age?: number,           // 1-120
  denomination?: string,
  isContributor?: boolean,
  createdAt: timestamp,
  updatedAt?: timestamp,
}
```

`role`/`isApproved` só podem ser alterados por um admin (imutáveis num
update feito pelo próprio dono). `usePermissions.ts` normaliza esses 6
papéis em 4 níveis de permissão no cliente:
`guest → student → contributor (agrega professor/monitor) → admin`.

## `studies/{studyId}`

O objeto central do app - um estudo bíblico passando pelas 8 etapas do
método Cavar & Descobrir. Dono é `userId` (imutável).

```ts
{
  userId: string,
  title: string,                    // ≤ 200 chars
  status: 'draft' | 'completed',
  bibleSelection?: {
    book: string,                   // ≤ 80 chars
    chapter: number,                // ≥ 1
    verseStart: number,             // ≥ 1
    verseEnd: number,               // ≥ verseStart
    translation: string,            // ≤ 16 chars (NVI, NAA, ARA, ARC, NVT, NTLH)
    text: string,                   // ≤ 50000 chars
  },
  observations?: string,            // ≤ 50000 chars - Etapa 2
  questionsText?: string,           // ≤ 50000 chars - Etapa 3
  questions?: Question[],           // planejado no blueprint original, não usado no MVP (ver abaixo)
  genre?: string,                   // ≤ 100 chars - Etapa 4
  structure?: string,               // ≤ 10000 chars - Etapa 4
  contextText?: string,             // ≤ 50000 chars - Etapa 5
  context?: ContextAnalysis,        // planejado no blueprint original, não usado no MVP
  mainIdea?: string,                // ≤ 1000 chars - Etapa 6
  transformingIntent?: string,      // ≤ 1000 chars - Etapa 7
  sermonOutline?: string,           // ≤ 50000 chars - Etapa 8
  detailedSermon?: string,          // ≤ 100000 chars - Etapa 8
  createdAt: number,                // timestamp, imutável após criar
  updatedAt: number,                // timestamp, deve ser sempre o momento da escrita
}
```

**Divergência conhecida, não é bug**: `questions`/`context` foram
desenhados como objetos estruturados em `firebase-blueprint.json` (artefato
de uma ferramenta de design, não código), mas o MVP real simplificou para
texto livre (`questionsText`/`contextText`). `firestore.rules` e
`types.ts` já refletem a versão real (texto livre) - o blueprint é o
documento desatualizado, não o código.

**Estudos de convidado local nunca aparecem aqui** - ficam só em
`localStorage` (`guest_study_{id}`), o `StudyContext` decide isso conforme
`user.isGuest`/id começando com `local_`.

## `groups/{groupId}` (+ `members`, `messages`)

Salas virtuais/turmas. Dono é `professorId`.

```ts
groups/{groupId}: { name: string (≤100), professorId: string, createdAt }
groups/{groupId}/members/{userId}: { userId, groupId, groupName (≤100), professorId, role: 'student'|'monitor'|'professor' }
groups/{groupId}/messages/{messageId}: { senderId, ... }
```

Leitura/escrita exige `isApproved()` (ver `padrao-firestore-rules`) - e
**não** funciona para convidado local, que nunca tem sessão real do
Firebase Auth (ver gap documentado em `precedencia-e-gaps`, item 16, sobre
`ChatOverlay.tsx` tentando essa chamada mesmo assim para convidados).

## `academyProgress/{userId}`

Progresso do usuário nas lições/quiz da "Academia" (conteúdo estático em
`ACADEMY_CONTENT`, `src/services/academyService.ts` - não é uma coleção
própria, só o progresso é persistido).

## `aiUsage/{usageId}`

Duplo propósito, mesma coleção/schema:

1. **Telemetria client-side** (`aiUsageService.ts`): contagem de uso do
   Instrutor de IA por estudo, id `{uid}_{studyId}`.
2. **Quota server-side** (Fase 1 de segurança, `api/gemini.ts`): contador
   diário global por usuário, id reservado `{uid}_daily_{yyyy-mm-dd}` com
   `studyId: '__daily_quota__'` - reaproveita o mesmo schema/regra em vez de
   criar uma coleção nova (ver skill `padrao-prompt-ia`).

```ts
{ uid: string, studyId: string, queryCount: number (só cresce), lastQueryAt: timestamp (== request.time) }
```

## Relações entre coleções (visão de grafo)

```
users ──1:N── studies            (userId)
users ──1:N── groups (como professor)  (professorId)
groups ──1:N── members           (subcoleção)
groups ──1:N── messages          (subcoleção)
users ──1:1── academyProgress    (mesmo id do userId)
users ──1:N── aiUsage            (uid, um doc por estudo OU um doc "daily" por dia)
```

Não há nenhuma relação modelada entre `studies` e `groups`/`academyProgress`
- são três áreas do produto independentes que só compartilham o dono
(`userId`/`uid`/`professorId`).
