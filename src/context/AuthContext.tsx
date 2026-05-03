import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  deleteDoc,
  limit
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

import { UserProfile, UserRole } from '../types';

export type AuthAction = 'google' | 'guest' | 'signOut' | null;

interface AuthContextType {
  user: (User & { isGuest?: boolean }) | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  authAction: AuthAction;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const GUEST_USER_KEY = 'guest_user';
const AUTH_HEARTBEAT_MS = 15 * 60 * 1000;

function getFriendlyAuthError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code) : '';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Login cancelado. Você pode tentar novamente quando quiser.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Não foi possível conectar ao Google. Verifique sua internet e tente novamente.';
  }

  if (code === 'auth/popup-blocked') {
    return 'O navegador bloqueou a janela de login. Libere pop-ups para este site e tente novamente.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'Este domínio ainda não está autorizado no Firebase Auth. Adicione localhost e o domínio de produção nas configurações do Firebase.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'O login com Google não está habilitado neste projeto Firebase.';
  }

  if (code === 'auth/invalid-api-key' || code === 'auth/app-not-authorized') {
    return 'A configuração do Firebase não está válida para este app. Verifique apiKey, authDomain e domínio autorizado.';
  }

  return 'Não conseguimos concluir o login agora. Tente novamente em instantes.';
}

function createGuestUser() {
  return {
    uid: `guest_${Math.random().toString(36).slice(2, 11)}`,
    displayName: 'Convidado',
    email: 'convidado@cavar.descobrir',
    isGuest: true
  } as User & { isGuest: true };
}

function getStoredGuestUser() {
  const guestData = localStorage.getItem(GUEST_USER_KEY);
  if (!guestData) return null;

  try {
    const guestUser = JSON.parse(guestData) as User & { isGuest?: boolean };
    if (!guestUser?.uid || !guestUser?.isGuest) {
      localStorage.removeItem(GUEST_USER_KEY);
      return null;
    }
    return guestUser;
  } catch {
    localStorage.removeItem(GUEST_USER_KEY);
    return null;
  }
}

function getGuestProfile(guestUser: User & { isGuest?: boolean }): UserProfile {
  return {
    uid: guestUser.uid,
    displayName: guestUser.displayName || 'Convidado',
    email: guestUser.email || 'convidado@cavar.descobrir',
    role: 'guest',
    isApproved: true,
    createdAt: Date.now(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { isGuest?: boolean }) | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authAction, setAuthAction] = useState<AuthAction>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          let userProfile: UserProfile;

          if (!userSnap.exists()) {
            // CHECK FOR PRE-REGISTERED ACCOUNT BY EMAIL
            const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email), limit(1));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              // Found a pre-registered account! Link it.
              const preRegDoc = querySnapshot.docs[0];
              const preRegData = preRegDoc.data();
              
              userProfile = {
                ...preRegData,
                uid: firebaseUser.uid, // Overwrite temp ID with real Google UID
                role: (preRegData.role || 'student').toLowerCase() as UserRole,
              } as UserProfile;

              // Delete old temp doc if the IDs are different
              if (preRegDoc.id !== firebaseUser.uid) {
                await deleteDoc(doc(db, 'users', preRegDoc.id));
              }
              
              await setDoc(userRef, userProfile);
            } else {
              // New user, not pre-registered
              const isAdminEmail = firebaseUser.email === 'escoladetradersead@gmail.com';
              
              userProfile = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'Estudante',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || '',
                role: isAdminEmail ? 'admin' : 'student',
                isApproved: isAdminEmail ? true : false,
                createdAt: Date.now(),
              };
              await setDoc(userRef, {
                ...userProfile,
                createdAt: serverTimestamp(),
              });
            }
          } else {
            const data = userSnap.data();
            const isAdminEmail = firebaseUser.email === 'escoladetradersead@gmail.com';
            
            userProfile = {
              ...data,
              uid: firebaseUser.uid,
              role: (data.role || 'student').toLowerCase() as UserRole,
              createdAt: data.createdAt?.toMillis?.() || data.createdAt,
            } as UserProfile;

            // Force admin promotion for the owner email if not already set
            if (isAdminEmail && (userProfile.role !== 'admin' || !userProfile.isApproved)) {
              userProfile.role = 'admin';
              userProfile.isApproved = true;
              await updateDoc(userRef, { role: 'admin', isApproved: true });
            }
          }

          setUser(firebaseUser);
          setProfile(userProfile);
        } else {
          const guestUser = getStoredGuestUser();
          if (guestUser) {
            setUser(guestUser);
            setProfile(getGuestProfile(guestUser));
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Auth sync error:', error);
        setAuthError('Não conseguimos sincronizar seu perfil. Tente sair e entrar novamente.');
        // Fallback to minimal user info to avoid complete crash
        if (firebaseUser) {
          setUser(firebaseUser);
        }
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const heartbeat = window.setInterval(async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        await currentUser.getIdToken(true);
      } catch (error) {
        console.error('Auth heartbeat failed:', error);
        localStorage.removeItem(GUEST_USER_KEY);
        setUser(null);
        setProfile(null);
        setAuthError('Sua sessão expirou. Faça login novamente para continuar.');
      }
    }, AUTH_HEARTBEAT_MS);

    return () => window.clearInterval(heartbeat);
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    setAuthAction('google');
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      // Guest studies remain stored as guest_study_* for a future migration flow.
      localStorage.removeItem(GUEST_USER_KEY);
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(getFriendlyAuthError(error));
      throw error;
    } finally {
      setAuthAction(null);
    }
  };

  const signInAsGuest = async () => {
    setAuthAction('guest');
    setAuthError(null);
    try {
      const guestUser = createGuestUser();
      localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
      setUser(guestUser);
      setProfile(getGuestProfile(guestUser));
    } catch (error) {
      console.error('Guest login failed:', error);
      setAuthError('Não foi possível iniciar o modo convidado neste navegador.');
      throw error;
    } finally {
      setAuthAction(null);
    }
  };

  const signOut = async () => {
    setAuthAction('signOut');
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem(GUEST_USER_KEY);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthError('Não foi possível sair agora. Tente novamente.');
      throw error;
    } finally {
      setAuthAction(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, authAction, clearAuthError, signInWithGoogle, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
