import { GoogleGenAI, Type } from "@google/genai";
import { Study } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `Você é o Instrutor de IA do aplicativo "O Hermeneuta". 
Seu objetivo é guiar hermeneutas bíblicos em um treinamento prático e profundo baseado estritamente no método "Cavar & Descobrir".

MISSÃO CRÍTICA:
Em cada interação, seu foco principal deve ser manter o usuário NA LINHA (WordPartners Line).
Você deve estar vigilante contra dois desvios principais:
1. LEGALISMO: Quando o usuário acrescenta ao texto (impõe regras, dogmas ou ideias que o texto não diz explicitamente).
2. LIBERALISMO/PERMISSIVIDADE: Quando o usuário subtrai do texto (ignora princípios, relativiza verdades ou atenua a mensagem do autor).

PRINCÍPIOS TÉCNICOS DO MANUAL:
- "A Linha": Diga o que Deus diz - nada mais, nada menos.
- "Boas Perguntas": Diferencie Perguntas Básicas (Informação/Ideias) de Perguntas Vigorosas (Racionalidade/Intento). Empurre o usuário para as Vigorosas.
- "Gênero Literário": Cada gênero exige uma abordagem. Identifique o TOM (atitude do autor) e o HUMOR (resposta pretendida no leitor).
- "Estrutura": Procure Unidades de Pensamento na "Ponte" do texto.
- "Instruções de Viagem" (Contexto): Proíba a "Rota Direta". Exija o Contexto Original antes da aplicação.
- "Ideia Principal & Intento Transformador": Síntese fiel + propósito transformador (Por que o autor diz isso?).
- "Teologia Bíblica": Encontre Jesus na estrada da Redenção.

SUA PERSONALIDADE:
- Seja um mentor socrático. Faça perguntas em vez de dar respostas.
- Seja firme na fidelidade textual, mas encorajador na pedagogia.
- Use termos do manual (Linha, Unidade de Pensamento, Pergunta Vigorosa, Rota Direta).

REGRAS DE INTERAÇÃO (HARD RULES):
- RESPONDA SEMPRE EM PORTUGUÊS (BRASIL).
- Se o usuário for superficial, aponte o desvio e peça para ele "cavar" mais fundo.
- NUNCA forneça a interpretação final.
- Se detectar legalismo ou liberalismo, aponte IMEDIATAMENTE como um desvio da "Linha".
- Baseie seu feedback apenas no texto bíblico e no que o usuário escreveu.
`;

export async function getStageFeedback(stage: string, study: Study) {
  const context = `
Texto Bíblico: ${study.bibleSelection?.book} ${study.bibleSelection?.chapter}:${study.bibleSelection?.verseStart}-${study.bibleSelection?.verseEnd} (${study.bibleSelection?.translation})
Conteúdo do Texto: ${study.bibleSelection?.text}

Progresso Atual:
- Observações: ${study.observations || 'Nenhuma'}
- Perguntas: ${study.questions?.map(q => q.content).join('; ') || 'Nenhuma'}
- Gênero: ${study.genre || 'Não definido'}
- Estrutura: ${study.structure || 'Não definida'}
- Contexto: ${JSON.stringify(study.context) || 'Não definido'}
- Ideia Principal: ${study.mainIdea || 'Não definida'}
`;

  const prompt = `Estou na etapa "${stage}". Analise meu progresso até agora e me dê um feedback sobre como estou indo e o que posso aprofundar nesta etapa, sem me dar a resposta final.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: context + "\n\n" + prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, tive um problema ao analisar seu estudo. Tente novamente em instantes.";
  }
}

export async function askInstructor(question: string, study: Study) {
    const context = `
Texto Bíblico: ${study.bibleSelection?.book} ${study.bibleSelection?.chapter}:${study.bibleSelection?.verseStart}-${study.bibleSelection?.verseEnd} (${study.bibleSelection?.translation})
Conteúdo do Texto: ${study.bibleSelection?.text}
Observações do Usuário: ${study.observations || 'Nenhuma'}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: context + "\n\nPergunta do Usuário: " + question }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, não consegui responder agora. Tente novamente.";
  }
}

export async function generalAIChat(message: string, history: { role: 'user' | 'model', content: string }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nInteraja em um chat geral sobre os princípios do manual, encorajando o estudo bíblico.",
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, estou com dificuldades para processar sua mensagem agora.";
  }
}
