import { useEffect, useState, useCallback } from 'react';
import { Room, GameState } from '@/types/game';

export function useGameState(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      if (!response.ok) throw new Error('Erro ao buscar sala');

      const data = await response.json();
      setRoom(data);

      if (data.gameState) {
        setGameState(data.gameState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    fetchRoom();

    // Poll para atualizações
    const interval = setInterval(fetchRoom, 1000);

    return () => clearInterval(interval);
  }, [roomId, fetchRoom]);

  return { room, gameState, loading, error, refetch: fetchRoom };
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rooms');
      if (!response.ok) throw new Error('Erro ao buscar salas');

      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 2000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  return { rooms, loading, error, refetch: fetchRooms };
}
