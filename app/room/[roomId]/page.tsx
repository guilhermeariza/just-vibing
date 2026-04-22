'use client';

import { use, useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { ModernCard } from '@/components/modern/ModernCard';
import { PlayerAvatar } from '@/components/modern/PlayerAvatar';
import { TrucoButton } from '@/components/modern/TrucoButton';
import { AnimatedScore } from '@/components/modern/AnimatedScore';
import { getManilha } from '@/lib/truco-logic';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LoadingSpinner, PlayerCardSkeleton, Spinner } from '@/components/Loading';

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const { room, gameState, refetch } = useGameState(roomId);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // SSR-safe check
    if (typeof window === 'undefined') return;

    const id = localStorage.getItem('playerId');
    if (!id) {
      router.push('/');
      return;
    }
    setPlayerId(id);
  }, [router]);

  const currentPlayer = room?.players.find((p) => p.id === playerId);
  const myTeam = currentPlayer?.team;

  const toggleReady = async () => {
    if (!playerId) return;

    try {
      await fetch(`/api/rooms/${roomId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, ready: !isReady }),
      });
      setIsReady(!isReady);
      refetch();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const startGame = async () => {
    const toastId = toast.loading('Iniciando jogo...');
    try {
      const response = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Verifique se todos estão prontos');
      }

      toast.success('Jogo iniciado!', { id: toastId });
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao iniciar jogo',
        { id: toastId }
      );
    }
  };

  const playCard = async (cardIndex: number) => {
    if (!playerId || !gameState) return;

    const currentPlayerInGame = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayerInGame.id !== playerId) {
      toast.error('Não é sua vez!');
      return;
    }

    try {
      await fetch(`/api/game/${roomId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cardIndex }),
      });
      refetch();
    } catch (error) {
      toast.error('Erro ao jogar carta');
      console.error('Erro ao jogar carta:', error);
    }
  };

  const callTruco = async () => {
    if (!playerId) return;

    try {
      const response = await fetch(`/api/game/${roomId}/truco`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível pedir truco');
      }

      toast.success('Truco pedido! 🔥');
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível pedir truco'
      );
    }
  };

  const respondTruco = async (accept: boolean) => {
    if (!playerId) return;

    try {
      await fetch(`/api/game/${roomId}/truco/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, accept }),
      });
      refetch();
    } catch (error) {
      console.error('Erro ao responder truco:', error);
    }
  };

  const leaveRoom = async () => {
    if (!playerId) return;

    try {
      await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      router.push('/');
    } catch (error) {
      console.error('Erro ao sair da sala:', error);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
        <LoadingSpinner message="Carregando sala..." />
      </div>
    );
  }

  // Lobby (antes do jogo começar)
  if (!gameState || !gameState.gameStarted) {
    const team1 = room.players.filter((p) => p.team === 1);
    const team2 = room.players.filter((p) => p.team === 2);
    const allReady = room.players.every((p) => p.isReady);
    const canStart = room.players.length >= 2 && allReady;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center py-6">
            <h1 className="text-4xl font-bold text-white mb-2">{room.name}</h1>
            <p className="text-green-200">
              {room.players.length}/{room.maxPlayers} jogadores
            </p>
          </header>

          <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Lobby</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-3 text-center">Time 1</h3>
                {team1.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm">Aguardando jogadores...</p>
                ) : (
                  <div className="space-y-3">
                    {team1.map((player) => (
                      <PlayerAvatar
                        key={player.id}
                        name={player.name}
                        team={1}
                        isReady={player.isReady}
                        isSelf={player.id === playerId}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-3 text-center">Time 2</h3>
                {team2.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm">Aguardando jogadores...</p>
                ) : (
                  <div className="space-y-3">
                    {team2.map((player) => (
                      <PlayerAvatar
                        key={player.id}
                        name={player.name}
                        team={2}
                        isReady={player.isReady}
                        isSelf={player.id === playerId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={toggleReady}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  isReady
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isReady ? 'Cancelar (Não Pronto)' : 'Marcar como Pronto'}
              </button>

              {canStart && (
                <button
                  onClick={startGame}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Iniciar Jogo
                </button>
              )}

              <button
                onClick={leaveRoom}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Sair da Sala
              </button>
            </div>

            {!allReady && (
              <p className="text-center text-gray-600 text-sm mt-4">
                Aguardando todos os jogadores ficarem prontos...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Jogo em andamento
  const manilhaRank = gameState.vira ? getManilha(gameState.vira) : null;
  const currentPlayerInGame = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayerInGame.id === playerId;

  const team1Score = gameState.score.team1;
  const team2Score = gameState.score.team2;
  const team1RoundsWon = gameState.roundsWon.team1;
  const team2RoundsWon = gameState.roundsWon.team2;

  // Verifica se o jogador pode responder ao truco (é do time adversário)
  const canRespondTruco = gameState.waitingForResponse &&
    gameState.trucoCalledBy !== undefined &&
    gameState.trucoCalledBy !== myTeam;

  // Nome do estado do truco para exibição
  const trucoStateNames: Record<string, string> = {
    'none': 'Valendo 1 ponto',
    'truco': 'TRUCO (3 pontos)',
    'seis': 'SEIS (6 pontos)',
    'nove': 'NOVE (9 pontos)',
    'doze': 'DOZE (12 pontos)',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Placar Principal */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4" role="region" aria-label="Placar do jogo">
          <div className="text-center mb-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase">Jogo até 12 pontos</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div
              className={`${myTeam === 1 ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'} p-4 rounded-lg text-center`}
              role="status"
              aria-label={`Time 1: ${team1Score} pontos, ${team1RoundsWon} mãos ganhas`}
            >
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {myTeam === 1 ? '👥 Time 1 (VOCÊ)' : 'Time 1'}
              </div>
              <AnimatedScore score={team1Score} teamColor="blue" />
              <div className="text-xs text-gray-500 mt-1" aria-hidden="true">
                Mãos ganhas na rodada: {team1RoundsWon}/2
              </div>
            </div>

            <div
              className={`${myTeam === 2 ? 'bg-red-100 border-2 border-red-400' : 'bg-gray-50'} p-4 rounded-lg text-center`}
              role="status"
              aria-label={`Time 2: ${team2Score} pontos, ${team2RoundsWon} mãos ganhas`}
            >
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {myTeam === 2 ? '👥 Time 2 (VOCÊ)' : 'Time 2'}
              </div>
              <AnimatedScore score={team2Score} teamColor="red" />
              <div className="text-xs text-gray-500 mt-1" aria-hidden="true">
                Mãos ganhas na rodada: {team2RoundsWon}/2
              </div>
            </div>
          </div>
        </div>

        {/* Aviso de Mão de 11 ou Mão de Ferro */}
        {(gameState.isMaoDe11?.team1 || gameState.isMaoDe11?.team2 || gameState.isMaoDeFerro) && (
          <div className={`${
            gameState.isMaoDeFerro
              ? 'bg-gradient-to-r from-purple-600 to-purple-800'
              : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
          } rounded-lg shadow-lg p-4 mb-4 text-white animate-pulse`}>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {gameState.isMaoDeFerro ? '⚔️ MÃO DE FERRO ⚔️' : '⚡ MÃO DE 11 ⚡'}
              </div>
              <div className="text-sm">
                {gameState.isMaoDeFerro
                  ? 'Ambos os times têm 11 pontos! Esta mão vale automaticamente 3 pontos.'
                  : `${gameState.isMaoDe11?.team1 ? 'Time 1' : 'Time 2'} está com 11 pontos! Não pode pedir truco.`}
              </div>
            </div>
          </div>
        )}

        {/* Estado da Aposta e Vira */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-4 mb-4 text-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">Rodada Atual</div>
              <div className="text-3xl font-bold">
                {trucoStateNames[gameState.trucoState]}
              </div>
              <div className="text-xs opacity-75 mt-1">Mão {gameState.currentRound}/3</div>
            </div>
            {gameState.vira && (
              <div className="flex flex-col items-center justify-center">
                <div className="text-xs opacity-90 mb-1">Vira</div>
                <ModernCard card={gameState.vira} size="md" faceDown={false} />
                {manilhaRank && (
                  <div className="text-xs font-bold mt-1 bg-white text-orange-600 px-2 py-1 rounded">
                    Manilha: {manilhaRank}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cartas jogadas na mesa */}
        <div className="bg-green-700 rounded-lg shadow-lg p-6 mb-4 min-h-[200px] flex items-center justify-center">
          {gameState.playedCards.length === 0 ? (
            <p className="text-green-200">Aguardando jogadas...</p>
          ) : (
            <div className="flex gap-4 flex-wrap justify-center">
              {gameState.playedCards.map((played, idx) => {
                const player = gameState.players.find((p) => p.id === played.playerId);
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <ModernCard
                      card={played.card}
                      size="lg"
                      isManilha={manilhaRank ? played.card.rank === manilhaRank : false}
                    />
                    <div className="text-white text-sm mt-2">{player?.name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Indicador de turno */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <p className="text-center font-semibold">
            {isMyTurn ? (
              <span className="text-green-600 text-lg">🎯 SUA VEZ!</span>
            ) : (
              <span className="text-gray-600">
                Vez de: {currentPlayerInGame.name} (Time {currentPlayerInGame.team})
              </span>
            )}
          </p>
        </div>

        {/* Mão do jogador */}
        {currentPlayer && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-center font-semibold text-gray-800 mb-4">Suas Cartas</h3>
            <div className="flex gap-4 justify-center flex-wrap">
              {currentPlayer.hand.map((card, idx) => (
                <ModernCard
                  key={idx}
                  card={card}
                  onClick={() => playCard(idx)}
                  disabled={!isMyTurn}
                  size="xl"
                  isManilha={manilhaRank ? card.rank === manilhaRank : false}
                />
              ))}
            </div>

            {/* Botões de ação */}
            <div className="mt-6 space-y-2">
              {!gameState.waitingForResponse && (
                <TrucoButton
                  variant="call"
                  onClick={callTruco}
                  disabled={gameState.trucoState === 'doze'}
                />
              )}

              {/* Mostra apenas para o time adversário */}
              {canRespondTruco && (
                <div className="bg-yellow-50 border-4 border-yellow-400 rounded-lg p-4 animate-pulse">
                  <p className="text-center font-bold text-lg mb-3 text-gray-800">
                    ⚡ Time adversário pediu {gameState.trucoState === 'none' ? 'TRUCO' :
                      gameState.trucoState === 'truco' ? 'SEIS' :
                      gameState.trucoState === 'seis' ? 'NOVE' : 'DOZE'}! ⚡
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <TrucoButton
                      variant="accept"
                      onClick={() => respondTruco(true)}
                    />
                    <TrucoButton
                      variant="refuse"
                      onClick={() => respondTruco(false)}
                    />
                  </div>
                </div>
              )}

              {/* Aviso para quem está esperando a resposta */}
              {gameState.waitingForResponse && !canRespondTruco && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                  <p className="text-center font-semibold text-blue-800">
                    ⏳ Aguardando time adversário responder ao pedido de truco...
                  </p>
                </div>
              )}

              <button
                onClick={leaveRoom}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Sair do Jogo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
