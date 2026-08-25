import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
}));

import { askInstructor, generalAIChat, getStageFeedback } from '../services/geminiService';
import type { Study } from '../types';

const study = {} as Study;

describe('geminiService error handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves with the mentor text on a successful response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ text: 'Ótima observação, continue.' }), { status: 200 })
    );

    await expect(getStageFeedback('Observação', study)).resolves.toBe('Ótima observação, continue.');
  });

  // Regressão: uma resposta de erro do servidor (ex.: cota diária atingida)
  // já foi tratada, por engano, como texto válido do Instrutor - o usuário via
  // a mensagem de erro dentro do card de resposta da IA, como se o mentor
  // tivesse dito aquilo. Ver conversa que motivou a correção.
  it('rejects instead of resolving when the server returns a quota error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: 'Você atingiu o limite diário do Instrutor de IA. Tente novamente amanhã.' }),
        { status: 429 }
      )
    );

    await expect(getStageFeedback('Observação', study)).rejects.toThrow(
      'Você atingiu o limite diário do Instrutor de IA. Tente novamente amanhã.'
    );
  });

  it('rejects with the generic message when the server errors without a parseable body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('not json', { status: 500 }));

    await expect(askInstructor('Pergunta?', study)).rejects.toThrow(
      'Desculpe, estou com dificuldades para processar sua mensagem agora.'
    );
  });

  it('generalAIChat also rejects instead of resolving with the error text', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Mensagem inválida.' }), { status: 400 }));

    await expect(generalAIChat('oi')).rejects.toThrow('Mensagem inválida.');
  });
});
