'use client';

import { use, useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Card } from '@/components/Card';
import { getManilha } from '@/lib/truco-logic';
import { useRouter } from 'next/navigation';

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const { room, gameState, refetch } = useGameState(roomId);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
    try {
      await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
      });
      refetch();
    } catch (error) {
      alert('Erro ao iniciar jogo. Verifique se todos estão prontos.');
    }
  };

  const playCard = async (cardIndex: number) => {
    if (!playerId || !gameState) return;

    const currentPlayerInGame = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayerInGame.id !== playerId) {
      alert('Não é sua vez!');
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
      console.error('Erro ao jogar carta:', error);
    }
  };

  const callTruco = async () => {
    if (!playerId) return;

    try {
      await fetch(`/api/game/${roomId}/truco`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      refetch();
    } catch (error) {
      alert('Não foi possível pedir truco');
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
        <div className="text-white text-2xl">Carregando...</div>
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
                  <div className="space-y-2">
                    {team1.map((player) => (
                      <div
                        key={player.id}
                        className={`p-2 rounded ${
                          player.isReady ? 'bg-green-100 border-green-300' : 'bg-white border-gray-300'
                        } border`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{player.name}</span>
                          {player.isReady && <span className="text-green-600 text-sm">✓ Pronto</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-3 text-center">Time 2</h3>
                {team2.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm">Aguardando jogadores...</p>
                ) : (
                  <div className="space-y-2">
                    {team2.map((player) => (
                      <div
                        key={player.id}
                        className={`p-2 rounded ${
                          player.isReady ? 'bg-green-100 border-green-300' : 'bg-white border-gray-300'
                        } border`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{player.name}</span>
                          {player.isReady && <span className="text-green-600 text-sm">✓ Pronto</span>}
                        </div>
                      </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Placar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={`${myTeam === 1 ? 'bg-blue-100' : 'bg-gray-50'} p-3 rounded-lg`}>
              <div className="text-sm text-gray-600">Time 1</div>
              <div className="text-3xl font-bold text-blue-600">{team1Score}</div>
              <div className="text-xs text-gray-500">Rounds: {team1RoundsWon}</div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-sm text-gray-600 mb-1">Mão {gameState.currentRound}</div>
              <div className="text-lg font-bold text-gray-800">
                {gameState.trucoState === 'none' ? '1 ponto' : gameState.trucoState.toUpperCase()}
              </div>
              {gameState.vira && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Vira</div>
                  <Card card={gameState.vira} size="sm" />
                  {manilhaRank && (
                    <div className="text-xs text-gray-600 mt-1">Manilha: {manilhaRank}</div>
                  )}
                </div>
              )}
            </div>

            <div className={`${myTeam === 2 ? 'bg-red-100' : 'bg-gray-50'} p-3 rounded-lg`}>
              <div className="text-sm text-gray-600">Time 2</div>
              <div className="text-3xl font-bold text-red-600">{team2Score}</div>
              <div className="text-xs text-gray-500">Rounds: {team2RoundsWon}</div>
            </div>
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
                    <Card card={played.card} size="md" />
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
                <Card
                  key={idx}
                  card={card}
                  onClick={() => playCard(idx)}
                  disabled={!isMyTurn}
                  size="lg"
                />
              ))}
            </div>

            {/* Botões de ação */}
            <div className="mt-6 space-y-2">
              <button
                onClick={callTruco}
                disabled={gameState.waitingForResponse || gameState.trucoState === 'doze'}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold text-lg transition-colors"
              >
                TRUCO! 🔥
              </button>

              {gameState.waitingForResponse && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <p className="text-center font-semibold mb-3">Adversário pediu truco!</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => respondTruco(true)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => respondTruco(false)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
                    >
                      Recusar
                    </button>
                  </div>
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
