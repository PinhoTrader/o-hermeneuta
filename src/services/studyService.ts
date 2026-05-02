import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Study } from '../types';

const STUDIES_COLLECTION = 'studies';

export async function createStudy(userId: string, title: string): Promise<string> {
  const studyId = doc(collection(db, STUDIES_COLLECTION)).id;
  const path = `${STUDIES_COLLECTION}/${studyId}`;
  
  try {
    const newStudy = {
      userId,
      title,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, STUDIES_COLLECTION, studyId), newStudy);
    return studyId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return ''; // unreachable
  }
}

export async function getStudy(studyId: string): Promise<Study | null> {
  if (studyId.startsWith('local_')) return null;
  const path = `${STUDIES_COLLECTION}/${studyId}`;
  try {
    const docSnap = await getDoc(doc(db, STUDIES_COLLECTION, studyId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toMillis(),
        updatedAt: (data.updatedAt as Timestamp).toMillis(),
      } as Study;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function listUserStudies(userId: string): Promise<Study[]> {
  const path = STUDIES_COLLECTION;
  try {
    const q = query(
      collection(db, STUDIES_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toMillis(),
        updatedAt: (data.updatedAt as Timestamp).toMillis(),
      } as Study;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function updateStudy(studyId: string, updates: Partial<Study>): Promise<void> {
  const path = `${STUDIES_COLLECTION}/${studyId}`;
  try {
    // Filter out id and userId to prevent accidental changes to invariants
    const { id, userId, createdAt, updatedAt, ...cleanUpdates } = updates as any;
    
    await updateDoc(doc(db, STUDIES_COLLECTION, studyId), {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStudy(studyId: string): Promise<void> {
  const path = `${STUDIES_COLLECTION}/${studyId}`;
  try {
    await deleteDoc(doc(db, STUDIES_COLLECTION, studyId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
