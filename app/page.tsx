'use client';

import { useState } from 'react';
import { useRooms } from '@/hooks/useGameState';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { rooms, loading } = useRooms();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const createRoom = async () => {
    if (!roomName.trim() || !playerName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName }),
      });

      if (!response.ok) throw new Error('Erro ao criar sala');

      const room = await response.json();

      // Entrar na sala automaticamente
      const joinResponse = await fetch(`/api/rooms/${room.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName }),
      });

      if (!joinResponse.ok) throw new Error('Erro ao entrar na sala');

      const { player } = await joinResponse.json();

      // Salvar ID do jogador no localStorage
      localStorage.setItem('playerId', player.id);
      localStorage.setItem('playerName', player.name);

      router.push(`/room/${room.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao criar sala');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    const name = prompt('Digite seu nome:');
    if (!name) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });

      if (!response.ok) throw new Error('Erro ao entrar na sala');

      const { player } = await response.json();

      localStorage.setItem('playerId', player.id);
      localStorage.setItem('playerName', player.name);

      router.push(`/room/${roomId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao entrar na sala');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold text-white mb-2">🃏 Truco Online</h1>
          <p className="text-green-200">Jogue truco com seus amigos em tempo real</p>
        </header>

        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Salas Disponíveis</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {showCreateForm ? 'Cancelar' : '+ Nova Sala'}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Criar Nova Sala</h3>
              <input
                type="text"
                placeholder="Nome da sala"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Seu nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={createRoom}
                disabled={creating || !roomName.trim() || !playerName.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {creating ? 'Criando...' : 'Criar e Entrar'}
              </button>
            </div>
          )}

          {loading && rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Carregando salas...</div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma sala disponível. Crie uma nova sala para começar!
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{room.name}</h3>
                    <p className="text-sm text-gray-600">
                      {room.players.length}/{room.maxPlayers} jogadores
                      {room.gameState?.gameStarted && (
                        <span className="ml-2 text-yellow-600 font-semibold">• Em jogo</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => joinRoom(room.id)}
                    disabled={room.players.length >= room.maxPlayers || room.gameState?.gameStarted}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {room.players.length >= room.maxPlayers ? 'Cheia' : 'Entrar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="text-center text-green-200 text-sm">
          <p>Desenvolvido com Next.js • Mobile First • Multiplayer</p>
        </footer>
      </div>
    </div>
  );
}
