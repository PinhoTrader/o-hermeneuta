import { GoogleGenAI } from '@google/genai';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ExperienceLevel, Study } from '../src/types';
import firebaseConfig from '../firebase-applet-config.json';
import { getMethodContextForStage, getFullMethodText } from './cavarEDescobrirPrinciples';
import { getGenreHint } from './bibleBookGenres';

type ChatHistoryItem = {
  role: 'user' | 'model';
  content: string;
};

type GeminiAction = 'stageFeedback' | 'askInstructor' | 'generalChat';

type GeminiRequestBody =
  | {
      action: 'stageFeedback';
      payload: {
        stage: string;
        study: Study;
        experienceLevel?: ExperienceLevel;
      };
    }
  | {
      action: 'askInstructor';
      payload: {
        question: string;
        study: Study;
        experienceLevel?: ExperienceLevel;
      };
    }
  | {
      action: 'generalChat';
      payload: {
        message: string;
        history?: ChatHistoryItem[];
      };
    };

type VercelRequest = IncomingMessage & {
  method?: string;
  body?: unknown;
  headers: IncomingMessage['headers'] & {
    authorization?: string;
    'x-hermeneuta-guest-id'?: string;
  };
};

export type RequestIdentity =
  | { id: string; kind: 'guest'; dailyLimit: number }
  | { id: string; kind: 'user'; dailyLimit: number; uid: string; idToken: string };

type IdentityResult =
  | { identity: RequestIdentity; error?: never }
  | { identity: null; error: string };

type MentorDeviation = 'legalismo' | 'liberalismo/permissividade' | null;
type MentorSeverity = 'leve' | 'moderado' | 'recorrente' | null;
type MentorMethodStep =
  | 'linha'
  | 'boas_perguntas'
  | 'genero'
  | 'estrutura'
  | 'contexto'
  | 'ideia_principal'
  | 'intento_transformador'
  | 'teologia_biblica'
  | 'texto_estrutura'
  | 'rota_direta'
  | null;
type MentorBase = 'texto_do_usuario' | 'texto_biblico_do_contexto' | 'ambos';
type MentorLevel = ExperienceLevel | null;

type MentorStructuredResponse = {
  desvioDetectado: MentorDeviation;
  gravidade: MentorSeverity;
  acertoParcial: string | null;
  feedback: string;
  proximaPergunta: string;
  dica?: string | null;
  etapaMetodo: MentorMethodStep;
  baseUsada: MentorBase;
  // Nível de proficiência que o Instrutor percebe pela interação atual - uso
  // interno só (nunca aparece em formatMentorText). Pode divergir do nível
  // autodeclarado enviado no contexto; quando divergir, o servidor ajusta
  // UserProfile.experienceLevel (ver updatePerceivedLevel).
  nivelPercebido: MentorLevel;
};

const modelName = 'gemini-3-flash-preview';
const MISSING_API_KEY_MESSAGE =
  'O Instrutor de IA ainda não está configurado neste ambiente. Verifique a GEMINI_API_KEY no servidor.';
const GENERIC_ERROR_MESSAGE = 'Desculpe, estou com dificuldades para processar sua mensagem agora.';
const QUOTA_ERROR_MESSAGE = 'Você atingiu o limite diário do Instrutor de IA. Tente novamente amanhã.';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_FIELD_LENGTH = 12000;
const MAX_HISTORY_ITEMS = 6;
const MAX_GUEST_REQUESTS_PER_DAY = 5;
// TODO(custo): estes 2 limites foram escolhidos sem amostra real de uso.
// Assim que houver volume de usuários ativos por um período (ex.: primeiro mês
// com adoção real), reavaliar contra o custo real da API Gemini nesse período
// (console do Google AI Studio / Cloud Billing) — hoje o Gemini é o candidato
// mais provável a virar o maior custo do projeto, não o Firebase.
const MAX_USER_REQUESTS_PER_DAY = 30;

// Sentinel studyId reserved for the server-side daily quota counter, stored in the
// same `aiUsage` collection/schema the client already writes to (see aiUsageService.ts).
// Kept distinct from any real study id so it never collides with per-study telemetry.
const DAILY_QUOTA_STUDY_ID = '__daily_quota__';

const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const FIRESTORE_DOCUMENTS_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${firebaseConfig.firestoreDatabaseId}/documents`;

// Public keys used to verify Firebase Auth ID tokens without the Admin SDK (no
// service account credential needed - see https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library).
const googleIdTokenJwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

// Guests have no durable Firebase identity, so their quota can only live in memory
// for the lifetime of a warm serverless instance. Authenticated users are tracked
// durably in Firestore instead (see reserveUserQuota).
const guestQuotaStore = new Map<string, { count: number; day: string }>();

const SYSTEM_INSTRUCTION = `Você é o Instrutor de IA do aplicativo "O Hermeneuta".

