import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import LandingPage from '../pages/LandingPage';

const authMocks = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(),
  signInAsGuest: vi.fn(),
  clearAuthError: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signInWithGoogle: authMocks.signInWithGoogle,
    signInAsGuest: authMocks.signInAsGuest,
    user: null,
    loading: false,
    authError: 'Login cancelado. Você pode tentar novamente quando quiser.',
    authAction: null,
    clearAuthError: authMocks.clearAuthError,
  }),
}));

describe('LandingPage login experience', () => {
  it('shows login guidance, auth errors and guest access', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Entre com Google para salvar na nuvem/)).toBeInTheDocument();
    expect(screen.getByText(/apenas neste navegador/)).toBeInTheDocument();
    expect(screen.getByText(/Login cancelado/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Começar Estudo Grátis/i }));
    expect(authMocks.signInAsGuest).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }));
    expect(authMocks.clearAuthError).toHaveBeenCalledTimes(1);
  });
});
