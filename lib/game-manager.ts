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
  checkMaoDe11,
  checkMaoDeFerro,
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

    // Impede que jogador entre duas vezes
    if (room.players.some((p) => p.id === player.id)) {
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

    // Validação robusta: verifica índice E se carta existe
    if (cardIndex < 0 || cardIndex >= player.hand.length) {
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

    // Encontra o índice da carta vencedora
    let highestCardIndex = 0;
    let highestCard = game.playedCards[0].card;

    for (let i = 1; i < game.playedCards.length; i++) {
      const comparison = compareCards(game.playedCards[i].card, highestCard, manilhaRank);
      if (comparison > 0) {
        highestCard = game.playedCards[i].card;
        highestCardIndex = i;
      }
    }

    // Encontra o jogador vencedor
    const winnerPlayerId = game.playedCards[highestCardIndex].playerId;
    const winnerPlayerIndex = game.players.findIndex((p) => p.id === winnerPlayerId);
    const winnerPlayer = game.players[winnerPlayerIndex];

    const winningTeam = winnerPlayer.team;

    // Salva informações da rodada vencedora para exibição
    game.lastWinningCard = highestCard;
    game.lastWinningPlayerId = winnerPlayerId;

    if (winningTeam === 1) {
      game.roundsWon.team1++;
    } else if (winningTeam === 2) {
      game.roundsWon.team2++;
    }

    // Cria evento de rodada vencida
    game.gameEvents.push({
      type: 'round_won',
      team: winningTeam,
      winningCard: highestCard,
      winningPlayerName: winnerPlayer.name,
      timestamp: Date.now(),
    });

    // Salva quem ganhou para jogar primeiro na próxima rodada
    game.lastRoundWinner = winnerPlayerIndex;

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
    } else {
      // Próxima rodada: quem ganhou joga primeiro
      game.currentPlayerIndex = game.lastRoundWinner;
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

    // Cria evento de mão vencida
    game.gameEvents.push({
      type: 'hand_won',
      team: winningTeam,
      points,
      timestamp: Date.now(),
    });

    // Verifica vitória (12 pontos)
    if (game.score.team1 >= 12 || game.score.team2 >= 12) {
      this.endGame(roomId, winningTeam);
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

    // Verifica mão de 11 e mão de ferro
    const maoDe11 = checkMaoDe11(game.score);
    const maoDeFerro = checkMaoDeFerro(game.score);

    game.currentRound = 1;
    game.playedCards = [];
    game.roundsWon = { team1: 0, team2: 0 };
    game.trucoState = 'none';
    game.waitingForResponse = false;
    game.trucoCalledBy = undefined;
    game.vira = vira;
    game.dealer = (game.dealer + 1) % game.players.length;
    game.currentPlayerIndex = (game.dealer + 1) % game.players.length;
    game.isMaoDe11 = maoDe11;
    game.isMaoDeFerro = maoDeFerro;

    // Mão de ferro vale automaticamente 3 pontos
    if (maoDeFerro) {
      game.roundScore = 3;
      game.trucoState = 'truco';
    } else {
      game.roundScore = 1;
    }
  }

  private endGame(roomId: string, winningTeam: 1 | 2): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    const game = room.gameState;

    // Cria evento de jogo vencido
    game.gameEvents.push({
      type: 'game_won',
      team: winningTeam,
      points: game.score[`team${winningTeam}` as 'team1' | 'team2'],
      timestamp: Date.now(),
    });

    // Aguarda um tempo para exibir a celebração antes de resetar
    // O reset será feito pelo frontend após o usuário dismissar a celebração
  }

  callTruco(roomId: string, playerId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return null;

    const game = room.gameState;
    const player = game.players.find((p) => p.id === playerId);
    if (!player || game.waitingForResponse) return null;

    // Não pode pedir truco em mão de ferro
    if (game.isMaoDeFerro) return null;

    // Time com 11 pontos não pode pedir truco (apenas responder)
    if (game.isMaoDe11?.team1 && player.team === 1) return null;
    if (game.isMaoDe11?.team2 && player.team === 2) return null;

    // Apenas pode pedir truco quem tem a vez OU quem já jogou nesta rodada
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    const isCurrentPlayer = playerIndex === game.currentPlayerIndex;
    const hasPlayedThisRound = game.playedCards.some(
      (pc) => pc.playerId === playerId
    );

    if (!isCurrentPlayer && !hasPlayedThisRound) {
      return null; // Jogador não pode pedir truco agora
    }

    const nextState = getNextTrucoState(game.trucoState);
    if (!nextState) return null;

    game.waitingForResponse = true;
    game.trucoCalledBy = player.team; // Rastreia qual time pediu
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
    if (!game.waitingForResponse || !game.trucoCalledBy) return null;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return null;

    // Apenas jogadores do time ADVERSÁRIO podem responder
    if (player.team === game.trucoCalledBy) {
      return null; // Jogador do mesmo time que pediu não pode responder
    }

    game.waitingForResponse = false;

    if (accept) {
      const nextState = getNextTrucoState(game.trucoState);
      if (nextState) {
        game.trucoState = nextState;
        game.roundScore = getTrucoValue(nextState);
      }
      game.trucoCalledBy = undefined; // Reset após aceitar
    } else {
      // Recusou - time que PEDIU o truco ganha a mão com os pontos atuais
      const winningTeam = game.trucoCalledBy;
      const currentPoints = getTrucoValue(game.trucoState);

      // Ganha com os pontos do estado atual (antes do aumento)
      if (winningTeam === 1) {
        game.score.team1 += currentPoints;
      } else {
        game.score.team2 += currentPoints;
      }

      // Cria evento de truco recusado
      game.gameEvents.push({
        type: 'truco_refused',
        team: winningTeam,
        points: currentPoints,
        timestamp: Date.now(),
      });

      game.trucoCalledBy = undefined;

      // Verifica vitória ou inicia nova mão
      if (game.score.team1 >= 12 || game.score.team2 >= 12) {
        this.endGame(roomId, winningTeam);
      } else {
        this.startNewHand(roomId);
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
