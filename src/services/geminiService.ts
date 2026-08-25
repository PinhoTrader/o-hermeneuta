import { ExperienceLevel, Study } from "../types";
import { auth } from "../lib/firebase";

const REQUEST_ERROR_MESSAGE = "Desculpe, estou com dificuldades para processar sua mensagem agora.";
const SESSION_EXPIRED_MESSAGE = "Sua sessão expirou. Faça login novamente.";
const GUEST_USER_KEY = 'guest_user';

type GeminiAction = 'stageFeedback' | 'askInstructor' | 'generalChat';
type ChatHistoryItem = { role: 'user' | 'model', content: string };

class SessionTokenError extends Error {}

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

async function getRequestHeaders(forceRefresh = true) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      headers.Authorization = `Bearer ${await currentUser.getIdToken(forceRefresh)}`;
    } catch (error) {
      throw new SessionTokenError(error instanceof Error ? error.message : 'Token refresh failed');
    }
    return headers;
  }

  const guestId = getGuestId();
  if (guestId) {
    headers['X-Hermeneuta-Guest-Id'] = guestId;
  }

  return headers;
}

async function requestGemini(action: GeminiAction, payload: unknown, forceRefresh = true) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: await getRequestHeaders(forceRefresh),
    body: JSON.stringify({ action, payload }),
  });

  const data = await response.json().catch(() => ({})) as { text?: string; error?: string };
  return { response, data };
}

async function callGeminiApi(action: GeminiAction, payload: unknown) {
  let response: Response;
  let data: { text?: string; error?: string };

  try {
    ({ response, data } = await requestGemini(action, payload, true));
  } catch (error) {
    if (error instanceof SessionTokenError) {
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }
    throw error;
  }

  if ((response.status === 401 || response.status === 403) && auth.currentUser) {
    try {
      ({ response, data } = await requestGemini(action, payload, true));
    } catch (error) {
      if (error instanceof SessionTokenError) {
        throw new Error(SESSION_EXPIRED_MESSAGE);
      }
      throw error;
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }
  }

  // A resposta de erro do servidor (ex.: limite diário atingido) nunca pode
  // ser tratada como texto válido do Instrutor - quem chama precisa poder
  // distinguir "a IA respondeu isto" de "a chamada falhou por isto", senão a
  // UI acaba exibindo a mensagem de erro como se fosse a fala do mentor.
  if (!response.ok) {
    throw new Error(data.error || REQUEST_ERROR_MESSAGE);
  }

  return data.text || REQUEST_ERROR_MESSAGE;
}

export async function getStageFeedback(stage: string, study: Study, experienceLevel?: ExperienceLevel) {
  return callGeminiApi('stageFeedback', { stage, study, experienceLevel });
}

export async function askInstructor(question: string, study: Study, experienceLevel?: ExperienceLevel) {
  return callGeminiApi('askInstructor', { question, study, experienceLevel });
}

export async function generalAIChat(message: string, history: ChatHistoryItem[] = []) {
  return callGeminiApi('generalChat', { message, history });
}
