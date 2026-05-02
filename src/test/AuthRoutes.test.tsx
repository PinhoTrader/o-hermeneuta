import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminRoute, ProtectedRoute } from '../components/AuthRoutes';

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock('../context/AuthContext', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/Layout', () => ({ Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

function renderProtected(authValue: any) {
  mockUseAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/" element={<div>Landing</div>} />
        <Route path="/dashboard" element={<ProtectedRoute><div>Protected Dashboard</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to the landing page', () => {
    renderProtected({ user: null, profile: null, loading: false, signOut: vi.fn(), authAction: null });

    expect(screen.getByText('Landing')).toBeInTheDocument();
  });

  it('shows pending approval for unapproved Google users', () => {
    renderProtected({
      user: { email: 'pendente@example.com', isGuest: false },
      profile: { isApproved: false, role: 'student', email: 'pendente@example.com' },
      loading: false,
      signOut: vi.fn(),
      authAction: null,
    });

    expect(screen.getByText(/Aguardando/)).toBeInTheDocument();
    expect(screen.getByText('Pendente de aprovação')).toBeInTheDocument();
    expect(screen.getByText('pendente@example.com')).toBeInTheDocument();
  });

  it('allows admin users into AdminRoute', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'admin@example.com' },
      profile: { role: 'admin', isApproved: true },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/admin" element={<AdminRoute><div>Admin Area</div></AdminRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Area')).toBeInTheDocument();
  });
});
