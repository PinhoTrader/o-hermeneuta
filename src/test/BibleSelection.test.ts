import { describe, expect, it } from 'vitest';
import { validateBibleSelection } from '../pages/BibleSelection';

const validSelection = {
  book: 'João',
  chapter: 3,
  verseStart: 16,
  verseEnd: 17,
  translation: 'ARA',
  text: '',
};

describe('validateBibleSelection', () => {
  it('accepts a valid bible selection', () => {
    expect(validateBibleSelection(validSelection)).toBeNull();
  });

  it('requires a book', () => {
    expect(validateBibleSelection({ ...validSelection, book: '' })).toBe('Selecione um livro bíblico.');
  });

  it('rejects invalid chapter and verse ranges', () => {
    expect(validateBibleSelection({ ...validSelection, chapter: 0 })).toBe('Informe um capítulo válido.');
    expect(validateBibleSelection({ ...validSelection, verseStart: 0 })).toBe('Informe um versículo inicial válido.');
    expect(validateBibleSelection({ ...validSelection, verseEnd: 15 })).toBe('O versículo final deve ser maior ou igual ao inicial.');
  });
});
