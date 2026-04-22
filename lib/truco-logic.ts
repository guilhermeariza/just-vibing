import { Card, Rank, Suit, GameState, Player } from '@/types/game';

// Valores base das cartas no truco
const cardValues: Record<Rank, number> = {
  '4': 1,
  '5': 2,
  '6': 3,
  '7': 4,
  'Q': 5,
  'J': 6,
  'K': 7,
  'A': 8,
  '2': 9,
  '3': 10,
};

// Valores das manilhas (em ordem)
const manilhaOrder: Rank[] = ['4', '7', 'A', '3'];

export function createDeck(): Card[] {
  const suits: Suit[] = ['ouros', 'espadas', 'copas', 'paus'];
  const ranks: Rank[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        value: cardValues[rank],
      });
    }
  }

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], numPlayers: number): Card[][] {
  const hands: Card[][] = Array(numPlayers)
    .fill(null)
    .map(() => []);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < numPlayers; j++) {
      hands[j].push(deck[i * numPlayers + j]);
    }
  }

  return hands;
}

export function getVira(deck: Card[], numPlayers: number): Card {
  // A vira é a carta após as distribuídas (posição 12 em um jogo de 4 jogadores)
  return deck[numPlayers * 3];
}

export function getManilha(vira: Card): Rank {
  const ranks: Rank[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
  const viraIndex = ranks.indexOf(vira.rank);
  return ranks[(viraIndex + 1) % ranks.length];
}

export function isManilha(card: Card, manilhaRank: Rank): boolean {
  return card.rank === manilhaRank;
}

export function getManilhaValue(card: Card): number {
  // Ouros (Zap) > Espadas (Escopeta) > Copas (Espadilha) > Paus (Paus)
  const manilhaValues: Record<Suit, number> = {
    paus: 11,
    copas: 12,
    espadas: 13,
    ouros: 14,
  };
  return manilhaValues[card.suit];
}

export function compareCards(
  card1: Card,
  card2: Card,
  manilhaRank: Rank
): number {
  const is1Manilha = isManilha(card1, manilhaRank);
  const is2Manilha = isManilha(card2, manilhaRank);

  // Se ambas são manilhas, compara pelo valor da manilha
  if (is1Manilha && is2Manilha) {
    return getManilhaValue(card1) - getManilhaValue(card2);
  }

  // Se apenas uma é manilha, ela ganha
  if (is1Manilha) return 1;
  if (is2Manilha) return -1;

  // Se nenhuma é manilha, compara pelos valores base
  return card1.value - card2.value;
}

export function determineRoundWinner(
  playedCards: { playerId: string; card: Card }[],
  players: Player[],
  manilhaRank: Rank
): number {
  if (playedCards.length === 0) return -1;

  let highestCardIndex = 0;
  let highestCard = playedCards[0].card;

  for (let i = 1; i < playedCards.length; i++) {
    const comparison = compareCards(playedCards[i].card, highestCard, manilhaRank);
    if (comparison > 0) {
      highestCard = playedCards[i].card;
      highestCardIndex = i;
    } else if (comparison === 0) {
      // Empate - primeira carta ganha
      continue;
    }
  }

  // Encontra o time do jogador vencedor
  const winnerId = playedCards[highestCardIndex].playerId;
  const winnerPlayer = players.find((p) => p.id === winnerId);
  return winnerPlayer ? winnerPlayer.team : -1;
}

export function canRaiseTruco(currentState: string): boolean {
  const states = ['none', 'truco', 'seis', 'nove', 'doze'];
  const currentIndex = states.indexOf(currentState);
  return currentIndex < states.length - 1;
}

export function getNextTrucoState(
  currentState: 'none' | 'truco' | 'seis' | 'nove' | 'doze'
): 'truco' | 'seis' | 'nove' | 'doze' | null {
  const stateMap = {
    none: 'truco',
    truco: 'seis',
    seis: 'nove',
    nove: 'doze',
    doze: null,
  } as const;

  return stateMap[currentState];
}

export function getTrucoValue(
  state: 'none' | 'truco' | 'seis' | 'nove' | 'doze'
): number {
  const values = {
    none: 1,
    truco: 3,
    seis: 6,
    nove: 9,
    doze: 12,
  };
  return values[state];
}

export function initializeGame(players: Player[], roomId: string): GameState {
  const deck = shuffleDeck(createDeck());
  const hands = dealCards(deck, players.length);
  const vira = getVira(deck, players.length);

  players.forEach((player, index) => {
    player.hand = hands[index];
  });

  return {
    id: roomId,
    players,
    currentRound: 1,
    currentTurn: 0,
    playedCards: [],
    score: { team1: 0, team2: 0 },
    roundScore: 1,
    trucoState: 'none',
    waitingForResponse: false,
    currentPlayerIndex: 0,
    roundsWon: { team1: 0, team2: 0 },
    gameStarted: true,
    dealer: 0,
    vira,
    gameEvents: [],
    isProcessingEvent: false,
  };
}

export function getCardSymbol(suit: Suit): string {
  const symbols = {
    ouros: '♦',
    espadas: '♠',
    copas: '♥',
    paus: '♣',
  };
  return symbols[suit];
}

export function getCardDisplay(rank: Rank): string {
  return rank;
}

export function checkMaoDe11(score: { team1: number; team2: number }): {
  team1: boolean;
  team2: boolean;
} {
  return {
    team1: score.team1 === 11,
    team2: score.team2 === 11,
  };
}

export function checkMaoDeFerro(score: { team1: number; team2: number }): boolean {
  return score.team1 === 11 && score.team2 === 11;
}
