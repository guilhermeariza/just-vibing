import { randomUUID } from 'crypto';
import { Room, RoomSummary, GameState, GameEvent, Player } from '@/types/game';
import {
  initializeGame,
  evaluatePlayedCards,
  resolveHand,
  canCallTruco,
  getManilha,
  getTrucoValue,
  getNextTrucoState,
  shuffleDeck,
  createDeck,
  dealCards,
  getVira,
  checkMaoDe11,
  checkMaoDeFerro,
} from './truco-logic';

const ROOM_TTL_MS = 3 * 60 * 60 * 1000; // salas inativas por 3h são removidas
const MAX_EVENTS = 40;
const MAX_NAME_LENGTH = 24;
const MAX_ROOM_NAME_LENGTH = 32;
const ROOM_ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function generateRoomId(): string {
  const bytes = randomUUID().replace(/-/g, '');
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += ROOM_ID_ALPHABET[parseInt(bytes.substr(i * 2, 2), 16) % ROOM_ID_ALPHABET.length];
  }
  return id;
}

export function sanitizeName(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/\s+/g, ' ').trim().slice(0, max);
  return clean.length > 0 ? clean : null;
}

class GameManager {
  private rooms: Map<string, Room> = new Map();
  private activity: Map<string, number> = new Map();

  private touch(roomId: string): void {
    this.activity.set(roomId, Date.now());
  }

  private cleanupStaleRooms(): void {
    const now = Date.now();
    for (const [id, last] of this.activity) {
      if (now - last > ROOM_TTL_MS) {
        this.rooms.delete(id);
        this.activity.delete(id);
      }
    }
  }

  private pushEvent(game: GameState, event: Omit<GameEvent, 'id' | 'timestamp'>): void {
    game.gameEvents.push({ ...event, id: randomUUID(), timestamp: Date.now() });
    if (game.gameEvents.length > MAX_EVENTS) {
      game.gameEvents.splice(0, game.gameEvents.length - MAX_EVENTS);
    }
  }

  createRoom(name: string): Room {
    this.cleanupStaleRooms();
    let id = generateRoomId();
    while (this.rooms.has(id)) id = generateRoomId();
    const room: Room = {
      id,
      name: sanitizeName(name, MAX_ROOM_NAME_LENGTH) ?? 'Sala',
      players: [],
      maxPlayers: 4,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    this.touch(id);
    return room;
  }

  getRoom(id: string): Room | undefined {
    const room = this.rooms.get(id);
    // Garante compatibilidade com jogos antigos
    if (room?.gameState) {
      room.gameState.gameEvents ??= [];
      room.gameState.roundResults ??= [];
    }
    return room;
  }

  getAllRooms(): Room[] {
    this.cleanupStaleRooms();
    return Array.from(this.rooms.values());
  }

  getRoomSummaries(): RoomSummary[] {
    return this.getAllRooms().map((room) => ({
      id: room.id,
      name: room.name,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      inGame: !!room.gameState?.gameStarted && !room.gameState.winner,
    }));
  }

  /**
   * Visão da sala para um jogador: esconde as cartas dos demais.
   * Nunca retorne `getRoom()` diretamente em uma API pública.
   */
  getRoomView(id: string, viewerId?: string | null): Room | undefined {
    const room = this.getRoom(id);
    if (!room) return undefined;

    const redact = (p: Player): Player => ({
      ...p,
      hand: p.id === viewerId ? p.hand : [],
      handCount: p.hand.length,
    });

    const players = room.players.map(redact);
    const view: Room = { ...room, players };
    if (room.gameState) {
      view.gameState = { ...room.gameState, players: room.gameState.players.map(redact) };
    }
    return view;
  }

  joinRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= room.maxPlayers) {
      return false;
    }

    // Não entra em jogo em andamento
    if (room.gameState?.gameStarted) {
      return false;
    }

