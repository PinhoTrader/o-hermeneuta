import { useAuth } from '../context/AuthContext';
import { UserRole as ProfileUserRole } from '../types';

export type UserRole = 'guest' | 'student' | 'contributor' | 'admin';

export interface Permissions {
  canSaveToCloud: boolean;
  canDownload: boolean;
  canPrint: boolean;
  canAccessHumanInstructor: boolean;
  aiQueryLimit: number;
  isGuest: boolean;
  role: UserRole | null;
}

function normalizeRole(role?: ProfileUserRole): UserRole {
  if (role === 'admin') return 'admin';
  if (role === 'contributor' || role === 'professor' || role === 'monitor') return 'contributor';
  if (role === 'student') return 'student';
  return 'guest';
}

export function usePermissions(): Permissions {
  const { user, profile } = useAuth();
  const isLocalGuest = !user || Boolean(user.isGuest);

  if (isLocalGuest) {
    return {
      canSaveToCloud: false,
      canDownload: false,
      canPrint: false,
      canAccessHumanInstructor: false,
      aiQueryLimit: 3,
      isGuest: true,
      role: 'guest',
    };
  }

  const role = normalizeRole(profile?.role);

  if (role === 'guest') {
    return {
      canSaveToCloud: false,
      canDownload: true,
      canPrint: true,
      canAccessHumanInstructor: false,
      aiQueryLimit: 5,
      isGuest: false,
      role,
    };
  }

  if (role === 'student') {
    return {
      canSaveToCloud: true,
      canDownload: true,
      canPrint: true,
      canAccessHumanInstructor: false,
      aiQueryLimit: Infinity,
      isGuest: false,
      role,
    };
  }

  return {
    canSaveToCloud: true,
    canDownload: true,
    canPrint: true,
    canAccessHumanInstructor: true,
    aiQueryLimit: Infinity,
    isGuest: false,
    role,
  };
}
