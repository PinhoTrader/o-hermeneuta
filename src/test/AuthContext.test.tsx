import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

const mocks = vi.hoisted(() => ({
  authStateCallback: null as null | ((user: any) => void),
  onAuthStateChanged: vi.fn((auth, callback) => {
    mocks.authStateCallback = callback;
    return vi.fn();
  }),
  signInWithPopup: vi.fn(),
  firebaseSignOut: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
  signInWithPopup: mocks.signInWithPopup,
  GoogleAuthProvider: vi.fn().mockImplementation(function GoogleAuthProvider() {
    return { setCustomParameters: vi.fn() };
  }),
  signOut: mocks.firebaseSignOut,
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((...segments) => ({ id: segments.at(-1), path: segments.join('/') })),
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
  updateDoc: mocks.updateDoc,
  serverTimestamp: vi.fn(() => ({ __serverTimestamp: true })),
  query: vi.fn((...args) => ({ args })),
  collection: vi.fn((db, path) => ({ path })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  getDocs: mocks.getDocs,
  deleteDoc: mocks.deleteDoc,
  limit: vi.fn((value) => ({ value })),
}));

function AuthHarness() {
  const { user, profile, loading, authError, authAction, signInWithGoogle, signInAsGuest, signOut } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.email || 'none'}</span>
      <span data-testid="profile">{profile?.displayName || 'none'}</span>
      <span data-testid="error">{authError || 'none'}</span>
      <span data-testid="action">{authAction || 'none'}</span>
      <button onClick={() => signInWithGoogle().catch(() => undefined)}>google</button>
      <button onClick={() => signInAsGuest().catch(() => undefined)}>guest</button>
      <button onClick={() => signOut().catch(() => undefined)}>logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthHarness />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.authStateCallback = null;
    mocks.signInWithPopup.mockResolvedValue({});
    mocks.firebaseSignOut.mockResolvedValue(undefined);
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.getDocs.mockResolvedValue({ empty: true, docs: [] });
  });

  it('loads a Google user and creates a pending profile when needed', async () => {
    renderAuth();

    await act(async () => {
      mocks.authStateCallback?.({
        uid: 'uid-1',
        email: 'novo@example.com',
        displayName: 'Novo Aluno',
        photoURL: '',
        isGuest: false,
      });
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('novo@example.com');
    expect(screen.getByTestId('profile')).toHaveTextContent('Novo Aluno');
    expect(mocks.setDoc).toHaveBeenCalled();
  });

  it('stores guest login locally and exposes the guest profile', async () => {
    renderAuth();
    await act(async () => mocks.authStateCallback?.(null));

    fireEvent.click(screen.getByRole('button', { name: 'guest' }));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('convidado@cavar.descobrir'));
    expect(screen.getByTestId('profile')).toHaveTextContent('Convidado');
    expect(localStorage.getItem('guest_user')).toContain('guest_');
  });

  it('removes corrupted guest data without breaking auth sync', async () => {
    localStorage.setItem('guest_user', '{broken');
    renderAuth();

    await act(async () => mocks.authStateCallback?.(null));

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(localStorage.getItem('guest_user')).toBeNull();
  });

  it('shows a friendly error when the Google popup is closed', async () => {
    mocks.signInWithPopup.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    renderAuth();
    await act(async () => mocks.authStateCallback?.(null));

    fireEvent.click(screen.getByRole('button', { name: 'google' }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Login cancelado'));
  });

  it('signs out and clears guest state', async () => {
    localStorage.setItem('guest_user', '{"uid":"guest_1","email":"convidado@cavar.descobrir","displayName":"Convidado","isGuest":true}');
    renderAuth();
    await act(async () => mocks.authStateCallback?.(null));

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    expect(localStorage.getItem('guest_user')).toBeNull();
    expect(mocks.firebaseSignOut).toHaveBeenCalled();
  });
});
