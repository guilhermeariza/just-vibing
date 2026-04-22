import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModernCard } from '../ModernCard';
import type { Card } from '@/types/game';

describe('ModernCard', () => {
  const mockCard: Card = {
    rank: 'A',
    suit: 'ouros',
    value: 8,
  };

  it('should render card with correct rank and suit', () => {
    render(<ModernCard card={mockCard} />);
    expect(screen.getByLabelText('A ouros')).toBeInTheDocument();
  });

  it('should render face down card', () => {
    render(<ModernCard card={mockCard} faceDown />);
    expect(screen.getByLabelText('Carta virada para baixo')).toBeInTheDocument();
  });

  it('should show manilha indicator when isManilha is true', () => {
    const { container } = render(<ModernCard card={mockCard} isManilha />);
    expect(container.querySelector('.border-truco-gold-500')).toBeInTheDocument();
  });

  it('should call onClick when clicked and not disabled', () => {
    const handleClick = vi.fn();
    render(<ModernCard card={mockCard} onClick={handleClick} />);
    screen.getByLabelText('A ouros').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<ModernCard card={mockCard} onClick={handleClick} disabled />);
    screen.getByLabelText('A ouros').click();
    expect(handleClick).not.toHaveBeenCalled();
  });
});
