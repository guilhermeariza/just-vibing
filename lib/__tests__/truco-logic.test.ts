import { describe, it, expect } from 'vitest';
import {
  createDeck,
  shuffleDeck,
  dealCards,
  getVira,
  getManilha,
  isManilha,
  getManilhaValue,
  compareCards,
  determineRoundWinner,
  getTrucoValue,
  getNextTrucoState,
  checkMaoDe11,
  checkMaoDeFerro,
} from '../truco-logic';
import type { Card, Player } from '@/types/game';

describe('Truco Logic', () => {
  describe('createDeck', () => {
    it('should create a deck with 40 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(40);
    });

    it('should have 10 cards per suit', () => {
      const deck = createDeck();
      const suits = ['ouros', 'espadas', 'copas', 'paus'];

      suits.forEach((suit) => {
        const suitCards = deck.filter((card) => card.suit === suit);
        expect(suitCards).toHaveLength(10);
      });
    });

    it('should not have 8, 9, or 10', () => {
      const deck = createDeck();
      const invalidRanks = ['8', '9', '10'];

      deck.forEach((card) => {
        expect(invalidRanks).not.toContain(card.rank);
      });
    });

    it('should have correct card values', () => {
      const deck = createDeck();
      const fourCard = deck.find((card) => card.rank === '4');
      const threeCard = deck.find((card) => card.rank === '3');

      expect(fourCard?.value).toBe(1);
      expect(threeCard?.value).toBe(10);
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck with the same length', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);

      expect(shuffled).toHaveLength(deck.length);
    });

    it('should contain the same cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);

      // Verifica se todas as cartas estão presentes
      deck.forEach((card) => {
        const found = shuffled.find(
          (c) => c.rank === card.rank && c.suit === card.suit
        );
        expect(found).toBeDefined();
      });
    });

    it('should not modify the original deck', () => {
      const deck = createDeck();
      const original = [...deck];
      shuffleDeck(deck);

      expect(deck).toEqual(original);
    });
  });

  describe('dealCards', () => {
    it('should deal 3 cards to each player', () => {
      const deck = createDeck();
      const hands = dealCards(deck, 4);

      expect(hands).toHaveLength(4);
      hands.forEach((hand) => {
        expect(hand).toHaveLength(3);
      });
    });

    it('should deal 3 cards to 2 players', () => {
      const deck = createDeck();
      const hands = dealCards(deck, 2);

      expect(hands).toHaveLength(2);
      hands.forEach((hand) => {
        expect(hand).toHaveLength(3);
      });
    });
  });

  describe('getVira', () => {
    it('should return the card after dealt cards (4 players)', () => {
      const deck = createDeck();
      const vira = getVira(deck, 4);

      // Para 4 jogadores, 12 cartas são distribuídas, então vira é a 13ª
      expect(vira).toEqual(deck[12]);
    });

    it('should return the card after dealt cards (2 players)', () => {
      const deck = createDeck();
      const vira = getVira(deck, 2);

      // Para 2 jogadores, 6 cartas são distribuídas, então vira é a 7ª
      expect(vira).toEqual(deck[6]);
    });
  });

  describe('getManilha', () => {
    it('should return the card after vira in sequence', () => {
      const vira: Card = { suit: 'ouros', rank: '4', value: 1 };
      const manilha = getManilha(vira);

      expect(manilha).toBe('5');
    });

    it('should wrap around from 3 to 4', () => {
      const vira: Card = { suit: 'ouros', rank: '3', value: 10 };
      const manilha = getManilha(vira);

      expect(manilha).toBe('4');
    });

    it('should handle Q correctly', () => {
      const vira: Card = { suit: 'ouros', rank: '7', value: 4 };
      const manilha = getManilha(vira);

      expect(manilha).toBe('Q');
    });
  });

  describe('isManilha', () => {
    it('should identify a manilha correctly', () => {
      const card: Card = { suit: 'ouros', rank: '7', value: 4 };
      const result = isManilha(card, '7');

      expect(result).toBe(true);
    });

    it('should return false for non-manilha', () => {
      const card: Card = { suit: 'ouros', rank: '4', value: 1 };
      const result = isManilha(card, '7');

      expect(result).toBe(false);
    });
  });

  describe('getManilhaValue', () => {
    it('should return correct value for Zap (ouros)', () => {
      const card: Card = { suit: 'ouros', rank: '7', value: 4 };
      const value = getManilhaValue(card);

      expect(value).toBe(14); // Ouros é a mais forte
    });

    it('should return correct value for Escopeta (espadas)', () => {
      const card: Card = { suit: 'espadas', rank: '7', value: 4 };
      const value = getManilhaValue(card);

      expect(value).toBe(13);
    });

    it('should return correct value for Espadilha (copas)', () => {
      const card: Card = { suit: 'copas', rank: '7', value: 4 };
      const value = getManilhaValue(card);

      expect(value).toBe(12);
    });

    it('should return correct value for Paus (paus)', () => {
      const card: Card = { suit: 'paus', rank: '7', value: 4 };
      const value = getManilhaValue(card);

      expect(value).toBe(11);
    });
  });

  describe('compareCards', () => {
    it('should return 1 if card1 is stronger', () => {
      const card1: Card = { suit: 'ouros', rank: 'A', value: 8 };
      const card2: Card = { suit: 'ouros', rank: '4', value: 1 };

      const result = compareCards(card1, card2, 'K');

      expect(result).toBeGreaterThan(0);
    });

    it('should return -1 if card2 is stronger', () => {
      const card1: Card = { suit: 'ouros', rank: '4', value: 1 };
      const card2: Card = { suit: 'ouros', rank: 'A', value: 8 };

      const result = compareCards(card1, card2, 'K');

      expect(result).toBeLessThan(0);
    });

    it('should return 0 if cards are equal', () => {
      const card1: Card = { suit: 'ouros', rank: 'A', value: 8 };
      const card2: Card = { suit: 'espadas', rank: 'A', value: 8 };

      const result = compareCards(card1, card2, 'K');

      expect(result).toBe(0);
    });

    it('should prioritize manilhas over normal cards', () => {
      const manilha: Card = { suit: 'paus', rank: '7', value: 4 };
      const normalCard: Card = { suit: 'ouros', rank: '3', value: 10 };

      const result = compareCards(manilha, normalCard, '7');

      expect(result).toBeGreaterThan(0);
    });

    it('should compare manilhas by suit (Zap > Escopeta)', () => {
      const zap: Card = { suit: 'ouros', rank: '7', value: 4 };
      const escopeta: Card = { suit: 'espadas', rank: '7', value: 4 };

      const result = compareCards(zap, escopeta, '7');

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('determineRoundWinner', () => {
    const players: Player[] = [
      { id: '1', name: 'Player 1', hand: [], team: 1, isReady: true },
      { id: '2', name: 'Player 2', hand: [], team: 2, isReady: true },
      { id: '3', name: 'Player 3', hand: [], team: 1, isReady: true },
      { id: '4', name: 'Player 4', hand: [], team: 2, isReady: true },
    ];

    it('should determine the winning team correctly', () => {
      const playedCards = [
        { playerId: '1', card: { suit: 'ouros' as const, rank: '4' as const, value: 1 } },
        { playerId: '2', card: { suit: 'ouros' as const, rank: 'A' as const, value: 8 } },
      ];

      const winner = determineRoundWinner(playedCards, players, 'K');

      expect(winner).toBe(2); // Team 2 should win
    });

    it('should handle empty played cards', () => {
      const winner = determineRoundWinner([], players, 'K');

      expect(winner).toBe(-1);
    });

    it('should give priority to first card in case of tie', () => {
      const playedCards = [
        { playerId: '1', card: { suit: 'ouros' as const, rank: 'A' as const, value: 8 } },
        { playerId: '2', card: { suit: 'espadas' as const, rank: 'A' as const, value: 8 } },
      ];

      const winner = determineRoundWinner(playedCards, players, 'K');

      expect(winner).toBe(1); // Team 1 (first card)
    });
  });

  describe('getTrucoValue', () => {
    it('should return 1 for none', () => {
      expect(getTrucoValue('none')).toBe(1);
    });

    it('should return 3 for truco', () => {
      expect(getTrucoValue('truco')).toBe(3);
    });

    it('should return 6 for seis', () => {
      expect(getTrucoValue('seis')).toBe(6);
    });

    it('should return 9 for nove', () => {
      expect(getTrucoValue('nove')).toBe(9);
    });

    it('should return 12 for doze', () => {
      expect(getTrucoValue('doze')).toBe(12);
    });
  });

  describe('getNextTrucoState', () => {
    it('should return truco from none', () => {
      expect(getNextTrucoState('none')).toBe('truco');
    });

    it('should return seis from truco', () => {
      expect(getNextTrucoState('truco')).toBe('seis');
    });

    it('should return nove from seis', () => {
      expect(getNextTrucoState('seis')).toBe('nove');
    });

    it('should return doze from nove', () => {
      expect(getNextTrucoState('nove')).toBe('doze');
    });

    it('should return null from doze', () => {
      expect(getNextTrucoState('doze')).toBeNull();
    });
  });

  describe('checkMaoDe11', () => {
    it('should return true for team1 when they have 11 points', () => {
      const score = { team1: 11, team2: 5 };
      const result = checkMaoDe11(score);

      expect(result.team1).toBe(true);
      expect(result.team2).toBe(false);
    });

    it('should return true for team2 when they have 11 points', () => {
      const score = { team1: 5, team2: 11 };
      const result = checkMaoDe11(score);

      expect(result.team1).toBe(false);
      expect(result.team2).toBe(true);
    });

    it('should return false for both when neither has 11', () => {
      const score = { team1: 5, team2: 7 };
      const result = checkMaoDe11(score);

      expect(result.team1).toBe(false);
      expect(result.team2).toBe(false);
    });
  });

  describe('checkMaoDeFerro', () => {
    it('should return true when both teams have 11 points', () => {
      const score = { team1: 11, team2: 11 };
      const result = checkMaoDeFerro(score);

      expect(result).toBe(true);
    });

    it('should return false when only one team has 11', () => {
      const score = { team1: 11, team2: 10 };
      const result = checkMaoDeFerro(score);

      expect(result).toBe(false);
    });

    it('should return false when neither team has 11', () => {
      const score = { team1: 8, team2: 9 };
      const result = checkMaoDeFerro(score);

      expect(result).toBe(false);
    });
  });

  describe('getManilha - All Ranks Coverage', () => {
    it('should handle 4 → 5', () => {
      const vira: Card = { rank: '4', suit: 'ouros', value: 1 };
      expect(getManilha(vira)).toBe('5');
    });

    it('should handle 5 → 6', () => {
      const vira: Card = { rank: '5', suit: 'ouros', value: 2 };
      expect(getManilha(vira)).toBe('6');
    });

    it('should handle 6 → 7', () => {
      const vira: Card = { rank: '6', suit: 'ouros', value: 3 };
      expect(getManilha(vira)).toBe('7');
    });

    it('should handle 7 → Q (Queen)', () => {
      const vira: Card = { rank: '7', suit: 'ouros', value: 4 };
      expect(getManilha(vira)).toBe('Q');
    });

    it('should handle Q → J (Jack)', () => {
      const vira: Card = { rank: 'Q', suit: 'ouros', value: 5 };
      expect(getManilha(vira)).toBe('J');
    });

    it('should handle J → K (King)', () => {
      const vira: Card = { rank: 'J', suit: 'ouros', value: 6 };
      expect(getManilha(vira)).toBe('K');
    });

    it('should handle K → A (Ace)', () => {
      const vira: Card = { rank: 'K', suit: 'ouros', value: 7 };
      expect(getManilha(vira)).toBe('A');
    });

    it('should handle A → 2', () => {
      const vira: Card = { rank: 'A', suit: 'ouros', value: 8 };
      expect(getManilha(vira)).toBe('2');
    });

    it('should handle 2 → 3', () => {
      const vira: Card = { rank: '2', suit: 'ouros', value: 9 };
      expect(getManilha(vira)).toBe('3');
    });

    it('should handle 3 → 4 (wraparound)', () => {
      const vira: Card = { rank: '3', suit: 'ouros', value: 10 };
      expect(getManilha(vira)).toBe('4');
    });
  });

  describe('compareCards - All Manilha Combinations', () => {
    const manilhaRank = '5'; // Vira é 4, então manilha é 5

    // Manilhas: Zap (ouros)=14, Escopeta (espadas)=13, Espadilha (copas)=12, Paus (paus)=11
    const zap: Card = { rank: '5', suit: 'ouros', value: 2 };
    const escopeta: Card = { rank: '5', suit: 'espadas', value: 2 };
    const espadilha: Card = { rank: '5', suit: 'copas', value: 2 };
    const paus: Card = { rank: '5', suit: 'paus', value: 2 };

    it('should compare Zap > Escopeta', () => {
      expect(compareCards(zap, escopeta, manilhaRank)).toBeGreaterThan(0);
      expect(compareCards(escopeta, zap, manilhaRank)).toBeLessThan(0);
    });

    it('should compare Zap > Espadilha', () => {
      expect(compareCards(zap, espadilha, manilhaRank)).toBeGreaterThan(0);
      expect(compareCards(espadilha, zap, manilhaRank)).toBeLessThan(0);
    });

    it('should compare Zap > Paus', () => {
      expect(compareCards(zap, paus, manilhaRank)).toBeGreaterThan(0);
      expect(compareCards(paus, zap, manilhaRank)).toBeLessThan(0);
    });

    it('should compare Escopeta > Espadilha', () => {
      expect(compareCards(escopeta, espadilha, manilhaRank)).toBeGreaterThan(0);
      expect(compareCards(espadilha, escopeta, manilhaRank)).toBeLessThan(0);
    });

    it('should compare Escopeta > Paus', () => {
      expect(compareCards(escopeta, paus, manilhaRank)).toBeGreaterThan(0);
      expect(compareCards(paus, escopeta, manilhaRank)).toBeLessThan(0);
    });

    it('should compare Espadilha > Paus', () => {
      expect(compareCards(espadilha, paus, manilhaRank)).toBeGreaterThan(0);
      expect(compareCards(paus, espadilha, manilhaRank)).toBeLessThan(0);
    });
  });

  describe('Truco State Transitions - Complete Sequence', () => {
    it('should progress: none → truco → seis → nove → doze → null', () => {
      expect(getNextTrucoState('none')).toBe('truco');
      expect(getNextTrucoState('truco')).toBe('seis');
      expect(getNextTrucoState('seis')).toBe('nove');
      expect(getNextTrucoState('nove')).toBe('doze');
      expect(getNextTrucoState('doze')).toBeNull();
    });

    it('should return correct values for each state', () => {
      expect(getTrucoValue('none')).toBe(1);
      expect(getTrucoValue('truco')).toBe(3);
      expect(getTrucoValue('seis')).toBe(6);
      expect(getTrucoValue('nove')).toBe(9);
      expect(getTrucoValue('doze')).toBe(12);
    });
  });
});
