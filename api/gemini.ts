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
};

const modelName = 'gemini-3-flash-preview';
const MISSING_API_KEY_MESSAGE =
  'O Instrutor de IA ainda não está configurado neste ambiente. Verifique a GEMINI_API_KEY no servidor.';
const GENERIC_ERROR_MESSAGE = 'Desculpe, estou com dificuldades para processar sua mensagem agora.';

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
  if (!ai) return MISSING_API_KEY_MESSAGE;

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

    return response.text;
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

    return response.text;
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

  return response.text;
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Método não permitido.' });
    return;
  }

  try {
    const body = (await readBody(req)) as Partial<GeminiRequestBody>;

    if (!isAction(body.action) || !body.payload) {
      sendJson(res, 400, { error: 'Pedido inválido para o Instrutor de IA.' });
      return;
    }

    const text = await generateText(body as GeminiRequestBody);
    sendJson(res, 200, { text });
  } catch (error) {
    console.error('Gemini API route error:', error);
    sendJson(res, 500, { error: GENERIC_ERROR_MESSAGE });
  }
}
