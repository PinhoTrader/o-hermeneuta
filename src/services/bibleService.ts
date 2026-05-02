const VERSION_MAPPING: Record<string, string> = {
  'ARA': 'ra',
  'ARC': 'rc',
  'NVI': 'nvi',
  'NVT': 'nvt',
  'NAA': 'naa'
};

const BOOK_MAPPING: Record<string, string> = {
  'Gênesis': 'gn',
  'Êxodo': 'ex',
  'Levítico': 'lv',
  'Números': 'nm',
  'Deuteronômio': 'dt',
  'Josué': 'js',
  'Juízes': 'jz',
  'Rute': 'rt',
  '1 Samuel': '1sm',
  '2 Samuel': '2sm',
  '1 Reis': '1rs',
  '2 Reis': '2rs',
  '1 Crônicas': '1cr',
  '2 Crônicas': '2cr',
  'Esdras': 'ed',
  'Neemias': 'ne',
  'Ester': 'et',
  'Jó': 'job',
  'Salmos': 'sl',
  'Provérbios': 'pv',
  'Eclesiastes': 'ec',
  'Cantares': 'ct',
  'Cânticos': 'ct',
  'Isaías': 'is',
  'Jeremias': 'jr',
  'Lamentações': 'lm',
  'Ezequiel': 'ez',
  'Daniel': 'dn',
  'Oseias': 'os',
  'Joel': 'jl',
  'Amós': 'am',
  'Obadias': 'ob',
  'Jonas': 'jn',
  'Miqueias': 'mq',
  'Naum': 'na',
  'Habacuque': 'hc',
  'Sofonias': 'sf',
  'Ageu': 'ag',
  'Zacarias': 'zc',
  'Malaquias': 'ml',
  'Mateus': 'mt',
  'Marcos': 'mc',
  'Lucas': 'lc',
  'João': 'jo',
  'Atos': 'at',
  'Romanos': 'rm',
  '1 Coríntios': '1co',
  '2 Coríntios': '2co',
  'Gálatas': 'gl',
  'Efésios': 'ef',
  'Filipenses': 'fp',
  'Colossenses': 'cl',
  '1 Tessalonicenses': '1ts',
  '2 Tessalonicenses': '2ts',
  '1 Timóteo': '1tm',
  '2 Timóteo': '2tm',
  'Tito': 'tt',
  'Filemom': 'fl',
  'Hebreus': 'hb',
  'Tiago': 'tg',
  '1 Pedro': '1pe',
  '2 Pedro': '2pe',
  '1 João': '1jo',
  '2 João': '2jo',
  '3 João': '3jo',
  'Judas': 'jd',
  'Apocalipse': 'ap'
};

const NAA_BOOK_MAPPING: Record<string, string> = {
  ...BOOK_MAPPING,
  'João': 'jn',    // John in PrayerPulse
  'Josué': 'jo',   // Joshua in PrayerPulse
  'Jonas': 'jon',  // Jonah in PrayerPulse
  'Jó': 'jb'       // Job in PrayerPulse
};

async function getMaatheusBibleText(book: string, chapter: number, verseStart: number, verseEnd: number) {
  const bookId = BOOK_MAPPING[book] || book.toLowerCase().substring(0, 2);
  const url = `https://raw.githubusercontent.com/maatheusgois/bible/main/versions/pt-br/nvi/${bookId}/${bookId}.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Maatheus content not found');
    const data = await response.json();
    const chapterData = data.chapters[chapter - 1];
    if (!chapterData) throw new Error('Capítulo não encontrado');
    
    return chapterData
      .slice(verseStart - 1, verseEnd)
      .map((text: string, index: number) => `${verseStart + index}. ${text}`)
      .join(' ');
  } catch (error) {
    throw error;
  }
}

async function getPrayerPulseBibleText(translation: string, book: string, chapter: number, verseStart: number, verseEnd: number) {
  const bookId = NAA_BOOK_MAPPING[book] || BOOK_MAPPING[book] || book.toLowerCase().substring(0, 2);
  const url = `https://r.jina.ai/http://api.prayerpulse.io/bible/get-text/${translation}/${bookId}/${chapter}?clean=true`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${translation} PrayerPulse API failed`);
    const text = await response.text();
    
    try {
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
      const rangeVerses = jsonData.filter((v: any) => v.verse >= verseStart && v.verse <= verseEnd);
      if (rangeVerses.length > 0) {
        return rangeVerses.map((v: any) => `${v.verse}. ${v.text}`).join(' ');
      }
    } catch (e) {}
    
    // Fallback parsing for text/markdown response
    if (text.length > 100) return text.substring(0, 2000);
    throw new Error('Content too short');
  } catch (error) {
    throw error;
  }
}

