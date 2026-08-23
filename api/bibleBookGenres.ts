// Classificação de gênero literário por livro bíblico, a nível de LIVRO
// inteiro - usada só para calibrar internamente que tipo de observação/
// pergunta o Instrutor de IA deve puxar do aluno nas etapas anteriores a
// "Gênero & Estilo" (ver getGenreHint, usado em api/gemini.ts). NUNCA deve
// ser usada para anunciar o gênero ao aluno antes da hora - a instrução
// nesse sentido está no SYSTEM_INSTRUCTION, não aqui.
//
// As chaves são exatamente as strings de `BOOKS` em src/pages/BibleSelection.tsx
// (66 livros) - se esse array mudar, atualizar aqui também.
//
// Classificação segue as categorias do próprio livreto "Cavar & Descobrir"
// (ver princípio "genero" em cavarEDescobrirPrinciples.ts): Lei, Narrativa
// Histórica, Poesia, Literatura de Sabedoria, Profecia, Evangelho, Epístola,
// Apocalíptico. Alguns livros têm gênero misto/contestado por natureza (Jó e
// Cantares entre sabedoria/poesia; Jonas é narrativa sobre um profeta, não
// oráculo profético; Daniel mistura narrativa com apocalíptico) - marcados
// com `caveat`. Isto é uma classificação de referência a nível de livro, não
// uma verdade absoluta para todo trecho: gênero pode variar dentro do mesmo
// livro (ex: Jonas 2 é poesia dentro de narrativa; Daniel 1-6 é narrativa,
// 7-12 é apocalíptico).

export type BookGenre =
  | 'lei'
  | 'narrativa_historica'
  | 'poesia'
  | 'sabedoria'
  | 'profecia'
  | 'evangelho'
  | 'epistola'
  | 'apocaliptico';

const GENRE_LABEL: Record<BookGenre, string> = {
  lei: 'Lei',
  narrativa_historica: 'Narrativa Histórica',
  poesia: 'Poesia',
  sabedoria: 'Literatura de Sabedoria',
  profecia: 'Profecia',
  evangelho: 'Evangelho',
  epistola: 'Epístola',
  apocaliptico: 'Apocalíptico',
};

const BOOK_GENRE: Record<string, { genre: BookGenre; caveat?: string }> = {
  'Gênesis': { genre: 'lei' },
  'Êxodo': { genre: 'lei' },
  'Levítico': { genre: 'lei' },
  'Números': { genre: 'lei' },
  'Deuteronômio': { genre: 'lei' },
  'Josué': { genre: 'narrativa_historica' },
  'Juízes': { genre: 'narrativa_historica' },
  'Rute': { genre: 'narrativa_historica' },
  '1 Samuel': { genre: 'narrativa_historica' },
  '2 Samuel': { genre: 'narrativa_historica' },
  '1 Reis': { genre: 'narrativa_historica' },
  '2 Reis': { genre: 'narrativa_historica' },
  '1 Crônicas': { genre: 'narrativa_historica' },
  '2 Crônicas': { genre: 'narrativa_historica' },
  'Esdras': { genre: 'narrativa_historica' },
  'Neemias': { genre: 'narrativa_historica' },
  'Ester': { genre: 'narrativa_historica' },
  'Jó': { genre: 'sabedoria', caveat: 'moldura narrativa com longos diálogos poéticos' },
  'Salmos': { genre: 'poesia' },
  'Provérbios': { genre: 'sabedoria' },
  'Eclesiastes': { genre: 'sabedoria' },
  'Cantares': { genre: 'poesia', caveat: 'poesia amorosa, às vezes classificada como sabedoria' },
  'Isaías': { genre: 'profecia' },
  'Jeremias': { genre: 'profecia' },
  'Lamentações': { genre: 'poesia', caveat: 'poemas de lamento' },
  'Ezequiel': { genre: 'profecia' },
  'Daniel': { genre: 'apocaliptico', caveat: 'capítulos 1-6 são narrativa, 7-12 são apocalípticos' },
  'Oseias': { genre: 'profecia' },
  'Joel': { genre: 'profecia' },
  'Amós': { genre: 'profecia' },
  'Obadias': { genre: 'profecia' },
  'Jonas': { genre: 'narrativa_historica', caveat: 'narrativa sobre um profeta, não oráculo profético; o cântico do cap.2 é poesia' },
  'Miqueias': { genre: 'profecia' },
  'Naum': { genre: 'profecia' },
  'Habacuque': { genre: 'profecia' },
  'Sofonias': { genre: 'profecia' },
  'Ageu': { genre: 'profecia' },
  'Zacarias': { genre: 'profecia' },
  'Malaquias': { genre: 'profecia' },
  'Mateus': { genre: 'evangelho' },
  'Marcos': { genre: 'evangelho' },
  'Lucas': { genre: 'evangelho' },
  'João': { genre: 'evangelho' },
  'Atos': { genre: 'narrativa_historica' },
  'Romanos': { genre: 'epistola' },
  '1 Coríntios': { genre: 'epistola' },
  '2 Coríntios': { genre: 'epistola' },
  'Gálatas': { genre: 'epistola' },
  'Efésios': { genre: 'epistola' },
  'Filipenses': { genre: 'epistola' },
  'Colossenses': { genre: 'epistola' },
  '1 Tessalonicenses': { genre: 'epistola' },
  '2 Tessalonicenses': { genre: 'epistola' },
  '1 Timóteo': { genre: 'epistola' },
  '2 Timóteo': { genre: 'epistola' },
  'Tito': { genre: 'epistola' },
  'Filemom': { genre: 'epistola' },
  'Hebreus': { genre: 'epistola' },
  'Tiago': { genre: 'epistola' },
  '1 Pedro': { genre: 'epistola' },
  '2 Pedro': { genre: 'epistola' },
  '1 João': { genre: 'epistola' },
  '2 João': { genre: 'epistola' },
  '3 João': { genre: 'epistola' },
  'Judas': { genre: 'epistola' },
  'Apocalipse': { genre: 'apocaliptico' },
};

// Usado por stageFeedback/askInstructor em api/gemini.ts para calibrar
// internamente o tipo de observação/pergunta a puxar do aluno, sem nunca
// declarar o gênero antes da etapa "Gênero & Estilo" - a instrução de "não
// anunciar" fica no SYSTEM_INSTRUCTION, este texto só fornece o dado.
export function getGenreHint(book: string | undefined): string {
  if (!book) return '';
  const entry = BOOK_GENRE[book];
  if (!entry) return '';

  const caveat = entry.caveat ? ` (nota: ${entry.caveat})` : '';
  return `Gênero de referência do livro selecionado (${book}): ${GENRE_LABEL[entry.genre]}${caveat}. Classificação a nível de livro - use só para calibrar internamente que tipo de observação/pergunta pedir; não é garantia absoluta para o trecho exato selecionado.`;
}
