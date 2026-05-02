import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AcademyModule, AcademyProgress } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// The "Cavar & Descobrir" Methodology Content
export const ACADEMY_CONTENT: AcademyModule[] = [
  {
    id: 'intro',
    title: 'Módulo 1: O Alicerce',
    description: 'A base espiritual e o coração do estudioso da Bíblia.',
    order: 1,
    lessons: [
      {
        id: 'coracao-pregador',
        moduleId: 'intro',
        title: 'O Coração do Pregador',
        order: 1,
        content: `
# O Coração do Pregador

O estudo da Bíblia não é apenas um exercício intelectual, mas uma jornada espiritual. Antes de "cavar" o texto, precisamos preparar o terreno do nosso coração.

## Pontos Chave:
1. **Dependência do Espírito Santo:** Ninguém entende as coisas de Deus senão o Espírito de Deus.
2. **Humildade:** Deus resiste aos soberbos, mas dá graça aos humildes.
3. **Santidade:** Um vaso limpo é mais útil para o mestre.

> "Abre os meus olhos para que eu veja as maravilhas da tua lei." (Salmo 119:18)
        `,
        quiz: [
          {
            id: 'q1',
            text: 'Qual é o pré-requisito fundamental antes de iniciar o estudo bíblico no método Cavar & Descobrir?',
            options: [
              'Ter muitos comentários bíblicos',
              'Preparação do coração e oração por iluminação',
              'Saber hebraico e grego fluentemente',
              'Ler o capítulo pelo menos 10 vezes'
            ],
            correctOptionIndex: 1,
            explanation: 'A preparação espiritual é a fundação. Sem a iluminação do Espírito Santo, o estudo permanece apenas na esfera intelectual.'
          }
        ]
      },
      {
        id: 'oracao-estudo',
        moduleId: 'intro',
        title: 'A Oração como Ferramenta',
        order: 2,
        content: `
# A Oração como Ferramenta de Estudo

Orar não é apenas como abrimos o estudo, é o ar que respiramos durante todo o processo de cavar.

## Como Orar no Estudo:
- **Antes:** Peça clareza e remoção de preconceitos.
- **Durante:** Quando encontrar um nó difícil, pare e peça ajuda.
- **Depois:** Peça força para aplicar o que descobriu.
        `,
        quiz: [
          {
            id: 'q1',
            text: 'Em qual momento do estudo a oração deve ser praticada?',
            options: [
              'Apenas no início',
              'Apenas no final para agradecer',
              'Antes, durante e depois do estudo',
              'Somente se o texto for muito difícil'
            ],
            correctOptionIndex: 2,
            explanation: 'A oração deve ser um diálogo constante com o Autor da Bíblia durante todo o processo de estudo.'
          }
        ]
      }
    ]
  },
  {
    id: 'observacao',
    title: 'Módulo 2: Cavar (Observação)',
    description: 'Aprendendo a olhar antes de concluir. O que o texto diz?',
    order: 2,
    lessons: [
      {
        id: 'olhar-atentamente',
        moduleId: 'observacao',
        title: 'A Arte de Observar',
        order: 1,
        content: `
# A Arte de Observar (Cavar)

Observação é o fundamento da interpretação. O erro mais comum é pular para "o que isso significa para mim" antes de ver "o que o texto realmente diz".

## Ferramentas de Observação:
1. **Contexto:** Quem escreveu? Para quem? Por que?
2. **Repetições:** Palavras que aparecem muito indicam a ênfase do autor.
3. **Conectores:** "Portanto", "porque", "mas". Eles mostram a lógica do argumento.
        `,
        quiz: [
          {
            id: 'q1',
            text: 'Qual é o objetivo principal da fase de Observação (Cavar)?',
            options: [
              'Descobrir como aplicar o texto na vida hoje',
              'Identificar o que o texto realmente diz hoje',
              'Encontrar rimas e poesias escondidas',
              'Procurar erros de tradução'
            ],
            correctOptionIndex: 1,
            explanation: 'Observar é ver os fatos do texto conforme eles são apresentados.'
          }
        ]
      }
    ]
  },
  {
    id: 'interpretacao',
    title: 'Módulo 3: Entender (Interpretação)',
    description: 'O que o texto significava para os leitores originais?',
    order: 3,
    lessons: [
      {
        id: 'ponte-hermeneutica',
        moduleId: 'interpretacao',
        title: 'A Ponte entre Mundos',
        order: 1,
        content: `
# A Ponte entre Mundos

Interpretação é o esforço de entender o que o autor quis comunicar aos seus ouvintes originais.

## Regras de Ouro:
1. **O Contexto reina:** O texto fora de contexto é um pretexto.
2. **A Bíblia interpreta a Bíblia:** Use passagens claras para entender as obscuras.
3. **Gênero Literário:** Não leia poesia como se fosse lei, nem parábola como se fosse história literal.
        `,
        quiz: [
          {
            id: 'q1',
            text: 'O que significa dizer que "o texto fora de contexto é um pretexto"?',
            options: [
              'Que o contexto não importa tanto',
              'Que podemos dar qualquer significado ao texto se ignorarmos o contexto',
              'Que a Bíblia deve ser lida apenas um versículo por vez',
              'Que o contexto é apenas para historiadores'
            ],
            correctOptionIndex: 1,
            explanation: 'Sem o contexto, podemos distorcer o significado original para apoiar nossas próprias ideias.'
          }
        ]
      }
    ]
  },
  {
    id: 'aplicacao',
    title: 'Módulo 4: Descobrir (Aplicação)',
    description: 'Mudança de vida. Como isso se aplica a nós hoje?',
    order: 4,
    lessons: [
      {
        id: 'transformacao',
        moduleId: 'aplicacao',
        title: 'Buscando a Transformação',
        order: 1,
        content: `
# Buscando a Transformação (Descobrir)

A finalidade de todo estudo bíblico não é o acúmulo de conhecimento, mas a transformação à imagem de Cristo.

## O Acróstico "PARE":
- **P**ecado para confessar?
- **A**ção para tomar?
- **R**emessa/Promessa para crer?
- **E**xemplo para seguir?
        `,
        quiz: [
          {
            id: 'q1',
            text: 'Qual é o objetivo final do método Cavar & Descobrir?',
            options: [
              'Ganhar debates teológicos',
              'Escrever um livro',
              'Transformação de vida à imagem de Cristo',
              'Decorar todos os versículos'
            ],
            correctOptionIndex: 2,
            explanation: 'O estudo bíblico deve sempre visar a santificação e obediência.'
          }
        ]
      }
    ]
  }
];

export async function getAcademyProgress(userId: string): Promise<AcademyProgress | null> {
  if (!userId || userId === 'guest') return null;
  const path = `academyProgress/${userId}`;
  try {
    const docRef = doc(db, 'academyProgress', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AcademyProgress;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function updateLessonCompletion(userId: string, lessonId: string, score: number) {
  if (!userId || userId === 'guest') return;
  const path = `academyProgress/${userId}`;
  try {
    const docRef = doc(db, 'academyProgress', userId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      await setDoc(docRef, {
        userId,
        completedLessons: [lessonId],
        quizScores: { [lessonId]: score },
        lastAccessedLessonId: lessonId,
        updatedAt: Date.now()
      });
    } else {
      await updateDoc(docRef, {
        completedLessons: arrayUnion(lessonId),
        [`quizScores.${lessonId}`]: score,
        lastAccessedLessonId: lessonId,
        updatedAt: Date.now()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
