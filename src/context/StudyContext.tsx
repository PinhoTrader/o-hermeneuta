import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Study } from '../types';
import { getStudy, updateStudy, createStudy as createStudyService } from '../services/studyService';
import { useAuth } from './AuthContext';

interface StudyContextType {
  currentStudy: Study | null;
  loading: boolean;
  loadStudy: (studyId: string) => Promise<void>;
  updateCurrentStudy: (updates: Partial<Study>) => Promise<void>;
  createNewStudy: (title: string) => Promise<string>;
  clearStudy: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [currentStudy, setCurrentStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  // Guarda o id do estudo "ativo agora" — usado para descartar respostas
  // assíncronas atrasadas (load antigo, ou recuperação de erro de
  // updateCurrentStudy) que resolvem depois que o usuário já navegou para
  // outro estudo. Ver ARQ-05, cenário 3.
  const activeStudyIdRef = useRef<string | null>(null);

  const loadStudy = async (studyId: string) => {
    activeStudyIdRef.current = studyId;

    if (studyId.startsWith('local_')) {
      const cached = localStorage.getItem(`guest_study_${studyId}`);
      if (cached) {
        setCurrentStudy(JSON.parse(cached));
      }
      return;
    }

    setLoading(true);
    try {
      const study = await getStudy(studyId);
      // Um load mais recente pode já estar em andamento ou concluído -
      // descarta este resultado atrasado nesse caso.
      if (activeStudyIdRef.current !== studyId) return;
      setCurrentStudy(study);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentStudy = async (updates: Partial<Study>) => {
    if (!currentStudy) return;
    const studyIdAtStart = currentStudy.id;

    // Optimistic update
    const updatedStudy = { ...currentStudy, ...updates, updatedAt: Date.now() };
    setCurrentStudy(updatedStudy);

    if (user?.isGuest || currentStudy.id.startsWith('local_')) {
      localStorage.setItem(`guest_study_${currentStudy.id}`, JSON.stringify(updatedStudy));
      return;
    }

    try {
      await updateStudy(currentStudy.id, updates);
    } catch (error) {
      // Revert if error
      console.error("Failed to update study:", error);
      const original = await getStudy(studyIdAtStart);
      // Se o usuário já saiu deste estudo enquanto a releitura de
      // recuperação estava em andamento, não faz sentido sobrescrever o
      // estudo novo com os dados do estudo antigo que falhou.
      if (activeStudyIdRef.current === studyIdAtStart) {
        setCurrentStudy(original);
      }
      throw error;
    }
  };

  const createNewStudy = async (title: string) => {
    if (!user) throw new Error("User not authenticated");

    if (user.isGuest) {
      const id = `local_${Date.now()}`;
      activeStudyIdRef.current = id;
      const newStudy: Study = {
        id,
        userId: user.uid,
        title,
        status: 'draft',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setCurrentStudy(newStudy);
      localStorage.setItem(`guest_study_${id}`, JSON.stringify(newStudy));
      return id;
    }

    setLoading(true);
    try {
      const id = await createStudyService(user.uid, title);
      await loadStudy(id); // loadStudy já atualiza activeStudyIdRef
      return id;
    } finally {
      setLoading(false);
    }
  };

  const clearStudy = () => {
    activeStudyIdRef.current = null;
    setCurrentStudy(null);
  };

  return (
    <StudyContext.Provider value={{ currentStudy, loading, loadStudy, updateCurrentStudy, createNewStudy, clearStudy }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
