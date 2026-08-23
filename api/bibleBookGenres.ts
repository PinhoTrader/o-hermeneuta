// Classificação de gênero literário por livro bíblico - usada só para
// calibrar internamente que tipo de observação/pergunta o Instrutor de IA
// deve puxar do aluno nas etapas anteriores a "Gênero & Estilo" (ver
// getGenreHint, usado em api/gemini.ts). NUNCA deve ser usada para anunciar
// o gênero ao aluno antes da hora - a instrução nesse sentido está no
// SYSTEM_INSTRUCTION, não aqui.
//
// IMPORTANTE (2026-08-23): gênero varia DENTRO de um livro, às vezes dentro
// de um único capítulo - um livro majoritariamente narrativo pode conter um
// cântico poético encaixado (ex: Jonas 2), um livro profético pode ter
// blocos narrativos (ex: Daniel 1-6 vs. 7-12), etc. `BOOK_GENRE` é só o
// gênero PREDOMINANTE do livro inteiro; `CHAPTER_EXCEPTIONS` cobre os casos
// mais conhecidos/inequívocos de mudança de gênero por faixa de capítulo,
// mas não é exaustivo - a Bíblia tem dezenas de poemas/hinos encaixados que
// não estão catalogados aqui (ex: hinos citados em epístolas como Filipenses
// 2.6-11, o Magnificat em Lucas 1.46-55). Por isso `getGenreHint` é só um
// PONTO DE PARTIDA: a instrução no SYSTEM_INSTRUCTION deixa explícito que a
// leitura do texto integral da passagem (que a IA sempre recebe) tem
// prioridade sobre esta dica estatística quando divergirem.
//
// As chaves de livro são exatamente as strings de `BOOKS` em
// src/pages/BibleSelection.tsx (66 livros) - se esse array mudar, atualizar
// aqui também.
//
// Classificação segue as categorias do próprio livreto "Cavar & Descobrir"
// (ver princípio "genero" em cavarEDescobrirPrinciples.ts): Lei, Narrativa
// Histórica, Poesia, Literatura de Sabedoria, Profecia, Evangelho, Epístola,
// Apocalíptico.

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
  'Daniel': { genre: 'narrativa_historica', caveat: 'capítulos 1-6 são narrativa; 7-12 mudam para visões apocalípticas (ver exceção de capítulo)' },
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

// Trechos conhecidos e inequívocos em que o gênero de uma faixa de
// capítulos diverge do gênero predominante do livro - lista curada, não
// exaustiva (ver aviso no topo do arquivo). `chapterStart`/`chapterEnd` são
// inclusivos.
const CHAPTER_EXCEPTIONS: {
  book: string;
  chapterStart: number;
  chapterEnd: number;
  genre: BookGenre;
  note: string;
}[] = [
  { book: 'Jonas', chapterStart: 2, chapterEnd: 2, genre: 'poesia', note: 'o cântico de Jonas dentro do livro narrativo' },
  { book: 'Daniel', chapterStart: 7, chapterEnd: 12, genre: 'apocaliptico', note: 'a segunda metade de Daniel muda de narrativa para visões apocalípticas' },
  { book: 'Gênesis', chapterStart: 49, chapterEnd: 49, genre: 'poesia', note: 'a bênção de Jacó aos filhos' },
  { book: 'Êxodo', chapterStart: 15, chapterEnd: 15, genre: 'poesia', note: 'o Cântico do Mar' },
  { book: 'Números', chapterStart: 23, chapterEnd: 24, genre: 'poesia', note: 'os oráculos poéticos de Balaão' },
  { book: 'Deuteronômio', chapterStart: 32, chapterEnd: 33, genre: 'poesia', note: 'o Cântico de Moisés e a Bênção de Moisés' },
  { book: 'Juízes', chapterStart: 5, chapterEnd: 5, genre: 'poesia', note: 'o Cântico de Débora' },
  { book: '2 Samuel', chapterStart: 22, chapterEnd: 22, genre: 'poesia', note: 'o cântico de Davi (= Salmo 18)' },
];

function findChapterException(book: string, chapter: number | undefined) {
  if (chapter == null) return null;
  return CHAPTER_EXCEPTIONS.find(
    (exception) => exception.book === book && chapter >= exception.chapterStart && chapter <= exception.chapterEnd
  ) || null;
}

// Usado por stageFeedback/askInstructor em api/gemini.ts para calibrar
// internamente o tipo de observação/pergunta a puxar do aluno, sem nunca
// declarar o gênero antes da etapa "Gênero & Estilo" - a instrução de "não
// anunciar" fica no SYSTEM_INSTRUCTION, este texto só fornece o dado.
//
// `chapter` é opcional só por compatibilidade - sempre que disponível
// (stageFeedback/askInstructor sempre têm bibleSelection.chapter), passe-o:
// é o que permite pegar as exceções de CHAPTER_EXCEPTIONS em vez de só o
// gênero predominante do livro inteiro.
export function getGenreHint(book: string | undefined, chapter?: number): string {
  if (!book) return '';
  const entry = BOOK_GENRE[book];
  if (!entry) return '';

  const exception = findChapterException(book, chapter);
  const bookCaveat = entry.caveat ? ` (nota: ${entry.caveat})` : '';

  const exceptionLine = exception
    ? `\nATENÇÃO: a passagem selecionada (capítulo ${chapter}) cai numa exceção conhecida - aqui o gênero é ${GENRE_LABEL[exception.genre]}, não ${GENRE_LABEL[entry.genre]} (${exception.note}). Priorize esta classificação para o trecho exato selecionado.`
    : '';

  return `Gênero predominante do livro selecionado (${book}): ${GENRE_LABEL[entry.genre]}${bookCaveat}.${exceptionLine} Isto é só um ponto de partida estatístico, não uma classificação exata do trecho exato selecionado - o gênero pode variar dentro de um mesmo livro ou até capítulo (poemas/cânticos encaixados em livros narrativos ou proféticos, blocos narrativos em livros proféticos, hinos citados em epístolas, parábolas em evangelhos, etc.), inclusive em casos não cobertos por esta lista. Priorize sempre sua própria leitura da FORMA do texto integral da passagem (que você sempre recebe) sobre esta dica quando perceber divergência.`;
}
