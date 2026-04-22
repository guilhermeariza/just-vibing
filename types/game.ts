export type Suit = 'ouros' | 'espadas' | 'copas' | 'paus';
export type Rank = '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // Valor para comparação no truco
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  team: 1 | 2;
  isReady: boolean;
}

export type GameEventType = 'round_won' | 'hand_won' | 'game_won' | 'truco_refused';

export interface GameEvent {
  type: GameEventType;
  team: 1 | 2;
  winningCard?: Card;
  winningPlayerName?: string;
  points?: number;
  timestamp: number;
}

export interface GameState {
  id: string;
  players: Player[];
  currentRound: number;
  currentTurn: number;
  playedCards: { playerId: string; card: Card }[];
  score: { team1: number; team2: number };
  roundScore: number; // 1, 3, 6, 9, 12
  trucoState: 'none' | 'truco' | 'seis' | 'nove' | 'doze';
  waitingForResponse: boolean;
  trucoCalledBy?: 1 | 2; // Qual time pediu o truco
  currentPlayerIndex: number;
  roundsWon: { team1: number; team2: number };
  lastRoundWinner?: number; // Índice do jogador que ganhou a última rodada
  gameStarted: boolean;
  dealer: number;
  vira?: Card; // Manilha
  isMaoDe11?: { team1: boolean; team2: boolean }; // Indica se algum time está na mão de 11
  isMaoDeFerro?: boolean; // Indica se é mão de ferro (11x11)
  // Sistema de eventos para feedback visual
  gameEvents: GameEvent[];
  lastWinningCard?: Card;
  lastWinningPlayerId?: string;
  isProcessingEvent?: boolean;
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  gameState?: GameState;
  createdAt: Date;
}
