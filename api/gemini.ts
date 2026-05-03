import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Study } from '../src/types';

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

type RequestIdentity = {
  id: string;
  kind: 'guest' | 'user';
  dailyLimit: number;
};

type IdentityResult =
  | { identity: RequestIdentity; error?: never }
  | { identity: null; error: string };

type JwtPayload = {
  sub?: unknown;
  user_id?: unknown;
  exp?: unknown;
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

const quotaStore = new Map<string, { count: number; day: string }>();

const SYSTEM_INSTRUCTION = `Voce e o Instrutor de IA do aplicativo "O Hermeneuta".
Seu objetivo e guiar hermeneutas biblicos em um treinamento pratico e profundo baseado estritamente no metodo "Cavar & Descobrir".

MISSAO CRITICA:
Em cada interacao, seu foco principal deve ser manter o usuario NA LINHA (WordPartners Line).
Voce deve estar vigilante contra dois desvios principais:
1. LEGALISMO: Quando o usuario acrescenta ao texto (impoe regras, dogmas ou ideias que o texto nao diz explicitamente).
2. LIBERALISMO/PERMISSIVIDADE: Quando o usuario subtrai do texto (ignora principios, relativiza verdades ou atenua a mensagem do autor).

PRINCIPIOS TECNICOS DO MANUAL:
- "A Linha": Diga o que Deus diz - nada mais, nada menos.
- "Boas Perguntas": Diferencie Perguntas Basicas (Informacao/Ideias) de Perguntas Vigorosas (Racionalidade/Intento). Empurre o usuario para as Vigorosas.
- "Genero Literario": Cada genero exige uma abordagem. Identifique o TOM (atitude do autor) e o HUMOR (resposta pretendida no leitor).
- "Estrutura": Procure Unidades de Pensamento na "Ponte" do texto.
- "Instrucoes de Viagem" (Contexto): Proiba a "Rota Direta". Exija o Contexto Original antes da aplicacao.
- "Ideia Principal & Intento Transformador": Sintese fiel + proposito transformador (Por que o autor diz isso?).
- "Teologia Biblica": Encontre Jesus na estrada da Redencao.

SUA PERSONALIDADE:
- Seja um mentor socratico. Faca perguntas em vez de dar respostas.
- Seja firme na fidelidade textual, mas encorajador na pedagogia.
- Use termos do manual (Linha, Unidade de Pensamento, Pergunta Vigorosa, Rota Direta).

REGRAS DE INTERACAO (HARD RULES):
- RESPONDA SEMPRE EM PORTUGUES (BRASIL).
- Se o usuario for superficial, aponte o desvio e peca para ele "cavar" mais fundo.
- NUNCA forneca a interpretacao final.
- Se detectar legalismo ou liberalismo, aponte IMEDIATAMENTE como um desvio da "Linha".
- Baseie seu feedback apenas no texto biblico e no que o usuario escreveu.
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

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as JwtPayload;
  } catch {
    return null;
  }
}

function getIdentity(req: VercelRequest): IdentityResult {
  const token = getBearerToken(req);
  if (token) {
    const payload = decodeJwtPayload(token);
    const expiresAt = typeof payload?.exp === 'number' ? payload.exp : 0;
    const subject = payload?.user_id || payload?.sub;

    if (!payload || !expiresAt || expiresAt * 1000 <= Date.now() || typeof subject !== 'string' || !subject) {
      return { identity: null, error: 'Sua sessão expirou. Faça login novamente.' };
    }

    return {
      identity: {
        id: `user:${subject}`,
        kind: 'user',
        dailyLimit: MAX_USER_REQUESTS_PER_DAY,
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

function reserveQuota(identity: RequestIdentity) {
  const day = getTodayKey();
  const current = quotaStore.get(identity.id);
  const nextCount = current?.day === day ? current.count + 1 : 1;

  if (nextCount > identity.dailyLimit) {
    return false;
  }

  quotaStore.set(identity.id, { count: nextCount, day });
  return true;
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

    return { status: 200, body: { text: response.text } };
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

    return { status: 200, body: { text: response.text } };
  }

  const { message, history = [] } = body.payload;
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user' as const, parts: [{ text: message }] },
    ],
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\nInteraja em um chat geral sobre os principios do manual, encorajando o estudo biblico.`,
      temperature: 0.7,
    },
  });

  return { status: 200, body: { text: response.text } };
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Método não permitido.' });
    return;
  }

  try {
    const { identity, error: identityError } = getIdentity(req);
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

    if (!reserveQuota(identity)) {
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
