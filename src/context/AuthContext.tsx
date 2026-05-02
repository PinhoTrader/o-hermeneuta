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

interface AuthContextType {
  user: (User & { isGuest?: boolean }) | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { isGuest?: boolean }) | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
          const guestData = localStorage.getItem('guest_user');
          if (guestData) {
            const guestUser = JSON.parse(guestData);
            setUser(guestUser);
            setProfile({
              uid: guestUser.uid,
              displayName: guestUser.displayName,
              email: guestUser.email,
              role: 'student',
              isApproved: true,
              createdAt: Date.now(),
            });
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Auth sync error:', error);
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      localStorage.removeItem('guest_user');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const signInAsGuest = async () => {
    const guestUser = {
      uid: `guest_${Math.random().toString(36).substr(2, 9)}`,
      displayName: 'Convidado',
      email: 'convidado@cavar.descobrir',
      isGuest: true
    } as any;
    
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('guest_user');
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInAsGuest, signOut }}>
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
