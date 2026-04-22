'use client';

import { useState, useEffect } from 'react';
import { GameEvent } from '@/types/game';

export function useGameEvents(events: GameEvent[]) {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [processedEvents, setProcessedEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!events || events.length === 0) return;

    // Find the first unprocessed event
    const unprocessedEvent = events.find(
      (event) => !processedEvents.has(event.timestamp)
    );

    if (unprocessedEvent && !currentEvent) {
      setCurrentEvent(unprocessedEvent);
    }
  }, [events, currentEvent, processedEvents]);

  const dismissCurrentEvent = () => {
    if (currentEvent) {
      setProcessedEvents((prev) => new Set(prev).add(currentEvent.timestamp));
      setCurrentEvent(null);
    }
  };

  return {
    currentEvent,
    dismissCurrentEvent,
    hasUnprocessedEvents: events.some(
      (event) => !processedEvents.has(event.timestamp)
    ),
  };
}
