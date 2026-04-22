import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerAvatar } from '../PlayerAvatar';

describe('PlayerAvatar', () => {
  it('should render player name', () => {
    render(<PlayerAvatar name="João Silva" team={1} />);
    expect(screen.getByText(/João Silva/)).toBeInTheDocument();
  });

  it('should show initials in avatar', () => {
    render(<PlayerAvatar name="João Silva" team={1} />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('should show ready status when isReady is true', () => {
    render(<PlayerAvatar name="João" team={1} isReady />);
    expect(screen.getByText('Pronto')).toBeInTheDocument();
  });

  it('should indicate current turn with target emoji', () => {
    render(<PlayerAvatar name="João" team={1} isCurrentTurn />);
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('should show "Você" label when isSelf is true', () => {
    render(<PlayerAvatar name="João" team={1} isSelf />);
    expect(screen.getByText(/\(Você\)/)).toBeInTheDocument();
  });

  it('should apply correct team colors', () => {
    const { container } = render(<PlayerAvatar name="João" team={1} />);
    expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();
  });
});
