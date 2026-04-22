import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CenterPile } from '../CenterPile';
import type { Card } from '@/types/game';

describe('CenterPile', () => {
  const mockPlayers = [
    { id: '1', name: 'João', team: 1 },
    { id: '2', name: 'Maria', team: 2 },
  ];

  const mockCard1: Card = {
    rank: 'A',
    suit: 'ouros',
    value: 8,
  };

  const mockCard2: Card = {
    rank: '7',
    suit: 'copas',
    value: 4,
  };

  it('should show waiting message when no cards played', () => {
    render(
      <CenterPile
        playedCards={[]}
        players={mockPlayers}
        manilhaRank={null}
      />
    );
    expect(screen.getByText('Aguardando jogadas...')).toBeInTheDocument();
  });

  it('should render played cards with player names', () => {
    const playedCards = [
      { playerId: '1', card: mockCard1 },
      { playerId: '2', card: mockCard2 },
    ];

    render(
      <CenterPile
        playedCards={playedCards}
        players={mockPlayers}
        manilhaRank={null}
      />
    );

    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
  });

  it('should highlight winning card', () => {
    const playedCards = [
      { playerId: '1', card: mockCard1 },
      { playerId: '2', card: mockCard2 },
    ];

    const { container } = render(
      <CenterPile
        playedCards={playedCards}
        players={mockPlayers}
        manilhaRank={null}
        lastWinningCard={mockCard1}
      />
    );

    // Check if star emoji exists (winning card indicator)
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('should show team colors for player badges', () => {
    const playedCards = [
      { playerId: '1', card: mockCard1 },
      { playerId: '2', card: mockCard2 },
    ];

    const { container } = render(
      <CenterPile
        playedCards={playedCards}
        players={mockPlayers}
        manilhaRank={null}
      />
    );

    // Team 1 should have blue background
    expect(container.querySelector('.bg-blue-600')).toBeInTheDocument();
    // Team 2 should have red background
    expect(container.querySelector('.bg-red-600')).toBeInTheDocument();
  });

  it('should indicate manilha cards', () => {
    const playedCards = [
      { playerId: '1', card: mockCard1 }, // A is manilha if vira is K
    ];

    const { container } = render(
      <CenterPile
        playedCards={playedCards}
        players={mockPlayers}
        manilhaRank="A"
      />
    );

    // Manilha indicator should be present
    expect(container.querySelector('.border-truco-gold-500')).toBeInTheDocument();
  });
});
