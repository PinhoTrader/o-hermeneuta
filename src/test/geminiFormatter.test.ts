import { describe, expect, it } from 'vitest';
import { formatMentorText } from '../../api/gemini';

describe('formatMentorText', () => {
  it('converts valid mentor JSON into user-facing text', () => {
    const result = formatMentorText(JSON.stringify({
      desvioDetectado: 'legalismo',
      gravidade: 'leve',
      acertoParcial: 'Você percebeu a repetição do texto.',
      feedback: 'Esse é um bom começo, mas ainda precisa mostrar onde o texto sustenta a aplicação.',
      proximaPergunta: 'Qual palavra do texto sustenta essa conclusão?',
      dica: 'Volte à frase principal antes de aplicar.',
      etapaMetodo: 'linha',
      baseUsada: 'ambos',
    }));

    expect(result).toContain('**Acerto parcial:** Você percebeu a repetição do texto.');
    expect(result).toContain('possível desvio de legalismo (leve)');
    expect(result).toContain('**Próxima pergunta:** Qual palavra do texto sustenta essa conclusão?');
    expect(result).not.toContain('desvioDetectado');
  });

  it('extracts JSON returned inside a code fence', () => {
    const result = formatMentorText(`\`\`\`json
{
  "desvioDetectado": null,
  "gravidade": null,
  "acertoParcial": null,
  "feedback": "Observe primeiro a relação entre as ideias do parágrafo.",
  "proximaPergunta": "Que conexão o autor faz entre essas duas frases?",
  "etapaMetodo": "estrutura",
  "baseUsada": "texto_do_usuario"
}
\`\`\``);

    expect(result).toContain('Observe primeiro a relação entre as ideias do parágrafo.');
    expect(result).toContain('**Próxima pergunta:** Que conexão o autor faz entre essas duas frases?');
  });

  it('keeps the short continue response clean', () => {
    const result = formatMentorText(JSON.stringify({
      desvioDetectado: null,
      gravidade: null,
      acertoParcial: null,
      feedback: '✅ Continue quando estiver pronto.',
      proximaPergunta: '',
      etapaMetodo: null,
      baseUsada: 'texto_do_usuario',
    }));

    expect(result).toBe('✅ Continue quando estiver pronto.');
  });

  it('does not expose malformed JSON to the UI', () => {
    const result = formatMentorText('{"desvioDetectado": null, "feedback": ');

    expect(result).toBe('Desculpe, estou com dificuldades para processar sua mensagem agora.');
  });
});
