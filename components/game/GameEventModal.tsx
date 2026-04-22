'use client';

import { GameEvent } from '@/types/game';
import { ModernCard } from '@/components/modern/ModernCard';
import { getCardSymbol } from '@/lib/truco-logic';

interface GameEventModalProps {
  event: GameEvent | null;
  onDismiss: () => void;
  myTeam?: 1 | 2;
}

export function GameEventModal({ event, onDismiss, myTeam }: GameEventModalProps) {
  if (!event) return null;

  const isMyTeamWinner = myTeam === event.team;
  const teamColor = event.team === 1 ? 'blue' : 'red';

  const getEventContent = () => {
    switch (event.type) {
      case 'round_won':
        return {
          title: `${isMyTeamWinner ? '🎯 VOCÊ GANHOU' : '😔 PERDEU'} A RODADA`,
          subtitle: `${event.winningPlayerName} jogou a carta vencedora!`,
          bgGradient: isMyTeamWinner
            ? 'from-green-500 to-green-700'
            : 'from-gray-500 to-gray-700',
          showCard: true,
        };

      case 'hand_won':
        return {
          title: `${isMyTeamWinner ? '🏆 GANHOU A MÃO!' : '💔 PERDEU A MÃO'}`,
          subtitle: `Time ${event.team} conquistou +${event.points} ${
            event.points === 1 ? 'ponto' : 'pontos'
          }`,
          bgGradient: isMyTeamWinner
            ? 'from-yellow-500 via-orange-500 to-red-500'
            : 'from-gray-600 to-gray-800',
          showCard: false,
        };

      case 'game_won':
        return {
          title: isMyTeamWinner ? '🎉 VITÓRIA! 🎉' : '😢 DERROTA',
          subtitle: `Time ${event.team} venceu o jogo com ${event.points} pontos!`,
          bgGradient: isMyTeamWinner
            ? 'from-purple-500 via-pink-500 to-red-500'
            : 'from-gray-700 to-gray-900',
          showCard: false,
        };

      case 'truco_refused':
        return {
          title: `${isMyTeamWinner ? '✅ TRUCO RECUSADO!' : '🏳️ CORREU DO TRUCO'}`,
          subtitle: `Time ${event.team} ganhou +${event.points} ${
            event.points === 1 ? 'ponto' : 'pontos'
          }`,
          bgGradient: isMyTeamWinner
            ? 'from-green-600 to-green-800'
            : 'from-red-600 to-red-800',
          showCard: false,
        };

      default:
        return {
          title: 'Evento',
          subtitle: '',
          bgGradient: 'from-gray-500 to-gray-700',
          showCard: false,
        };
    }
  };

  const content = getEventContent();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onDismiss}
    >
      <div
        className={`relative max-w-lg w-full mx-4 bg-gradient-to-br ${content.bgGradient} rounded-2xl shadow-2xl p-8 animate-scaleIn transform`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti effect for game won */}
        {event.type === 'game_won' && isMyTeamWinner && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center relative z-10">
          <h2 className="text-4xl font-display font-bold text-white mb-4 animate-pulse">
            {content.title}
          </h2>

          <p className="text-xl text-white/90 mb-6">{content.subtitle}</p>

          {content.showCard && event.winningCard && (
            <div className="flex justify-center mb-6">
              <div className="animate-cardFlip">
                <ModernCard
                  card={event.winningCard}
                  size="xl"
                  isManilha={false}
                />
              </div>
            </div>
          )}

          {event.type === 'hand_won' && (
            <div className="flex justify-center mb-6">
              <div className="text-6xl animate-bounce">
                {isMyTeamWinner ? '🏆' : '💔'}
              </div>
            </div>
          )}

          {event.type === 'game_won' && (
            <div className="flex justify-center mb-6">
              <div className="text-8xl animate-bounce">
                {isMyTeamWinner ? '🎉' : '😢'}
              </div>
            </div>
          )}

          <button
            onClick={onDismiss}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95"
          >
            {event.type === 'game_won' ? 'Voltar ao Lobby' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
