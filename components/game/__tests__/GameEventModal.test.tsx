import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameEventModal } from '../GameEventModal';
import { GameEvent } from '@/types/game';
import type { Card } from '@/types/game';

describe('GameEventModal', () => {
  const mockCard: Card = {
    rank: 'A',
    suit: 'ouros',
    value: 8,
  };

  it('should not render when event is null', () => {
    const { container } = render(
      <GameEventModal event={null} onDismiss={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render round won event', () => {
    const event: GameEvent = {
      type: 'round_won',
      team: 1,
      winningCard: mockCard,
      winningPlayerName: 'João',
      timestamp: Date.now(),
    };

    render(<GameEventModal event={event} onDismiss={() => {}} myTeam={1} />);
    expect(screen.getByText(/VOCÊ GANHOU.*RODADA/i)).toBeInTheDocument();
    expect(screen.getByText(/João jogou a carta vencedora/i)).toBeInTheDocument();
  });

  it('should render hand won event with points', () => {
    const event: GameEvent = {
      type: 'hand_won',
      team: 2,
      points: 3,
      timestamp: Date.now(),
    };

    render(<GameEventModal event={event} onDismiss={() => {}} myTeam={1} />);
    expect(screen.getByText(/PERDEU A MÃO/i)).toBeInTheDocument();
    expect(screen.getByText(/\+3.*pontos/i)).toBeInTheDocument();
  });

  it('should render game won event', () => {
    const event: GameEvent = {
      type: 'game_won',
      team: 1,
      points: 12,
      timestamp: Date.now(),
    };

    render(<GameEventModal event={event} onDismiss={() => {}} myTeam={1} />);
    expect(screen.getByText(/VITÓRIA/i)).toBeInTheDocument();
    expect(screen.getByText(/Voltar ao Lobby/i)).toBeInTheDocument();
  });

  it('should render truco refused event', () => {
    const event: GameEvent = {
      type: 'truco_refused',
      team: 1,
      points: 1,
      timestamp: Date.now(),
    };

    render(<GameEventModal event={event} onDismiss={() => {}} myTeam={1} />);
    expect(screen.getByText(/TRUCO RECUSADO/i)).toBeInTheDocument();
  });

  it('should call onDismiss when clicking backdrop', () => {
    const handleDismiss = vi.fn();
    const event: GameEvent = {
      type: 'round_won',
      team: 1,
      winningPlayerName: 'João',
      timestamp: Date.now(),
    };

    const { container } = render(
      <GameEventModal event={event} onDismiss={handleDismiss} myTeam={1} />
    );

    const backdrop = container.firstChild as HTMLElement;
    backdrop.click();
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it('should show different message for losing team', () => {
    const event: GameEvent = {
      type: 'round_won',
      team: 2,
      winningPlayerName: 'Maria',
      timestamp: Date.now(),
    };

    render(<GameEventModal event={event} onDismiss={() => {}} myTeam={1} />);
    expect(screen.getByText(/PERDEU.*RODADA/i)).toBeInTheDocument();
  });
});
