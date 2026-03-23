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
