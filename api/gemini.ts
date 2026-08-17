import { GoogleGenAI } from '@google/genai';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Study } from '../src/types';
import firebaseConfig from '../firebase-applet-config.json';

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
      };
    }
  | {
      action: 'askInstructor';
      payload: {
        question: string;
        study: Study;
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
  | null;
type MentorBase = 'texto_do_usuario' | 'texto_biblico_do_contexto' | 'ambos';

type MentorStructuredResponse = {
  desvioDetectado: MentorDeviation;
  gravidade: MentorSeverity;
  acertoParcial: string | null;
  feedback: string;
  proximaPergunta: string;
  dica?: string | null;
  etapaMetodo: MentorMethodStep;
  baseUsada: MentorBase;
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
Use internamente estes princípios para orientar sua resposta:
1. Linha: o usuário está dizendo apenas o que o texto diz?
2. Boas Perguntas: ele está apenas nas perguntas básicas ou já avançou para perguntas vigorosas?
3. Gênero: o usuário percebeu o tipo de texto, o tom do autor e o efeito pretendido no leitor?
4. Estrutura: o usuário identificou unidades de pensamento, progressão, contraste, repetição, clímax, conexão ou mudança de direção?
5. Instruções de Viagem: o usuário tentou fazer aplicação direta sem passar pelo contexto original? Se sim, corrija isso como "Rota Direta".
6. Ideia Principal e Intento Transformador: o usuário consegue dizer o que o autor está dizendo e por que o autor está dizendo isso?
7. Teologia Bíblica: quando houver base suficiente, ajude o usuário a enxergar como a passagem se conecta à história da redenção e ao foco e cumprimento em Cristo. Nunca force essa conexão.

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
  "etapaMetodo": "linha" | "boas_perguntas" | "genero" | "estrutura" | "contexto" | "ideia_principal" | "intento_transformador" | "teologia_biblica" | null,
  "baseUsada": "texto_do_usuario" | "texto_biblico_do_contexto" | "ambos"
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

function normalizeBody(body: GeminiRequestBody): GeminiRequestBody {
  if (body.action === 'stageFeedback') {
    return {
      action: body.action,
      payload: {
        stage: truncateText(body.payload.stage, 100),
        study: sanitizeStudy(body.payload.study),
      },
    };
  }

  if (body.action === 'askInstructor') {
    return {
      action: body.action,
      payload: {
        question: truncateText(body.payload.question, MAX_MESSAGE_LENGTH),
        study: sanitizeStudy(body.payload.study),
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

function getStudyContext(study: Study) {
  return `
Texto Biblico: ${study.bibleSelection?.book} ${study.bibleSelection?.chapter}:${study.bibleSelection?.verseStart}-${study.bibleSelection?.verseEnd} (${study.bibleSelection?.translation})
Conteudo do Texto: ${study.bibleSelection?.text}

Progresso Atual:
- Observacoes: ${study.observations || 'Nenhuma'}
- Perguntas: ${study.questionsText || study.questions?.map(q => q.content).join('; ') || 'Nenhuma'}
- Genero: ${study.genre || 'Nao definido'}
- Estrutura: ${study.structure || 'Nao definida'}
- Contexto: ${study.contextText || JSON.stringify(study.context) || 'Nao definido'}
- Ideia Principal: ${study.mainIdea || 'Nao definida'}
- Intento Transformador: ${study.transformingIntent || 'Nao definido'}
- Esboco: ${study.sermonOutline || 'Nao definido'}
- Sermao: ${study.detailedSermon || 'Nao definido'}
`;
}

function getInstructorContext(study: Study) {
  return `
Texto Biblico: ${study.bibleSelection?.book} ${study.bibleSelection?.chapter}:${study.bibleSelection?.verseStart}-${study.bibleSelection?.verseEnd} (${study.bibleSelection?.translation})
Conteudo do Texto: ${study.bibleSelection?.text}
Observacoes do Usuario: ${study.observations || 'Nenhuma'}
Perguntas do Usuario: ${study.questionsText || 'Nenhuma'}
Contexto do Usuario: ${study.contextText || 'Nenhum'}
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
    value === null
  );
}

function isMentorBase(value: unknown): value is MentorBase {
  return value === 'texto_do_usuario' || value === 'texto_biblico_do_contexto' || value === 'ambos';
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

function parseMentorResponse(rawText: string): MentorStructuredResponse | null {
  const jsonText = extractJsonObject(rawText);
  if (!jsonText) return null;

  try {
    const parsed = JSON.parse(jsonText) as Partial<MentorStructuredResponse>;
    const feedback = normalizeOptionalText(parsed.feedback);
    const proximaPergunta = typeof parsed.proximaPergunta === 'string' ? parsed.proximaPergunta.trim() : '';

    if (
      !feedback ||
      !isMentorDeviation(parsed.desvioDetectado) ||
      !isMentorSeverity(parsed.gravidade) ||
      !isMentorMethodStep(parsed.etapaMetodo) ||
      !isMentorBase(parsed.baseUsada)
    ) {
      return null;
    }

    return {
      desvioDetectado: parsed.desvioDetectado,
      gravidade: parsed.gravidade,
      acertoParcial: normalizeOptionalText(parsed.acertoParcial),
      feedback,
      proximaPergunta,
      dica: normalizeOptionalText(parsed.dica),
      etapaMetodo: parsed.etapaMetodo,
      baseUsada: parsed.baseUsada,
    };
  } catch {
    return null;
  }
}

function cleanFallbackText(rawText: string) {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned || cleaned.startsWith('{') || cleaned.includes('"desvioDetectado"')) {
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

async function generateText(body: GeminiRequestBody) {
  const ai = getAiClient();
  if (!ai) {
    return { status: 503, body: { error: MISSING_API_KEY_MESSAGE } };
  }

  if (body.action === 'stageFeedback') {
    const { stage, study } = body.payload;
    const prompt = `Estou na etapa "${stage}". Analise meu progresso ate agora e me de um feedback sobre como estou indo e o que posso aprofundar nesta etapa, sem me dar a resposta final.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: `${getStudyContext(study)}\n\n${prompt}` }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return { status: 200, body: { text: formatMentorText(response.text) } };
  }

  if (body.action === 'askInstructor') {
    const { question, study } = body.payload;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: `${getInstructorContext(study)}\n\nPergunta do Usuario: ${question}` }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return { status: 200, body: { text: formatMentorText(response.text) } };
  }

  const { message, history = [] } = body.payload;
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user' as const, parts: [{ text: message }] },
    ],
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\nInteraja em um chat geral sobre o método, sem entregar interpretação final.`,
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
    const result = await generateText(normalizedBody);
    sendJson(res, result.status, result.body);
  } catch (error) {
    console.error('Gemini API route error:', error);
    sendJson(res, 500, { error: GENERIC_ERROR_MESSAGE });
  }
}
