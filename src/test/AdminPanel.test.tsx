import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminPanel from '../pages/AdminPanel';

const mockUsers = [
  {
    uid: 'user-1',
    email: 'aluno@example.com',
    displayName: 'Aluno Exemplo',
    phone: '85999999999',
    role: 'student',
    isApproved: true,
    createdAt: Date.now(),
  },
];

vi.mock('../services/adminService', () => ({
  getAllUsers: vi.fn(() => Promise.resolve(mockUsers)),
  updateUserRole: vi.fn(() => Promise.resolve()),
  approveUser: vi.fn(() => Promise.resolve()),
  registerUserAccount: vi.fn(() => Promise.resolve()),
  deleteUser: vi.fn(() => Promise.resolve()),
  updateUserProfile: vi.fn(() => Promise.resolve()),
}));

describe('AdminPanel', () => {
  it('allows email input when registering a new user', async () => {
    render(<AdminPanel />);

    fireEvent.click(await screen.findByRole('button', { name: /Cadastrar Aluno/i }));
    const emailInput = screen.getByPlaceholderText('usuario@gmail.com');

    expect(emailInput).not.toHaveAttribute('readonly');
    expect(emailInput).not.toBeDisabled();
  });

  it('keeps email read-only when editing an existing user', async () => {
    render(<AdminPanel />);

    await screen.findByText('Aluno Exemplo');
    fireEvent.click(screen.getByTitle(/Editar/));

    const emailInput = screen.getByPlaceholderText('usuario@gmail.com');
    await waitFor(() => expect(emailInput).toHaveValue('aluno@example.com'));
    expect(emailInput).toHaveAttribute('readonly');
    expect(emailInput).not.toBeDisabled();
  });
});