Sua missão é conduzir o usuário no método "Cavar & Descobrir" com fidelidade textual, clareza pedagógica e progressão prática.

MISSÃO CENTRAL
Seu papel não é entregar respostas prontas, mas ajudar o usuário a descobrir, passo a passo, o que o autor bíblico está dizendo, por que está dizendo isso e como isso deve transformar o ouvinte.

Seu compromisso principal é manter o usuário na "Linha":
- não dizer mais do que Deus diz
- não dizer menos do que Deus diz

Dois desvios devem ser observados em toda interação:
1. LEGALISMO: acrescenta ao texto algo que ele não afirma
2. LIBERALISMO / PERMISSIVIDADE: subtrai, relativiza ou enfraquece o que o texto afirma

Nem toda inferência é erro. Aceite inferências somente quando estiverem claramente sustentadas pelo texto, pelo contexto e pelo fluxo do argumento do autor.

FONTES PERMITIDAS
Você só pode basear sua resposta em:
1. texto bíblico disponibilizado pelo aplicativo;
2. referência bíblica informada pelo usuário e recuperada por função interna autorizada do sistema;
3. resposta escrita pelo usuário;
4. etapa atual do método;
5. contexto interno já fornecido pelo aplicativo nesta sessão.

Se faltar informação, peça esclarecimento ao usuário. Nunca preencha lacunas com conteúdo externo.

FONTES PROIBIDAS
É estritamente proibido usar ou reproduzir conteúdo vindo de:
- internet aberta;
- sites;
- blogs;
- Wikipédia;
- comentários bíblicos externos;
- sermões prontos;
- estudos prontos;
- devocionais prontos;
- artigos;
- fóruns;
- vídeos;
- redes sociais;
- apostilas externas não carregadas pelo sistema;
- qualquer material não fornecido explicitamente pelo aplicativo.

Também é proibido:
- citar autores externos não fornecidos pelo sistema;
- trazer "informações históricas" não presentes no contexto recebido;
- inserir curiosidades, tradições ou interpretações importadas de fora;
- entregar respostas que pareçam copiadas de comentário bíblico, estudo pronto ou sermão.

Se o usuário pedir algo que exija conteúdo externo, responda de forma breve informando que você só pode trabalhar com o texto bíblico, a resposta do usuário e o contexto interno do aplicativo.

PRINCÍPIOS DO MÉTODO
Logo após esta instrução, o aplicativo anexará o TEXTO OFICIAL dos princípios do livreto "Cavar & Descobrir" (Edição 5.0, WordPartners) relevantes à etapa atual - essa é a fonte primária e mais autoritativa sobre o método, mais confiável que seu próprio conhecimento prévio sobre ele. Use-a para orientar sua resposta:
1. Linha: o usuário está dizendo apenas o que o texto diz?
2. Boas Perguntas: ele está apenas nas perguntas básicas ou já avançou para perguntas vigorosas?
3. Gênero: o usuário percebeu o tipo de texto, o tom do autor e o efeito pretendido no leitor?
4. Estrutura: o usuário identificou unidades de pensamento, progressão, contraste, repetição, clímax, conexão ou mudança de direção?
5. Instruções de Viagem: o usuário tentou fazer aplicação direta sem passar pelo contexto original? Se sim, corrija isso como "Rota Direta" (etapaMetodo: rota_direta).
6. Ideia Principal e Intento Transformador: o usuário consegue dizer o que o autor está dizendo e por que o autor está dizendo isso?
7. Teologia Bíblica: quando houver base suficiente, ajude o usuário a enxergar como a passagem se conecta à história da redenção e ao foco e cumprimento em Cristo. Nunca force essa conexão.
8. Texto e Estrutura ("o texto é rei"): o usuário está deixando o texto bíblico questionar e moldar suas próprias estruturas mentais/teológicas prévias, em vez de forçar o texto a caber nelas?

CONSCIÊNCIA DE GÊNERO NAS ETAPAS ANTERIORES A "GÊNERO & ESTILO"
O contexto que você recebe pode incluir uma "dica de gênero" de referência para o livro selecionado. Use-a apenas para calibrar internamente que tipo de observação ou pergunta puxar do usuário nas etapas de Observação, Perguntas e Contexto (ex: numa poesia, direcione a atenção a paralelismo e imagens; numa epístola, a fluxo lógico e verdade proposicional; numa narrativa, a personagens, cenas e narrador). NUNCA declare ou revele o gênero ao usuário antes de ele chegar à etapa "Gênero & Estilo" - identificar o gênero é parte do que ele deve descobrir sozinho nessa etapa. Essa dica é uma classificação a nível de livro, não uma verdade absoluta para o trecho exato - se o texto selecionado claramente destoar dela, confie na sua própria leitura do texto.

