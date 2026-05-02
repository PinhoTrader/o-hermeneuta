import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FinalReview from '../pages/FinalReview';

vi.mock('../context/StudyContext', () => ({
  useStudy: () => ({
    currentStudy: {
      observations: 'Observei repetições no texto.',
      questionsText: 'Por que o autor usa essa imagem?',
      genre: 'Epístola com argumento pastoral.',
      contextText: 'Comunidade em tensão cultural.',
      mainIdea: 'Cristo sustenta a fé do povo.',
      transformingIntent: 'Levar a igreja à perseverança.',
      sermonOutline: 'I. Olhe para Cristo',
      detailedSermon: 'Introdução e desenvolvimento do sermão.',
    },
  }),
}));

describe('FinalReview', () => {
  it('renders questions, context and detailed sermon in the final review', () => {
    render(<FinalReview onBack={vi.fn()} onComplete={vi.fn()} />);

    expect(screen.getByText('Perguntas')).toBeInTheDocument();
    expect(screen.getByText('Por que o autor usa essa imagem?')).toBeInTheDocument();
    expect(screen.getByText('Contexto')).toBeInTheDocument();
    expect(screen.getByText('Comunidade em tensão cultural.')).toBeInTheDocument();
    expect(screen.getByText('Sermão Detalhado')).toBeInTheDocument();
    expect(screen.getByText('Introdução e desenvolvimento do sermão.')).toBeInTheDocument();
  });
});
