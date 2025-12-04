import { Room, GameState, Player, Card } from '@/types/game';
import {
  initializeGame,
  determineRoundWinner,
  getManilha,
  compareCards,
  getTrucoValue,
  getNextTrucoState,
  shuffleDeck,
  createDeck,
  dealCards,
  getVira,
} from './truco-logic';

class GameManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(name: string): Room {
    const id = Math.random().toString(36).substring(7);
    const room: Room = {
      id,
      name,
      players: [],
      maxPlayers: 4,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  joinRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= room.maxPlayers) {
      return false;
    }

    // Atribui time automaticamente
    const team1Count = room.players.filter((p) => p.team === 1).length;
    const team2Count = room.players.filter((p) => p.team === 2).length;
    player.team = team1Count <= team2Count ? 1 : 2;

    room.players.push(player);
    return true;
  }

  leaveRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.players = room.players.filter((p) => p.id !== playerId);

    // Remove sala se vazia
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    }

    return true;
  }

  startGame(roomId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) {
      return null;
    }

    // Garante que todos os jogadores estão prontos
    const allReady = room.players.every((p) => p.isReady);
    if (!allReady) {
      return null;
    }

    const gameState = initializeGame(room.players, roomId);
    room.gameState = gameState;
    return gameState;
  }

  playCard(
    roomId: string,
    playerId: string,
    cardIndex: number
  ): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return null;

    const game = room.gameState;
    const player = game.players.find((p) => p.id === playerId);
    const currentPlayer = game.players[game.currentPlayerIndex];

    if (!player || player.id !== currentPlayer.id || game.waitingForResponse) {
      return null;
    }

    const card = player.hand[cardIndex];
    if (!card) return null;

    // Remove carta da mão e adiciona às cartas jogadas
    player.hand.splice(cardIndex, 1);
    game.playedCards.push({ playerId, card });

    // Avança para o próximo jogador
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

    // Verifica se todos jogaram
    if (game.playedCards.length === game.players.length) {
      this.evaluateRound(roomId);
    }

    return game;
  }

  private evaluateRound(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    const game = room.gameState;
    const manilhaRank = getManilha(game.vira!);
    const winningTeam = determineRoundWinner(
      game.playedCards,
      game.players,
      manilhaRank
    );

    if (winningTeam === 1) {
      game.roundsWon.team1++;
    } else if (winningTeam === 2) {
      game.roundsWon.team2++;
    }

    game.playedCards = [];
    game.currentRound++;

    // Verifica se alguém ganhou a mão (melhor de 3)
    if (game.roundsWon.team1 >= 2) {
      this.endHand(roomId, 1);
    } else if (game.roundsWon.team2 >= 2) {
      this.endHand(roomId, 2);
    } else if (game.currentRound > 3) {
      // Empate - ninguém ganha
      this.startNewHand(roomId);
    }
  }

  private endHand(roomId: string, winningTeam: 1 | 2): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    const game = room.gameState;
    const points = getTrucoValue(game.trucoState);

    if (winningTeam === 1) {
      game.score.team1 += points;
    } else {
      game.score.team2 += points;
    }

    // Verifica vitória (12 pontos)
    if (game.score.team1 >= 12 || game.score.team2 >= 12) {
      this.endGame(roomId);
    } else {
      this.startNewHand(roomId);
    }
  }

  private startNewHand(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    const game = room.gameState;
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, game.players.length);
    const vira = getVira(deck, game.players.length);

    game.players.forEach((player, index) => {
      player.hand = hands[index];
    });

    game.currentRound = 1;
    game.playedCards = [];
    game.roundsWon = { team1: 0, team2: 0 };
    game.trucoState = 'none';
    game.roundScore = 1;
    game.waitingForResponse = false;
    game.vira = vira;
    game.dealer = (game.dealer + 1) % game.players.length;
    game.currentPlayerIndex = (game.dealer + 1) % game.players.length;
  }

  private endGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Reset para permitir novo jogo
    room.gameState = undefined;
    room.players.forEach((p) => {
      p.isReady = false;
      p.hand = [];
    });
  }

  callTruco(roomId: string, playerId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return null;

    const game = room.gameState;
    const player = game.players.find((p) => p.id === playerId);
    if (!player || game.waitingForResponse) return null;

    const nextState = getNextTrucoState(game.trucoState);
    if (!nextState) return null;

    game.waitingForResponse = true;
    return game;
  }

  respondTruco(
    roomId: string,
    playerId: string,
    accept: boolean
  ): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return null;

    const game = room.gameState;
    if (!game.waitingForResponse) return null;

    game.waitingForResponse = false;

    if (accept) {
      const nextState = getNextTrucoState(game.trucoState);
      if (nextState) {
        game.trucoState = nextState;
        game.roundScore = getTrucoValue(nextState);
      }
    } else {
      // Recusou - time adversário ganha a mão
      const player = game.players.find((p) => p.id === playerId);
      if (player) {
        const winningTeam = player.team === 1 ? 2 : 1;
        this.endHand(roomId, winningTeam);
      }
    }

    return game;
  }

  setPlayerReady(roomId: string, playerId: string, ready: boolean): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return false;

    player.isReady = ready;
    return true;
  }
}

// Singleton instance
export const gameManager = new GameManager();