COMPORTAMENTO PEDAGÓGICO
Você é um mentor socrático, firme e encorajador.
- pergunte mais do que afirme;
- nunca entregue a interpretação final pronta;
- valide acertos parciais;
- corrija desvios com clareza e mansidão;
- use linguagem natural, clara e sem jargão desnecessário;
- use os termos do método quando ajudarem: "Linha", "Pergunta Vigorosa", "Unidade de Pensamento", "Rota Direta".

Adapte-se ao nível do usuário:
- iniciante: perguntas mais simples e guiadas;
- intermediário: perguntas analíticas;
- avançado: perguntas mais estruturais e críticas.

O contexto pode incluir um "nível autodeclarado" pelo usuário - use-o como ponto de partida. Mas calibre pelo que você observa na interação atual: se as respostas do usuário demonstrarem um nível diferente do autodeclarado (mais simples ou mais sofisticado), ajuste sua abordagem em tempo real e reporte no campo "nivelPercebido" o nível que você percebe agora, mesmo que divirja do autodeclarado. Se não houver sinal suficiente para perceber isso com confiança, reporte null. Esse campo é só para uso interno do sistema - nunca mencione nível, autodeclarado ou percebido, na sua resposta ao usuário.

Se o usuário travar, simplifique a pergunta e ofereça uma única pista curta, sem dar a resposta completa.
Se o usuário repetir o mesmo erro, mude a abordagem, peça evidência textual e convide-o a mostrar onde isso aparece no texto.

USO DO TEXTO BÍBLICO
- Baseie seu feedback no texto bíblico e na resposta do usuário.
- Se a referência bíblica não estiver clara, peça a referência antes de prosseguir.
- Se o sistema já tiver fornecido a passagem no contexto da conversa, use essa passagem.
- Se houver função interna autorizada para recuperar o versículo, use apenas essa função.
- Nunca use busca na web.
- Nunca complemente com material externo.
- Não corrija tradução, a menos que isso seja solicitado.

REGRAS DE RESPOSTA
- Responda sempre em português do Brasil.
- Nunca faça mais de 1 pergunta principal por resposta.
- Seja breve: prefira respostas entre 80 e 220 palavras.
- Se o usuário disser apenas "ok", "entendi" ou "próximo", responda no campo "feedback" apenas: "✅ Continue quando estiver pronto."
- Se o usuário enviar texto excessivamente longo, peça que resuma a parte principal a ser analisada.

FORMATO DE SAÍDA OBRIGATÓRIO
Responda sempre em JSON válido, sem Markdown, sem bloco de código e sem texto fora do JSON:
{
  "desvioDetectado": "legalismo" | "liberalismo/permissividade" | null,
  "gravidade": "leve" | "moderado" | "recorrente" | null,
  "acertoParcial": "string curta ou null",
  "feedback": "resposta clara, natural e encorajadora",
  "proximaPergunta": "uma única pergunta vigorosa e objetiva, ou string vazia quando não houver pergunta",
  "dica": "opcional; use apenas se o usuário demonstrar dificuldade",
  "etapaMetodo": "linha" | "boas_perguntas" | "genero" | "estrutura" | "contexto" | "ideia_principal" | "intento_transformador" | "teologia_biblica" | "texto_estrutura" | "rota_direta" | null,
  "baseUsada": "texto_do_usuario" | "texto_biblico_do_contexto" | "ambos",
  "nivelPercebido": "iniciante" | "intermediario" | "avancado" | null
}

LIMITES IMPORTANTES
- Nunca entregue sermão pronto.
- Nunca entregue interpretação final pronta.
- Nunca afirme além do que o texto sustenta.
- Nunca substitua observação cuidadosa por respostas genéricas.
- Nunca permita rota direta da aplicação sem contexto.
- Nunca force Cristo no texto de modo artificial.
- Nunca use conteúdo da internet aberta, mesmo que pareça útil.
- Nunca use comentários, sermões, artigos ou estudos externos como base da resposta.

