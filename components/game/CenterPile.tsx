'use client';

import { Card } from '@/types/game';
import { ModernCard } from '@/components/modern/ModernCard';

interface PlayedCard {
  playerId: string;
  card: Card;
}

interface CenterPileProps {
  playedCards: PlayedCard[];
  players: Array<{ id: string; name: string; team: number }>;
  manilhaRank: string | null;
  lastWinningCard?: Card;
}

export function CenterPile({ playedCards, players, manilhaRank, lastWinningCard }: CenterPileProps) {
  if (playedCards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🃏</div>
          <p className="text-green-200 text-lg font-semibold">Aguardando jogadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 justify-center items-center min-h-[300px] p-6">
      {playedCards.map((played, idx) => {
        const player = players.find((p) => p.id === played.playerId);
        const isWinningCard = lastWinningCard &&
          played.card.rank === lastWinningCard.rank &&
          played.card.suit === lastWinningCard.suit;

        return (
          <div
            key={idx}
            className="flex flex-col items-center gap-2 animate-scaleIn"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div
              className={`relative transform transition-all duration-300 ${
                isWinningCard ? 'scale-110 animate-glow-pulse' : ''
              }`}
            >
              <ModernCard
                card={played.card}
                size="xl"
                isManilha={manilhaRank ? played.card.rank === manilhaRank : false}
                isWinning={isWinningCard}
              />
              {isWinningCard && (
                <div className="absolute -top-3 -right-3 text-3xl animate-bounce">
                  ⭐
                </div>
              )}
            </div>
            <div
              className={`text-white font-semibold text-sm px-3 py-1 rounded-full ${
                player?.team === 1 ? 'bg-blue-600' : 'bg-red-600'
              }`}
            >
              {player?.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
