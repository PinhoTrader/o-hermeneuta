import { Study } from "../types";
import { auth } from "../lib/firebase";

const REQUEST_ERROR_MESSAGE = "Desculpe, estou com dificuldades para processar sua mensagem agora.";
const GUEST_USER_KEY = 'guest_user';

type GeminiAction = 'stageFeedback' | 'askInstructor' | 'generalChat';
type ChatHistoryItem = { role: 'user' | 'model', content: string };

function getGuestId() {
  try {
    const stored = localStorage.getItem(GUEST_USER_KEY);
    if (!stored) return '';
    const parsed = JSON.parse(stored) as { uid?: unknown; isGuest?: unknown };
    return parsed.isGuest && typeof parsed.uid === 'string' ? parsed.uid : '';
  } catch {
    return '';
  }
}

async function getRequestHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    headers.Authorization = `Bearer ${await currentUser.getIdToken()}`;
    return headers;
  }

  const guestId = getGuestId();
  if (guestId) {
    headers['X-Hermeneuta-Guest-Id'] = guestId;
  }

  return headers;
}

async function callGeminiApi(action: GeminiAction, payload: unknown) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: await getRequestHeaders(),
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