Se houver insuficiência de dados, peça mais contexto. Não invente. Não complete com conhecimento externo.
`;

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  aiClient ??= new GoogleGenAI({ apiKey });
  return aiClient;
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readBody(req: VercelRequest) {
  if (req.body) return req.body;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

function isAction(value: unknown): value is GeminiAction {
  return value === 'stageFeedback' || value === 'askInstructor' || value === 'generalChat';
}

function getBearerToken(req: VercelRequest) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
}

export async function verifyFirebaseIdToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, googleIdTokenJwks, {
      issuer: FIREBASE_ISSUER,
      audience: FIREBASE_PROJECT_ID,
      algorithms: ['RS256'],
    });
    const subject = typeof payload.sub === 'string' ? payload.sub : '';
    return subject ? subject : null;
  } catch {
    // Covers: bad signature, expired/not-yet-valid, wrong issuer/audience, malformed token.
    return null;
  }
}

export async function getIdentity(req: VercelRequest): Promise<IdentityResult> {
  const token = getBearerToken(req);
  if (token) {
    const uid = await verifyFirebaseIdToken(token);
    if (!uid) {
      return { identity: null, error: 'Sua sessão expirou. Faça login novamente.' };
    }

    return {
      identity: {
        id: `user:${uid}`,
        kind: 'user',
        dailyLimit: MAX_USER_REQUESTS_PER_DAY,
        uid,
        idToken: token,
      },
    };
  }

  const guestId = req.headers['x-hermeneuta-guest-id'];
  if (typeof guestId === 'string' && /^guest_[a-zA-Z0-9_-]{4,64}$/.test(guestId)) {
    return {
      identity: {
        id: `guest:${guestId}`,
        kind: 'guest',
        dailyLimit: MAX_GUEST_REQUESTS_PER_DAY,
      },
    };
  }

  return { identity: null, error: 'Identificação necessária para usar o Instrutor de IA.' };
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function reserveGuestQuota(identity: Extract<RequestIdentity, { kind: 'guest' }>) {
  const day = getTodayKey();
  const current = guestQuotaStore.get(identity.id);
  const nextCount = current?.day === day ? current.count + 1 : 1;

  if (nextCount > identity.dailyLimit) {
    return false;
  }

  guestQuotaStore.set(identity.id, { count: nextCount, day });
  return true;
}

type FirestoreIntegerField = { integerValue: string };

export async function reserveUserQuota(identity: Extract<RequestIdentity, { kind: 'user' }>): Promise<boolean> {
  const docPath = `aiUsage/${identity.uid}_daily_${getTodayKey()}`;
  const documentName = `projects/${FIREBASE_PROJECT_ID}/databases/${firebaseConfig.firestoreDatabaseId}/documents/${docPath}`;
  const headers = {
    Authorization: `Bearer ${identity.idToken}`,
    'Content-Type': 'application/json',
  };

  const getResponse = await fetch(`${FIRESTORE_DOCUMENTS_URL}/${docPath}`, { headers });

  let currentCount = 0;
  let docExists = false;
  if (getResponse.status === 200) {
    const doc = (await getResponse.json()) as { fields?: { queryCount?: FirestoreIntegerField } };
    currentCount = Number(doc.fields?.queryCount?.integerValue ?? '0');
    docExists = true;
  } else if (getResponse.status !== 404) {
    throw new Error(`Falha ao ler quota no Firestore (status ${getResponse.status}).`);
  }

  if (currentCount + 1 > identity.dailyLimit) {
    return false;
  }

  // Uses the Firestore REST `:commit` write with a REQUEST_TIME transform for
  // lastQueryAt, the wire-level equivalent of the client SDK's serverTimestamp() -
  // required because firestore.rules demands `incoming().lastQueryAt == request.time`.
  const commitResponse = await fetch(`${FIRESTORE_DOCUMENTS_URL}:commit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: documentName,
            fields: {
              uid: { stringValue: identity.uid },
              studyId: { stringValue: DAILY_QUOTA_STUDY_ID },
              queryCount: { integerValue: String(currentCount + 1) },
            },
          },
          updateMask: { fieldPaths: ['uid', 'studyId', 'queryCount'] },
          updateTransforms: [{ fieldPath: 'lastQueryAt', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: docExists ? { exists: true } : { exists: false },
        },
      ],
    }),
  });

  if (!commitResponse.ok) {
    // Most likely a race with a concurrent request from the same user (the
    // `currentDocument.exists` precondition failed) - fail closed either way.
    throw new Error(`Falha ao gravar quota no Firestore (status ${commitResponse.status}).`);
  }

  return true;
}

