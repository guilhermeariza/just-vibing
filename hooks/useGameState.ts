import { useEffect, useState, useCallback } from 'react';
import { Room, RoomSummary, GameState } from '@/types/game';

export function useGameState(roomId: string | null, playerId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchRoom = useCallback(async () => {
    if (!roomId || !playerId) return;

    try {
      const response = await fetch(
        `/api/rooms/${roomId}?playerId=${encodeURIComponent(playerId)}`,
        { cache: 'no-store' }
      );
      if (response.status === 404) {
        setNotFound(true);
        return;
      }
      if (!response.ok) throw new Error('Erro ao buscar sala');

      const data = await response.json();
      setNotFound(false);
      setError(null);
      setRoom(data);
      setGameState(data.gameState ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [roomId, playerId]);

  useEffect(() => {
    if (!roomId || !playerId) return;

    fetchRoom();

    // Smart polling: reduz frequência quando tab está inativa
    let pollInterval = 1000; // Intervalo padrão
    let interval: NodeJS.Timeout;

    const startPolling = () => {
      interval = setInterval(fetchRoom, pollInterval);
    };

    const handleVisibilityChange = () => {
      clearInterval(interval);
      if (document.hidden) {
        // Tab inativa: polling mais lento (5s)
        pollInterval = 5000;
      } else {
        // Tab ativa: polling normal (1s)
        pollInterval = 1000;
      }
      startPolling();
    };

    // Inicia polling
    startPolling();

    // Adiciona listener para mudanças de visibilidade
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [roomId, playerId, fetchRoom]);

  return { room, gameState, loading, error, notFound, refetch: fetchRoom };
}

export function useRooms() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch('/api/rooms', { cache: 'no-store' });
      if (!response.ok) throw new Error('Erro ao buscar salas');

      const data = await response.json();
      setRooms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();

    // Smart polling para lista de salas
    let pollInterval = 2000;
    let interval: NodeJS.Timeout;

    const startPolling = () => {
      interval = setInterval(fetchRooms, pollInterval);
    };

    const handleVisibilityChange = () => {
      clearInterval(interval);
      if (document.hidden) {
        // Tab inativa: polling mais lento (10s)
        pollInterval = 10000;
      } else {
        // Tab ativa: polling normal (2s)
        pollInterval = 2000;
      }
      startPolling();
    };

    startPolling();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [fetchRooms]);

  return { rooms, loading, error, refetch: fetchRooms };
}
