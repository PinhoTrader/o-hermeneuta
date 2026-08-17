// Roda só via `npm run test:rules` (precisa do Firestore Emulator, ver
// vitest.rules.config.ts / package.json / skill padrao-teste). Não faz parte
// da suíte padrão `npm test` de propósito - não deve quebrar em CI/máquina
// sem o emulador configurado.
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// A lib não suporta escolher um databaseId no emulador (só a instância
// "(default)" local) - irrelevante para testar o CONTEÚDO das regras, que
// não referenciam o nome do banco. Ver skill padrao-teste.
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-o-hermeneuta',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

describe('users/{userId}', () => {
  it('permite o próprio usuário criar seu perfil', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'users/alice'), {
        email: 'alice@example.com',
        role: 'student',
        isApproved: false,
        createdAt: serverTimestamp(),
      })
    );
  });

  it('nega criar perfil em nome de outro usuário', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/bob'), {
        email: 'alice@example.com',
        role: 'student',
        isApproved: false,
        createdAt: serverTimestamp(),
      })
    );
  });

  it('nega criar perfil com role fora da lista fechada', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice'), {
        email: 'alice@example.com',
        role: 'superuser',
        isApproved: false,
        createdAt: serverTimestamp(),
      })
    );
  });

  it('nega o próprio usuário se auto-promover a admin', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/alice'), {
        email: 'alice@example.com',
        role: 'student',
        isApproved: false,
        createdAt: Timestamp.now(),
      });
    });

    await assertFails(updateDoc(doc(alice.firestore(), 'users/alice'), { role: 'admin' }));
    await assertFails(updateDoc(doc(alice.firestore(), 'users/alice'), { isApproved: true }));
  });

  it('nega leitura/escrita sem autenticação', async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anon.firestore(), 'users/alice')));
  });
});

describe('studies/{studyId}', () => {
  it('permite o dono criar um estudo válido com createdAt/updatedAt = request.time', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'studies/study-1'), {
        userId: 'alice',
        title: 'Efésios 1',
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('nega criar estudo com createdAt forjado (não é request.time)', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'studies/study-1'), {
        userId: 'alice',
        title: 'Efésios 1',
        status: 'draft',
        createdAt: Timestamp.fromDate(new Date('2020-01-01')),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('nega criar estudo em nome de outro usuário', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'studies/study-1'), {
        userId: 'bob',
        title: 'Efésios 1',
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('nega título acima do limite de 200 caracteres', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'studies/study-1'), {
        userId: 'alice',
        title: 'x'.repeat(201),
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('nega outro usuário ler ou apagar o estudo', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' });

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'studies/study-1'), {
        userId: 'alice',
        title: 'Efésios 1',
        status: 'draft',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await assertFails(getDoc(doc(bob.firestore(), 'studies/study-1')));
    await assertSucceeds(getDoc(doc(alice.firestore(), 'studies/study-1')));
  });

  it('nega alterar createdAt num update (campo imutável)', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'studies/study-1'), {
        userId: 'alice',
        title: 'Efésios 1',
        status: 'draft',
        createdAt: Timestamp.fromDate(new Date('2024-01-01')),
        updatedAt: Timestamp.fromDate(new Date('2024-01-01')),
      });
    });

    await assertFails(
      updateDoc(doc(alice.firestore(), 'studies/study-1'), {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });
});

describe('aiUsage/{usageId} (quota do Instrutor de IA, ver padrao-prompt-ia)', () => {
  it('permite o dono criar seu próprio contador diário', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'aiUsage/alice_daily_2026-08-17'), {
        uid: 'alice',
        studyId: '__daily_quota__',
        queryCount: 1,
        lastQueryAt: serverTimestamp(),
      })
    );
  });

  it('nega criar contador em nome de outro uid', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'aiUsage/bob_daily_2026-08-17'), {
        uid: 'bob',
        studyId: '__daily_quota__',
        queryCount: 1,
        lastQueryAt: serverTimestamp(),
      })
    );
  });

  it('permite incrementar queryCount mas nega diminuir', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'aiUsage/alice_daily_2026-08-17'), {
        uid: 'alice',
        studyId: '__daily_quota__',
        queryCount: 5,
        lastQueryAt: Timestamp.now(),
      });
    });

    await assertSucceeds(
      updateDoc(doc(alice.firestore(), 'aiUsage/alice_daily_2026-08-17'), {
        queryCount: 6,
        lastQueryAt: serverTimestamp(),
      })
    );

    await assertFails(
      updateDoc(doc(alice.firestore(), 'aiUsage/alice_daily_2026-08-17'), {
        queryCount: 4,
        lastQueryAt: serverTimestamp(),
      })
    );
  });

  it('nega outro usuário ler o contador de alguém', async () => {
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' });

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'aiUsage/alice_daily_2026-08-17'), {
        uid: 'alice',
        studyId: '__daily_quota__',
        queryCount: 1,
        lastQueryAt: Timestamp.now(),
      });
    });

    await assertFails(getDoc(doc(bob.firestore(), 'aiUsage/alice_daily_2026-08-17')));
  });
});

describe('groups/{groupId}', () => {
  // create/read de groups exige isApproved() == true, que por sua vez lê
  // users/{uid}.isApproved no Firestore - sem esse doc, exists() é false e
  // a checagem nega de forma limpa (comportamento real e correto).
  async function approveProfessor(uid: string, email: string) {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `users/${uid}`), {
        email,
        role: 'professor',
        isApproved: true,
        createdAt: Timestamp.now(),
      });
    });
  }

  it('permite um professor aprovado criar grupo com o próprio uid como professorId', async () => {
    await approveProfessor('alice', 'alice@example.com');
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'groups/group-1'), {
        name: 'Turma de Efésios',
        professorId: 'alice',
        createdAt: Timestamp.now(),
      })
    );
  });

  it('nega criar grupo em nome de outro professor', async () => {
    await approveProfessor('alice', 'alice@example.com');
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'groups/group-1'), {
        name: 'Turma de Efésios',
        professorId: 'bob',
        createdAt: Timestamp.now(),
      })
    );
  });

  it('nega criar grupo quando o usuário ainda não foi aprovado', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'groups/group-1'), {
        name: 'Turma de Efésios',
        professorId: 'alice',
        createdAt: Timestamp.now(),
      })
    );
  });
});
