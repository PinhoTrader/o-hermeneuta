import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  limit,
  collectionGroup,
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Group, Message, UserProfile } from '../types';

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

export async function createGroup(name: string, professorId: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      name,
      professorId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'groups');
    return '';
  }
}

export async function listUserGroups(userId: string, role: string): Promise<Group[]> {
  const path = 'groups';
  try {
    if (role === 'professor') {
      const q = query(
        collection(db, 'groups'),
        where('professorId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
    } else {
      // Use collectionGroup to find all groups where this user is a member
      const q = query(
        collectionGroup(db, 'members'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      const groupRequests = snapshot.docs.map(mDoc => {
        const groupRef = mDoc.ref.parent.parent;
        if (!groupRef) return null;
        return getDoc(groupRef);
      });
      
      const groupSnaps = await Promise.all(groupRequests.filter(r => r !== null) as Promise<any>[]);
      return groupSnaps
        .filter(snap => snap.exists())
        .map(snap => ({ id: snap.id, ...snap.data() } as Group));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToMessages(
  groupId: string, 
  messageLimit: number,
  callback: (messages: Message[], lastDoc: QueryDocumentSnapshot<DocumentData> | null) => void
) {
  const path = `groups/${groupId}/messages`;
  // We order by timestamp DESC to get the latest ones first with a limit
  const q = query(
    collection(db, path),
    orderBy('timestamp', 'desc'),
    limit(messageLimit)
  );
  
  return onSnapshot(q, (snapshot) => {
    // Reverse them to display in chronological order
    const messages = snapshot.docs
      .map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      } as Message))
      .reverse();
    
    // The last document for pagination is the oldest one in this set (the bottom of our DESC query)
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    callback(messages, lastDoc);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function fetchOlderMessages(
  groupId: string, 
  lastDoc: QueryDocumentSnapshot<DocumentData>,
  messageLimit: number
): Promise<{ messages: Message[], nextLastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  const path = `groups/${groupId}/messages`;
  try {
    const q = query(
      collection(db, path),
      orderBy('timestamp', 'desc'),
      startAfter(lastDoc),
      limit(messageLimit)
    );
    
    const snapshot = await getDocs(q);
    const messages = snapshot.docs
      .map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      } as Message))
      .reverse();
    
    const nextLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    return { messages, nextLastDoc };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return { messages: [], nextLastDoc: null };
  }
}

export async function sendMessage(groupId: string, senderId: string, senderName: string, content: string) {
  const path = `groups/${groupId}/messages`;
  try {
    await addDoc(collection(db, path), {
      groupId,
      senderId,
      senderName,
      content,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function joinGroup(groupId: string, studentId: string) {
  const path = `groups/${groupId}/members/${studentId}`;
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error('A sala com este ID não foi encontrada.');
    }

    // Use a subcollection for members instead of arrayUnion
    const memberRef = doc(db, 'groups', groupId, 'members', studentId);
    await setDoc(memberRef, {
      userId: studentId,
      joinedAt: serverTimestamp(),
      role: 'student'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'A sala com este ID não foi encontrada.') {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function listAllProfessors(): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['professor', 'monitor']),
      where('isApproved', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

export async function findGroupsByProfessor(professorId: string): Promise<Group[]> {
  try {
    const q = query(
      collection(db, 'groups'),
      where('professorId', '==', professorId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'groups');
    return [];
  }
}

export async function addStudentByEmail(groupId: string, email: string): Promise<{ success: boolean, message: string }> {
  try {
    // 1. Find user by email
    const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { success: false, message: 'Usuário não encontrado com este e-mail.' };
    }
    
    const studentId = snapshot.docs[0].id;
    
    // 2. Add to group
    await joinGroup(groupId, studentId);
    return { success: true, message: 'Aluno adicionado com sucesso!' };
  } catch (error) {
    console.error('Add student error:', error);
    return { success: false, message: 'Erro ao adicionar aluno. Verifique as permissões.' };
  }
}

export async function assignProfessorToGroup(groupId: string, professorId: string): Promise<void> {
  const path = `groups/${groupId}`;
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      professorId: professorId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function searchGroupsByName(name: string): Promise<Group[]> {
  try {
    // Note: Firestore doesn't support full-text search or partial matches well without external services.
    // We'll use a simple "starts with" query or fetch all if it's small enough (for demo purpose).
    // Or just a direct equality check for now as a "precise search".
    const q = query(
      collection(db, 'groups'),
      where('name', '==', name)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'groups');
    return [];
  }
}
