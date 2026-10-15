'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEvent } from '@/types/game';

/**
 * Fila de eventos para feedback visual. Eventos que já existiam quando o
 * jogador abriu/recarregou a página são ignorados (não reexibe o histórico).
 */
export function useGameEvents(events: GameEvent[] | undefined) {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const processed = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const [, force] = useState(0);

  useEffect(() => {
    if (!events) return;

    if (!initialized.current) {
      initialized.current = true;
      events.forEach((e) => processed.current.add(e.id));
      force((n) => n + 1);
      return;
    }

    if (currentEvent) return;
    const next = events.find((e) => !processed.current.has(e.id));
    if (next) setCurrentEvent(next);
  }, [events, currentEvent]);

  const dismissCurrentEvent = useCallback(() => {
    setCurrentEvent((cur) => {
      if (cur) processed.current.add(cur.id);
      return null;
    });
  }, []);

  return {
    currentEvent,
    dismissCurrentEvent,
    hasUnprocessedEvents:
      events?.some((e) => !processed.current.has(e.id)) || false,
  };
}
