import { Study } from "../types";

const REQUEST_ERROR_MESSAGE = "Desculpe, estou com dificuldades para processar sua mensagem agora.";

type GeminiAction = 'stageFeedback' | 'askInstructor' | 'generalChat';
type ChatHistoryItem = { role: 'user' | 'model', content: string };

async function callGeminiApi(action: GeminiAction, payload: unknown) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });

  const data = await response.json().catch(() => ({})) as { text?: string; error?: string };

  if (!response.ok) {
    return data.error || REQUEST_ERROR_MESSAGE;
  }

  return data.text || REQUEST_ERROR_MESSAGE;
}

export async function getStageFeedback(stage: string, study: Study) {
  try {
    return await callGeminiApi('stageFeedback', { stage, study });
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, tive um problema ao analisar seu estudo. Tente novamente em instantes.";
  }
}

export async function askInstructor(question: string, study: Study) {
  try {
    return await callGeminiApi('askInstructor', { question, study });
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, não consegui responder agora. Tente novamente.";
  }
}

export async function generalAIChat(message: string, history: ChatHistoryItem[] = []) {
  try {
    return await callGeminiApi('generalChat', { message, history });
  } catch (error) {
    console.error("Gemini Error:", error);
    return REQUEST_ERROR_MESSAGE;
  }
}
