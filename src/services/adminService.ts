import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy, 
  setDoc,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
  } catch (error) {
    console.warn('Failed to fetch users with sorting, trying without sorting...', error);
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.LIST, 'users');
      return [];
    }
  }
}

export async function updateUserRole(uid: string, role: UserRole) {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function approveUser(uid: string) {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { isApproved: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUser(uid: string) {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function registerUserAccount(data: { email: string, name: string, phone: string, role: UserRole }) {
  try {
    // Normalizado (trim + lowercase) porque o e-mail vira o ID do doc de
    // pré-cadastro (ver abaixo) e a regra de create em firestore.rules
    // localiza esse doc pelo caminho users/{request.auth.token.email} -
    // sem essa normalização, uma diferença de caixa entre o que o admin
    // digitou aqui e o que o Google devolve no login quebraria o vínculo.
    const normalizedEmail = data.email.trim().toLowerCase();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', normalizedEmail));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'users', existingDoc.id), {
        role: data.role,
        isApproved: true,
        phone: data.phone,
        displayName: data.name
      });
    } else {
      // ID determinístico = e-mail (minúsculo) do convidado, em vez de um ID
      // aleatório. Isso permite que firestore.rules encontre este pré-cadastro
      // por caminho conhecido (exists()/get(), sem query) quando o convidado
      // logar pela primeira vez e AuthContext.tsx tentar vincular a conta real.
      const pendingId = normalizedEmail;
      const newUserRef = doc(db, 'users', pendingId);
      const newUser = {
        uid: newUserRef.id,
        email: normalizedEmail,
        displayName: data.name,
        phone: data.phone,
        role: data.role,
        isApproved: true,
        createdAt: serverTimestamp()
      };
      await setDoc(newUserRef, newUser);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
}
