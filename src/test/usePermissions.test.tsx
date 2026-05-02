import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePermissions } from '../hooks/usePermissions';

const authMock = vi.hoisted(() => ({
  value: {
    user: null as any,
    profile: null as any,
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authMock.value,
}));

describe('usePermissions', () => {
  beforeEach(() => {
    authMock.value = { user: null, profile: null };
  });

  it('limits an unauthenticated or local guest user to the visitor access model', () => {
    const { result } = renderHook(() => usePermissions());

    expect(result.current).toMatchObject({
      role: 'guest',
      isGuest: true,
      aiQueryLimit: 3,
      canSaveToCloud: false,
      canDownload: false,
      canPrint: false,
      canAccessHumanInstructor: false,
    });
  });

  it('allows a registered guest to download and use 5 AI queries', () => {
    authMock.value = {
      user: { uid: 'uid-1', isGuest: false },
      profile: { role: 'guest' },
    };

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toMatchObject({
      role: 'guest',
      isGuest: false,
      aiQueryLimit: 5,
      canSaveToCloud: false,
      canDownload: true,
      canPrint: true,
      canAccessHumanInstructor: false,
    });
  });

  it('maps legacy professor and monitor roles to contributor permissions', () => {
    authMock.value = {
      user: { uid: 'uid-1', isGuest: false },
      profile: { role: 'professor' },
    };

    const { result } = renderHook(() => usePermissions());

    expect(result.current.role).toBe('contributor');
    expect(result.current.canAccessHumanInstructor).toBe(true);
    expect(result.current.aiQueryLimit).toBe(Infinity);
  });
});