async function getThiagoBodrukFallback(book: string, chapter: number, verseStart: number, verseEnd: number, translation: string) {
  const version = translation.toLowerCase();
  const url = `https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/${version}.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('ThiagoBodruk failed');
    const data = await response.json();
    
    // Structure of this specific repo: Array of books, each has chapters, each is array of verses
    const bookData = data.find((b: any) => 
      b.abbrev.toLowerCase() === (BOOK_MAPPING[book] || '').toLowerCase() || 
      b.name.toLowerCase() === book.toLowerCase()
    );
    
    if (!bookData) throw new Error('Livro não encontrado no fallback');
    const chapterData = bookData.chapters[chapter - 1];
    if (!chapterData) throw new Error('Capítulo não encontrado no fallback');
    
    return chapterData
      .slice(verseStart - 1, verseEnd)
      .map((text: string, index: number) => `${verseStart + index}. ${text}`)
      .join(' ');
  } catch (e) {
    throw e;
  }
}

async function getLocalBibleText(translation: string, book: string, chapter: number, verseStart: number, verseEnd: number) {
  try {
    const response = await fetch(`/src/assets/biblia_${translation.toLowerCase()}.json`);
    if (!response.ok) throw new Error('Local asset not found');
    const data = await response.json();
    
    const bookData = data.find((b: any) => 
      b.abbrev.toLowerCase() === (BOOK_MAPPING[book] || '').toLowerCase() || 
      b.name.toLowerCase() === book.toLowerCase()
    );
    
    if (!bookData) throw new Error('Livro não encontrado');
    const chapterData = bookData.chapters[chapter - 1];
    if (!chapterData) throw new Error('Capítulo não encontrado');
    
    return chapterData
      .slice(verseStart - 1, verseEnd)
      .map((text: string, index: number) => `${verseStart + index}. ${text}`)
      .join(' ');
  } catch (e) {
    return getThiagoBodrukFallback(book, chapter, verseStart, verseEnd, translation);
  }
}

// --- Cache System ---
const BIBLE_CACHE_KEY = 'hermeneuta_bible_cache';
const memoryCache: Record<string, string> = {};

function getCachedText(key: string): string | null {
  if (memoryCache[key]) return memoryCache[key];
  try {
    const local = localStorage.getItem(BIBLE_CACHE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed[key]) {
        memoryCache[key] = parsed[key];
        return parsed[key];
      }
    }
  } catch (e) {}
  return null;
}

function setCachedText(key: string, text: string) {
  memoryCache[key] = text;
  try {
    const local = localStorage.getItem(BIBLE_CACHE_KEY);
    const cache = local ? JSON.parse(local) : {};
    cache[key] = text;
    // Limit cache size
    const keys = Object.keys(cache);
    if (keys.length > 300) delete cache[keys[0]];
    localStorage.setItem(BIBLE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {}
}

export async function fetchBibleText(book: string, chapter: number, verseStart: number, verseEnd: number, translation: string = 'ARA') {
  const cacheKey = `${translation}-${book}-${chapter}-${verseStart}-${verseEnd}`;
  const cached = getCachedText(cacheKey);
  if (cached) return cached;

  const mappingKey = BOOK_MAPPING[book] || book.toLowerCase();
  let result = "";

  try {
    if (translation === 'NVI') {
      try { result = await getMaatheusBibleText(book, chapter, verseStart, verseEnd); } catch (e) {}
    }
    
    if (!result && ['NAA', 'ARA', 'NVT', 'NTLH'].includes(translation)) {
      try { result = await getPrayerPulseBibleText(translation, book, chapter, verseStart, verseEnd); } catch (e) {}
    }

    if (!result && translation === 'ARC') {
      try { result = await getLocalBibleText('ARC', book, chapter, verseStart, verseEnd); } catch (e) {}
    }

    const abdVersion = VERSION_MAPPING[translation] || 'ra';
    if (!result) {
      try {
        const abdBokId = mappingKey === 'ct' ? 'ct' : mappingKey;
        const response = await fetch(`https://www.abibliadigital.com.br/api/verses/${abdVersion}/${abdBokId}/${chapter}`);
        if (response.ok) {
          const data = await response.json();
          const rangeVerses = data.verses.filter((v: any) => v.number >= verseStart && v.number <= verseEnd);
          if (rangeVerses.length > 0) {
            result = rangeVerses.map((v: any) => `${v.number}. ${v.text}`).join(' ');
          }
        }
      } catch (e) {}
    }

    if (!result) {
      try {
        result = await getThiagoBodrukFallback(book, chapter, verseStart, verseEnd, translation);
      } catch (e) {}
    }

    if (!result) {
      const englishPassage = `${book}+${chapter}:${verseStart}-${verseEnd}`;
      try {
        const response = await fetch(`https://bible-api.com/${englishPassage}?translation=almeida`);
        if (response.ok) {
          const data = await response.json();
          if (data.text) result = data.text;
        }
      } catch (e) {}
    }

    if (result) {
      setCachedText(cacheKey, result);
      return result;
    }

    return "Ops! Não conseguimos carregar o texto automático agora. Por favor, utilize sua Bíblia física para preencher esta etapa e continue seu estudo.";
  } catch (error) {
    console.error('Unified Bible Service Critical Failure:', error);
    return "Erro ao carregar texto.";
  }
}
