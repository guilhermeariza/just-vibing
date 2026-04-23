'use client';

import { GameEvent } from '@/types/game';
import { ModernCard } from '@/components/modern/ModernCard';

interface RoundHistoryProps {
  events: GameEvent[] | undefined;
  myTeam?: 1 | 2;
}

export function RoundHistory({ events, myTeam }: RoundHistoryProps) {
  // Filtrar apenas eventos de rodadas ganhas (últimas 6)
  const roundEvents = (events || [])
    .filter((e) => e.type === 'round_won')
    .slice(-6)
    .reverse();

  if (roundEvents.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
          <span>📜</span>
          <span>Histórico</span>
        </h3>
        <p className="text-white/60 text-xs text-center py-4">
          Nenhuma rodada jogada ainda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
        <span>📜</span>
        <span>Últimas Rodadas</span>
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
        {roundEvents.map((event, idx) => {
          const isMyTeamWin = event.team === myTeam;
          const teamColor = event.team === 1 ? 'blue' : 'red';

          return (
            <div
              key={event.timestamp}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                isMyTeamWin
                  ? 'bg-green-500/20 border border-green-400/30'
                  : 'bg-gray-500/20 border border-gray-400/30'
              }`}
            >
              <div className="flex-shrink-0">
                {event.winningCard && (
                  <div className="w-12">
                    <ModernCard
                      card={event.winningCard}
                      size="sm"
                      isManilha={false}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold ${isMyTeamWin ? 'text-green-300' : 'text-gray-300'}`}>
                  {isMyTeamWin ? '✓ Você ganhou' : '✗ Adversário ganhou'}
                </div>
                <div className="text-xs text-white/70 truncate">
                  {event.winningPlayerName}
                </div>
              </div>
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  teamColor === 'blue' ? 'bg-blue-600' : 'bg-red-600'
                }`}
              >
                {event.team}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