    const name = sanitizeName(player.name, MAX_NAME_LENGTH);
    if (!name) return false;
    player.name = name;

    // Nomes duplicados na mesma sala confundem a mesa
    if (room.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
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
    this.touch(roomId);
    return true;
  }

  leaveRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (!room.players.some((p) => p.id === playerId)) return false;

    // Sair no meio da partida a encerra (sem o jogador a mesa não fecha)
    if (room.gameState) {
      room.gameState = undefined;
      room.players.forEach((p) => {
        p.isReady = false;
        p.hand = [];
      });
    }

    room.players = room.players.filter((p) => p.id !== playerId);
    // Reequilibra os times (assentos alternam 1,2,1,2)
    room.players.forEach((p, i) => (p.team = i % 2 === 0 ? 1 : 2));

    // Remove sala se vazia
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      this.activity.delete(roomId);
    } else {
      this.touch(roomId);
    }

    return true;
  }

  startGame(roomId: string, requesterId?: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Só quem está na sala pode iniciar
    if (requesterId !== undefined && !room.players.some((p) => p.id === requesterId)) {
      return null;
    }

    // Truco é 1x1 ou 2x2
    if (room.players.length !== 2 && room.players.length !== 4) {
      return null;
    }

    // Já existe jogo em andamento
    if (room.gameState?.gameStarted) {
      return null;
    }

    // Garante que todos os jogadores estão prontos
    const allReady = room.players.every((p) => p.isReady);
    if (!allReady) {
      return null;
    }

    // Assentos alternam entre os times
    room.players.forEach((p, i) => (p.team = i % 2 === 0 ? 1 : 2));

    const gameState = initializeGame(room.players, roomId);
    room.gameState = gameState;
    this.touch(roomId);
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

    if (
      !player ||
      player.id !== currentPlayer.id ||
      game.waitingForResponse ||
      game.winner
    ) {
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

    this.touch(roomId);
    return game;
  }

  private evaluateRound(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    const game = room.gameState;
    const manilhaRank = getManilha(game.vira!);

    const leaderId = game.playedCards[0].playerId;
    const leaderIndex = game.players.findIndex((p) => p.id === leaderId);

    const outcome = evaluatePlayedCards(game.playedCards, game.players, manilhaRank);
    game.roundResults ??= [];
    game.roundResults.push(outcome.team);
    game.currentRound++;

    if (outcome.team === 0) {
      // Empate: quem abriu a rodada abre a próxima
      game.lastWinningCard = undefined;
      game.lastWinningPlayerId = undefined;
      game.lastRoundWinner = undefined;
      this.pushEvent(game, { type: 'round_tied', team: 0 });
      game.currentPlayerIndex = leaderIndex;
    } else {
      const winning = game.playedCards[outcome.winnerIndex];
      const winnerPlayerIndex = game.players.findIndex((p) => p.id === winning.playerId);
      const winnerPlayer = game.players[winnerPlayerIndex];

      game.lastWinningCard = winning.card;
      game.lastWinningPlayerId = winning.playerId;
      game.lastRoundWinner = winnerPlayerIndex;
      if (outcome.team === 1) game.roundsWon.team1++;
      else game.roundsWon.team2++;

      this.pushEvent(game, {
        type: 'round_won',
        team: outcome.team,
        winningCard: winning.card,
        winningPlayerName: winnerPlayer.name,
      });

      // Quem ganhou joga primeiro na próxima rodada
      game.currentPlayerIndex = winnerPlayerIndex;
    }

    game.playedCards = [];

    const handWinner = resolveHand(game.roundResults);
    if (handWinner === 1 || handWinner === 2) {
      this.endHand(roomId, handWinner);
    } else if (handWinner === 0) {
      // Todas as rodadas empataram: mão anulada, ninguém pontua
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

    this.pushEvent(game, { type: 'hand_won', team: winningTeam, points });

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
    game.roundResults = [];
    game.trucoState = 'none';
    game.waitingForResponse = false;
    game.trucoCalledBy = undefined;
    game.lastRaiseTeam = undefined;
    game.lastRoundWinner = undefined;
    game.lastWinningCard = undefined;
    game.lastWinningPlayerId = undefined;
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
    game.winner = winningTeam;
    game.waitingForResponse = false;
    game.trucoCalledBy = undefined;

    this.pushEvent(game, {
      type: 'game_won',
      team: winningTeam,
      points: game.score[`team${winningTeam}` as 'team1' | 'team2'],
    });
  }

  /** Volta ao lobby depois que o jogo acabou (revanche). */
  resetGame(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || !room.players.some((p) => p.id === playerId)) return false;
    if (room.gameState && !room.gameState.winner) return false;

    room.gameState = undefined;
    room.players.forEach((p) => {
      p.isReady = false;
      p.hand = [];
    });
    this.touch(roomId);
    return true;
  }

  callTruco(roomId: string, playerId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return null;

    const game = room.gameState;
    if (!canCallTruco(game, playerId)) return null;

    const player = game.players.find((p) => p.id === playerId)!;
    game.waitingForResponse = true;
    game.trucoCalledBy = player.team; // Rastreia qual time pediu
    game.lastRaiseTeam = player.team;
    this.touch(roomId);
    return game;
  }

  /**
   * Responde a um pedido de truco.
   * `raise` aceita e já aumenta a aposta (ex.: truco -> seis).
   */
  respondTruco(
    roomId: string,
    playerId: string,
    accept: boolean,
    raise = false
  ): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return null;

    const game = room.gameState;
    if (game.winner || !game.waitingForResponse || !game.trucoCalledBy) return null;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return null;

    // Apenas jogadores do time ADVERSÁRIO podem responder
    if (player.team === game.trucoCalledBy) {
      return null;
    }

    if (accept) {
      const nextState = getNextTrucoState(game.trucoState);
      if (!nextState) return null;

      let canRaise = false;
      if (raise) {
        const blocked =
          (player.team === 1 && game.isMaoDe11?.team1) ||
          (player.team === 2 && game.isMaoDe11?.team2);
        canRaise = !blocked && getNextTrucoState(nextState) !== null;
        if (!canRaise) return null;
      }

      game.trucoState = nextState;
      game.roundScore = getTrucoValue(nextState);
      game.waitingForResponse = false;
      game.trucoCalledBy = undefined;

      if (canRaise) {
        game.waitingForResponse = true;
        game.trucoCalledBy = player.team;
        game.lastRaiseTeam = player.team;
      }
    } else {
      // Recusou - time que PEDIU o truco ganha a mão com os pontos atuais
      const winningTeam = game.trucoCalledBy;
      const currentPoints = getTrucoValue(game.trucoState);

      game.waitingForResponse = false;
      game.trucoCalledBy = undefined;

      if (winningTeam === 1) {
        game.score.team1 += currentPoints;
      } else {
        game.score.team2 += currentPoints;
      }

      this.pushEvent(game, {
        type: 'truco_refused',
        team: winningTeam,
        points: currentPoints,
      });

      // Verifica vitória ou inicia nova mão
      if (game.score.team1 >= 12 || game.score.team2 >= 12) {
        this.endGame(roomId, winningTeam);
      } else {
        this.startNewHand(roomId);
      }
    }

    this.touch(roomId);
    return game;
  }

  setPlayerReady(roomId: string, playerId: string, ready: boolean): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return false;
    if (room.gameState?.gameStarted) return false;

    player.isReady = ready;
    this.touch(roomId);
    return true;
  }
}

// Singleton (via globalThis para sobreviver ao hot reload do Next em dev)
const globalForGame = globalThis as unknown as { __trucoGameManager?: GameManager };
export const gameManager = (globalForGame.__trucoGameManager ??= new GameManager());