// Ajuste silencioso de UserProfile.experienceLevel a partir do que o
// Instrutor percebeu na interação atual (nivelPercebido). Efeito colateral
// não-crítico: falha é logada, nunca derruba a resposta principal ao
// usuário. Usa o idToken do próprio usuário (mesmo padrão de
// reserveUserQuota) - Firestore trata a escrita como o próprio dono do
// documento, então as regras existentes já permitem sem afrouxar nada.
// Nota: o app não tem listener em tempo real no perfil (só getDoc no
// login), então o ajuste só é percebido pelo cliente na próxima sessão.
async function updatePerceivedLevel(identity: Extract<RequestIdentity, { kind: 'user' }>, level: ExperienceLevel): Promise<void> {
  const documentName = `projects/${FIREBASE_PROJECT_ID}/databases/${firebaseConfig.firestoreDatabaseId}/documents/users/${identity.uid}`;
  const headers = {
    Authorization: `Bearer ${identity.idToken}`,
    'Content-Type': 'application/json',
  };

  const commitResponse = await fetch(`${FIRESTORE_DOCUMENTS_URL}:commit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: documentName,
            fields: { experienceLevel: { stringValue: level } },
          },
          updateMask: { fieldPaths: ['experienceLevel'] },
          currentDocument: { exists: true },
        },
      ],
    }),
  });

  if (!commitResponse.ok) {
    console.error(`updatePerceivedLevel: falha ao atualizar nível (status ${commitResponse.status}).`);
  }
}

async function reserveQuota(identity: RequestIdentity): Promise<boolean> {
  if (identity.kind === 'guest') {
    return reserveGuestQuota(identity);
  }

  try {
    return await reserveUserQuota(identity);
  } catch (error) {
    // Fail closed: an unreachable/misbehaving Firestore should not turn into
    // unlimited free usage of the Gemini API.
    console.error('Gemini quota (Firestore) error:', error);
    return false;
  }
}

function truncateText(value: unknown, maxLength = MAX_CONTEXT_FIELD_LENGTH) {
  if (typeof value !== 'string') return '';
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function sanitizeStudy(study: Study): Study {
  return {
    ...study,
    title: truncateText(study.title, 200),
    bibleSelection: study.bibleSelection
      ? {
          ...study.bibleSelection,
          book: truncateText(study.bibleSelection.book, 80),
          translation: truncateText(study.bibleSelection.translation, 16),
          text: truncateText(study.bibleSelection.text),
        }
      : undefined,
    observations: truncateText(study.observations),
    questionsText: truncateText(study.questionsText),
    genre: truncateText(study.genre, 100),
    structure: truncateText(study.structure),
    contextText: truncateText(study.contextText),
    mainIdea: truncateText(study.mainIdea, 1000),
    transformingIntent: truncateText(study.transformingIntent, 1000),
    sermonOutline: truncateText(study.sermonOutline),
    detailedSermon: truncateText(study.detailedSermon),
  };
}

function validateBody(body: Partial<GeminiRequestBody>) {
  if (!isAction(body.action) || !body.payload) {
    return 'Pedido inválido para o Instrutor de IA.';
  }

  if (body.action === 'stageFeedback') {
    const payload = body.payload as Partial<Extract<GeminiRequestBody, { action: 'stageFeedback' }>['payload']>;
    if (typeof payload.stage !== 'string' || !payload.stage.trim() || !payload.study) {
      return 'Dados de estudo inválidos para revisão com IA.';
    }
  }

  if (body.action === 'askInstructor') {
    const payload = body.payload as Partial<Extract<GeminiRequestBody, { action: 'askInstructor' }>['payload']>;
    if (typeof payload.question !== 'string' || !payload.question.trim() || payload.question.length > MAX_MESSAGE_LENGTH || !payload.study) {
      return 'Pergunta inválida para o Instrutor de IA.';
    }
  }

  if (body.action === 'generalChat') {
    const payload = body.payload as Partial<Extract<GeminiRequestBody, { action: 'generalChat' }>['payload']>;
    if (typeof payload.message !== 'string' || !payload.message.trim() || payload.message.length > MAX_MESSAGE_LENGTH) {
      return 'Mensagem inválida para o Instrutor de IA.';
    }
  }

  return null;
}

function normalizeExperienceLevel(value: unknown): ExperienceLevel | undefined {
  return isExperienceLevel(value) ? value : undefined;
}

function normalizeBody(body: GeminiRequestBody): GeminiRequestBody {
  if (body.action === 'stageFeedback') {
    return {
      action: body.action,
      payload: {
        stage: truncateText(body.payload.stage, 100),
        study: sanitizeStudy(body.payload.study),
        experienceLevel: normalizeExperienceLevel(body.payload.experienceLevel),
      },
    };
  }

  if (body.action === 'askInstructor') {
    return {
      action: body.action,
      payload: {
        question: truncateText(body.payload.question, MAX_MESSAGE_LENGTH),
        study: sanitizeStudy(body.payload.study),
        experienceLevel: normalizeExperienceLevel(body.payload.experienceLevel),
      },
    };
  }

  return {
    action: body.action,
    payload: {
      message: truncateText(body.payload.message, MAX_MESSAGE_LENGTH),
      history: (body.payload.history || [])
        .slice(-MAX_HISTORY_ITEMS)
        .filter(h => (h.role === 'user' || h.role === 'model') && typeof h.content === 'string')
        .map(h => ({ role: h.role, content: truncateText(h.content, MAX_MESSAGE_LENGTH) })),
    },
  };
}

function getExperienceLevelLine(experienceLevel: ExperienceLevel | undefined) {
  return `Nivel autodeclarado do usuario: ${experienceLevel || 'nao informado'}`;
}

function getStudyContext(study: Study, experienceLevel?: ExperienceLevel) {
  return `
${getGenreHint(study.bibleSelection?.book)}
${getExperienceLevelLine(experienceLevel)}

Texto Biblico: ${study.bibleSelection?.book} ${study.bibleSelection?.chapter}:${study.bibleSelection?.verseStart}-${study.bibleSelection?.verseEnd} (${study.bibleSelection?.translation})
Conteudo do Texto: ${study.bibleSelection?.text}

Progresso Atual:
- Observacoes: <observacoes_usuario>${study.observations || 'Nenhuma'}</observacoes_usuario>
- Perguntas: <perguntas_usuario>${study.questionsText || study.questions?.map(q => q.content).join('; ') || 'Nenhuma'}</perguntas_usuario>
- Genero: <genero_usuario>${study.genre || 'Nao definido'}</genero_usuario>
- Estrutura: <estrutura_usuario>${study.structure || 'Nao definida'}</estrutura_usuario>
- Contexto: <contexto_usuario>${study.contextText || JSON.stringify(study.context) || 'Nao definido'}</contexto_usuario>
- Ideia Principal: <ideia_principal_usuario>${study.mainIdea || 'Nao definida'}</ideia_principal_usuario>
- Intento Transformador: <intento_transformador_usuario>${study.transformingIntent || 'Nao definido'}</intento_transformador_usuario>
- Esboco: <esboco_usuario>${study.sermonOutline || 'Nao definido'}</esboco_usuario>
- Sermao: <sermao_usuario>${study.detailedSermon || 'Nao definido'}</sermao_usuario>
`;
}

function getInstructorContext(study: Study, experienceLevel?: ExperienceLevel) {
  return `
${getGenreHint(study.bibleSelection?.book)}
${getExperienceLevelLine(experienceLevel)}

Texto Biblico: ${study.bibleSelection?.book} ${study.bibleSelection?.chapter}:${study.bibleSelection?.verseStart}-${study.bibleSelection?.verseEnd} (${study.bibleSelection?.translation})
Conteudo do Texto: ${study.bibleSelection?.text}
Observacoes do Usuario: <observacoes_usuario>${study.observations || 'Nenhuma'}</observacoes_usuario>
Perguntas do Usuario: <perguntas_usuario>${study.questionsText || 'Nenhuma'}</perguntas_usuario>
Contexto do Usuario: <contexto_usuario>${study.contextText || 'Nenhum'}</contexto_usuario>
`;
}

function isMentorDeviation(value: unknown): value is MentorDeviation {
  return value === 'legalismo' || value === 'liberalismo/permissividade' || value === null;
}

function isMentorSeverity(value: unknown): value is MentorSeverity {
  return value === 'leve' || value === 'moderado' || value === 'recorrente' || value === null;
}

function isMentorMethodStep(value: unknown): value is MentorMethodStep {
  return (
    value === 'linha' ||
    value === 'boas_perguntas' ||
    value === 'genero' ||
    value === 'estrutura' ||
    value === 'contexto' ||
    value === 'ideia_principal' ||
    value === 'intento_transformador' ||
    value === 'teologia_biblica' ||
    value === 'texto_estrutura' ||
    value === 'rota_direta' ||
    value === null
  );
}

function isMentorBase(value: unknown): value is MentorBase {
  return value === 'texto_do_usuario' || value === 'texto_biblico_do_contexto' || value === 'ambos';
}

function isExperienceLevel(value: unknown): value is ExperienceLevel {
  return value === 'iniciante' || value === 'intermediario' || value === 'avancado';
}

function isMentorLevel(value: unknown): value is MentorLevel {
  return value === null || isExperienceLevel(value);
}

function normalizeOptionalText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function extractJsonObject(rawText: string) {
  const withoutFence = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const start = withoutFence.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < withoutFence.length; index += 1) {
    const char = withoutFence[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) {
      return withoutFence.slice(start, index + 1);
    }
  }

  return null;
}

// Non-blocking style-drift telemetry: the system prompt asks for at most one main
// question and a feedback length in the 80-220 word range. We never reject or alter
// a valid response because of this - it's only logged so drift can be noticed over time.
function checkMentorStyleDrift(parsed: MentorStructuredResponse) {
  const questionMarks = (parsed.proximaPergunta.match(/\?/g) || []).length;
  if (questionMarks > 1) {
    console.warn('parseMentorResponse: proximaPergunta com mais de 1 "?" (possível múltiplas perguntas)');
  }

  const wordCount = parsed.feedback.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 60 || wordCount > 260) {
    console.warn('parseMentorResponse: feedback fora da faixa esperada de palavras (60-260)');
  }
}

function parseMentorResponse(rawText: string): MentorStructuredResponse | null {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) {
    console.error('parseMentorResponse: JSON ausente');
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText) as Partial<MentorStructuredResponse>;
    const feedback = normalizeOptionalText(parsed.feedback);
    const proximaPergunta = typeof parsed.proximaPergunta === 'string' ? parsed.proximaPergunta.trim() : '';

    if (!feedback) {
      console.error('parseMentorResponse: campo feedback ausente/vazio');
      return null;
    }

    if (!isMentorDeviation(parsed.desvioDetectado)) {
      console.error('parseMentorResponse: desvioDetectado inválido');
      return null;
    }

    if (!isMentorSeverity(parsed.gravidade)) {
      console.error('parseMentorResponse: gravidade inválida');
      return null;
    }

    if (!isMentorMethodStep(parsed.etapaMetodo)) {
      console.error('parseMentorResponse: etapaMetodo inválido');
      return null;
    }

    if (!isMentorBase(parsed.baseUsada)) {
      console.error('parseMentorResponse: baseUsada inválido');
      return null;
    }

    // Tolerante a ausência (campo novo, modelo pode ocasionalmente omitir) -
    // trata como "sem sinal" em vez de invalidar a resposta inteira, mas
    // ainda rejeita um valor presente e fora do enum esperado.
    const nivelPercebidoRaw = parsed.nivelPercebido ?? null;
    if (!isMentorLevel(nivelPercebidoRaw)) {
      console.error('parseMentorResponse: nivelPercebido inválido');
      return null;
    }

    const result: MentorStructuredResponse = {
      desvioDetectado: parsed.desvioDetectado,
      gravidade: parsed.gravidade,
      acertoParcial: normalizeOptionalText(parsed.acertoParcial),
      feedback,
      proximaPergunta,
      dica: normalizeOptionalText(parsed.dica),
      etapaMetodo: parsed.etapaMetodo,
      baseUsada: parsed.baseUsada,
      nivelPercebido: nivelPercebidoRaw,
    };

    checkMentorStyleDrift(result);

    return result;
  } catch {
    console.error('parseMentorResponse: falha ao fazer JSON.parse');
    return null;
  }
}

// Common Portuguese refusal prefixes/phrases a model might use instead of following the
// JSON contract. These leak raw and tone-less to the user unless caught here - matched
// case-insensitively against the start of the (fenced-stripped) text.
const REFUSAL_PATTERNS = [
  /^(desculpe|sinto muito|lamento)[,.]? (mas )?(não posso|não consigo)/i,
  /não posso ajudar/i,
  /não consigo ajudar/i,
  /não tenho permissão/i,
  /não tenho a capacidade de/i,
  /como (um |uma )?(modelo de linguagem|ia|inteligência artificial)/i,
  /não é apropriado/i,
  /não posso (fornecer|responder|prosseguir|continuar) com (isso|essa|esse|isto)/i,
  /não estou autorizado/i,
];

function looksLikeModelRefusal(cleaned: string) {
  return REFUSAL_PATTERNS.some(pattern => pattern.test(cleaned));
}

function cleanFallbackText(rawText: string) {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned || cleaned.startsWith('{') || cleaned.includes('"desvioDetectado"') || looksLikeModelRefusal(cleaned)) {
    return GENERIC_ERROR_MESSAGE;
  }

  return cleaned;
}

export function formatMentorText(rawText: string | undefined) {
  if (!rawText) return GENERIC_ERROR_MESSAGE;

  const parsed = parseMentorResponse(rawText);
  if (!parsed) return cleanFallbackText(rawText);

  const hasOnlyContinueMessage =
    parsed.feedback === '✅ Continue quando estiver pronto.' &&
    !parsed.acertoParcial &&
    !parsed.desvioDetectado &&
    !parsed.proximaPergunta &&
    !parsed.dica;

  if (hasOnlyContinueMessage) {
    return parsed.feedback;
  }

  const parts: string[] = [];

  if (parsed.acertoParcial) {
    parts.push(`**Acerto parcial:** ${parsed.acertoParcial}`);
  }

  if (parsed.desvioDetectado) {
    const severity = parsed.gravidade ? ` (${parsed.gravidade})` : '';
    parts.push(`**Atenção à Linha:** percebi um possível desvio de ${parsed.desvioDetectado}${severity}.`);
  }

  parts.push(parsed.feedback);

  if (parsed.proximaPergunta) {
    parts.push(`**Próxima pergunta:** ${parsed.proximaPergunta}`);
  }

  if (parsed.dica) {
    parts.push(`**Dica:** ${parsed.dica}`);
  }

  return parts.join('\n\n');
}

// Se o Instrutor percebeu um nível diferente do autodeclarado, ajusta
// UserProfile.experienceLevel silenciosamente (só para usuário autenticado -
// convidado não tem documento em users/ para atualizar). Nunca lança: uma
// falha aqui não deve derrubar a resposta principal ao usuário.
async function maybeAdjustPerceivedLevel(
  identity: RequestIdentity,
  rawText: string | undefined,
  currentLevel: ExperienceLevel | undefined
) {
  if (identity.kind !== 'user' || !rawText) return;

  const parsed = parseMentorResponse(rawText);
  if (!parsed?.nivelPercebido || parsed.nivelPercebido === currentLevel) return;

  try {
    await updatePerceivedLevel(identity, parsed.nivelPercebido);
  } catch (error) {
    console.error('maybeAdjustPerceivedLevel error:', error);
  }
}

async function generateText(body: GeminiRequestBody, identity: RequestIdentity) {
  const ai = getAiClient();
  if (!ai) {
    return { status: 503, body: { error: MISSING_API_KEY_MESSAGE } };
  }

  if (body.action === 'stageFeedback') {
    const { stage, study, experienceLevel } = body.payload;
    const prompt = `Estou na etapa "${stage}". Analise meu progresso ate agora e me de um feedback sobre como estou indo e o que posso aprofundar nesta etapa, sem me dar a resposta final.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: `${getStudyContext(study, experienceLevel)}\n\n${prompt}` }] }],
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\n${getMethodContextForStage(stage)}`,
        temperature: 0.7,
      },
    });

    await maybeAdjustPerceivedLevel(identity, response.text, experienceLevel);
    return { status: 200, body: { text: formatMentorText(response.text) } };
  }

  if (body.action === 'askInstructor') {
    const { question, study, experienceLevel } = body.payload;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: `${getInstructorContext(study, experienceLevel)}\n\nPergunta do Usuario: <pergunta_usuario>${question}</pergunta_usuario>` }] }],
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\n${getFullMethodText()}`,
        temperature: 0.7,
      },
    });

    await maybeAdjustPerceivedLevel(identity, response.text, experienceLevel);
    return { status: 200, body: { text: formatMentorText(response.text) } };
  }

  const { message, history = [] } = body.payload;
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user' as const, parts: [{ text: `<mensagem_usuario>${message}</mensagem_usuario>` }] },
    ],
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\nInteraja em um chat geral sobre o método, sem entregar interpretação final.\n\n${getFullMethodText()}`,
      temperature: 0.7,
    },
  });

  return { status: 200, body: { text: formatMentorText(response.text) } };
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Método não permitido.' });
    return;
  }

  try {
    const { identity, error: identityError } = await getIdentity(req);
    if (!identity) {
      sendJson(res, 401, { error: identityError });
      return;
    }

    const rawBody = (await readBody(req)) as Partial<GeminiRequestBody>;
    const validationError = validateBody(rawBody);
    if (validationError) {
      sendJson(res, 400, { error: validationError });
      return;
    }

    if (!(await reserveQuota(identity))) {
      sendJson(res, 429, { error: QUOTA_ERROR_MESSAGE });
      return;
    }

    const normalizedBody = normalizeBody(rawBody as GeminiRequestBody);
    const result = await generateText(normalizedBody, identity);
    sendJson(res, result.status, result.body);
  } catch (error) {
    console.error('Gemini API route error:', error);
    sendJson(res, 500, { error: GENERIC_ERROR_MESSAGE });
  }
}
