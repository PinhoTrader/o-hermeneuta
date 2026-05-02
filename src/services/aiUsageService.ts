import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTION = 'aiUsage';
const LOCAL_KEY_PREFIX = 'ai_usage';

function isLocalUsage(uid: string) {
  return uid === 'guest' || uid.startsWith('guest_');
}

function getStorageKey(uid: string, studyId: string) {
  return `${LOCAL_KEY_PREFIX}_${uid}_${studyId}`;
}

function getUsageDocId(uid: string, studyId: string) {
  return `${uid}_${studyId}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 256);
}

function readLocalCount(uid: string, studyId: string) {
  const stored = localStorage.getItem(getStorageKey(uid, studyId));
  if (!stored) return 0;

  try {
    const parsed = JSON.parse(stored) as { queryCount?: unknown };
    return typeof parsed.queryCount === 'number' ? parsed.queryCount : 0;
  } catch {
    localStorage.removeItem(getStorageKey(uid, studyId));
    return 0;
  }
}

function writeLocalCount(uid: string, studyId: string, queryCount: number) {
  localStorage.setItem(
    getStorageKey(uid, studyId),
    JSON.stringify({
      uid,
      studyId,
      queryCount,
      lastQueryAt: Date.now(),
    })
  );
}

export async function getQueryCount(uid: string, studyId: string): Promise<number> {
  if (isLocalUsage(uid)) {
    return readLocalCount(uid, studyId);
  }

  const usageRef = doc(db, COLLECTION, getUsageDocId(uid, studyId));
  const usageSnap = await getDoc(usageRef);
  if (!usageSnap.exists()) return 0;

  const queryCount = usageSnap.data().queryCount;
  return typeof queryCount === 'number' ? queryCount : 0;
}

export async function incrementQuery(uid: string, studyId: string): Promise<number> {
  if (isLocalUsage(uid)) {
    const nextCount = readLocalCount(uid, studyId) + 1;
    writeLocalCount(uid, studyId, nextCount);
    return nextCount;
  }

  const usageRef = doc(db, COLLECTION, getUsageDocId(uid, studyId));
  const usageSnap = await getDoc(usageRef);

  if (!usageSnap.exists()) {
    await setDoc(usageRef, {
      uid,
      studyId,
      queryCount: 1,
      lastQueryAt: serverTimestamp(),
    });
    return 1;
  }

  const currentCount = usageSnap.data().queryCount;
  const nextCount = (typeof currentCount === 'number' ? currentCount : 0) + 1;

  await updateDoc(usageRef, {
    queryCount: increment(1),
    lastQueryAt: serverTimestamp(),
  });

  return nextCount;
}

export async function resetQueryCount(uid: string, studyId: string): Promise<void> {
  if (isLocalUsage(uid)) {
    localStorage.removeItem(getStorageKey(uid, studyId));
    return;
  }

  await deleteDoc(doc(db, COLLECTION, getUsageDocId(uid, studyId)));
}

export async function canQuery(uid: string, studyId: string, limit: number): Promise<boolean> {
  if (!Number.isFinite(limit)) return true;
  return (await getQueryCount(uid, studyId)) < limit;
}
