import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../components/ui/Button';

describe('Componente Button', () => {
  it('deve renderizar o texto corretamente', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar a função onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique aqui</Button>);
    fireEvent.click(screen.getByText('Clique aqui'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando a prop disabled é passada', () => {
    render(<Button disabled>Clique aqui</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('deve exibir indicador de carregamento quando loading é true', () => {
    render(<Button loading>Clique aqui</Button>);
    expect(screen.getByText('◌')).toBeInTheDocument();
  });
});
