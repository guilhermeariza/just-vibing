import { describe, it, expect, beforeEach } from 'vitest';
import { gameManager } from '../game-manager';
import type { Player } from '@/types/game';

describe('GameManager', () => {
  beforeEach(() => {
    // Reset do singleton entre testes
    // @ts-ignore - acessando propriedade privada para teste
    gameManager['rooms'].clear();
  });

  describe('createRoom', () => {
    it('should create a new room', () => {
      const room = gameManager.createRoom('Test Room');

      expect(room).toBeDefined();
      expect(room.name).toBe('Test Room');
      expect(room.players).toHaveLength(0);
      expect(room.maxPlayers).toBe(4);
    });

    it('should generate unique room IDs', () => {
      const room1 = gameManager.createRoom('Room 1');
      const room2 = gameManager.createRoom('Room 2');

      expect(room1.id).not.toBe(room2.id);
    });
  });

  describe('getRoom', () => {
    it('should return an existing room', () => {
      const createdRoom = gameManager.createRoom('Test Room');
      const foundRoom = gameManager.getRoom(createdRoom.id);

      expect(foundRoom).toBeDefined();
      expect(foundRoom?.id).toBe(createdRoom.id);
    });

    it('should return undefined for non-existent room', () => {
      const room = gameManager.getRoom('non-existent-id');

      expect(room).toBeUndefined();
    });
  });

  describe('getAllRooms', () => {
    it('should return all rooms', () => {
      gameManager.createRoom('Room 1');
      gameManager.createRoom('Room 2');
      gameManager.createRoom('Room 3');

      const rooms = gameManager.getAllRooms();

      expect(rooms).toHaveLength(3);
    });

    it('should return empty array when no rooms exist', () => {
      const rooms = gameManager.getAllRooms();

      expect(rooms).toHaveLength(0);
    });
  });

  describe('joinRoom', () => {
    it('should add player to room', () => {
      const room = gameManager.createRoom('Test Room');
      const player: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: false,
      };

      const success = gameManager.joinRoom(room.id, player);
      const updatedRoom = gameManager.getRoom(room.id);

      expect(success).toBe(true);
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0]).toBe(player);
    });

    it('should assign teams automatically', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: false,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: false,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);

      const updatedRoom = gameManager.getRoom(room.id);

      expect(updatedRoom?.players[0].team).toBe(1);
      expect(updatedRoom?.players[1].team).toBe(2);
    });

    it('should not add player if room is full', () => {
      const room = gameManager.createRoom('Test Room');

      // Adiciona 4 jogadores
      for (let i = 0; i < 4; i++) {
        const player: Player = {
          id: `${i}`,
          name: `Player ${i}`,
          hand: [],
          team: 1,
          isReady: false,
        };
        gameManager.joinRoom(room.id, player);
      }

      // Tenta adicionar o 5º jogador
      const extraPlayer: Player = {
        id: '5',
        name: 'Player 5',
        hand: [],
        team: 1,
        isReady: false,
      };

      const success = gameManager.joinRoom(room.id, extraPlayer);
      const updatedRoom = gameManager.getRoom(room.id);

      expect(success).toBe(false);
      expect(updatedRoom?.players).toHaveLength(4);
    });

    it('should return false for non-existent room', () => {
      const player: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: false,
      };

      const success = gameManager.joinRoom('non-existent', player);

      expect(success).toBe(false);
    });
  });

  describe('leaveRoom', () => {
    it('should remove player from room', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: false,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: false,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      const success = gameManager.leaveRoom(room.id, player1.id);
      const updatedRoom = gameManager.getRoom(room.id);

      expect(success).toBe(true);
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0].id).toBe(player2.id);
    });

    it('should delete room if last player leaves', () => {
      const room = gameManager.createRoom('Test Room');
      const player: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: false,
      };

      gameManager.joinRoom(room.id, player);
      gameManager.leaveRoom(room.id, player.id);
      const deletedRoom = gameManager.getRoom(room.id);

      expect(deletedRoom).toBeUndefined();
    });

    it('should return false for non-existent room', () => {
      const success = gameManager.leaveRoom('non-existent', '1');

      expect(success).toBe(false);
    });
  });

  describe('setPlayerReady', () => {
    it('should set player ready status', () => {
      const room = gameManager.createRoom('Test Room');
      const player: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: false,
      };

      gameManager.joinRoom(room.id, player);
      const success = gameManager.setPlayerReady(room.id, player.id, true);
      const updatedRoom = gameManager.getRoom(room.id);

      expect(success).toBe(true);
      expect(updatedRoom?.players[0].isReady).toBe(true);
    });
  });

  describe('startGame', () => {
    it('should start game when all players are ready', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);

      const gameState = gameManager.startGame(room.id);

      expect(gameState).toBeDefined();
      expect(gameState?.gameStarted).toBe(true);
      expect(gameState?.players).toHaveLength(2);
      expect(gameState?.vira).toBeDefined();
    });

    it('should not start game if not all players are ready', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: false,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);

      const gameState = gameManager.startGame(room.id);

      expect(gameState).toBeNull();
    });

    it('should not start game with less than 2 players', () => {
      const room = gameManager.createRoom('Test Room');
      const player: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player);

      const gameState = gameManager.startGame(room.id);

      expect(gameState).toBeNull();
    });

    it('should deal 3 cards to each player', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);

      const gameState = gameManager.startGame(room.id);

      expect(gameState?.players[0].hand).toHaveLength(3);
      expect(gameState?.players[1].hand).toHaveLength(3);
    });
  });

  describe('playCard', () => {
    it('should allow current player to play a card', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.startGame(room.id);

      const updatedRoom = gameManager.getRoom(room.id);
      const currentPlayer = updatedRoom?.gameState?.players[0];

      const gameState = gameManager.playCard(room.id, currentPlayer!.id, 0);

      expect(gameState).toBeDefined();
      expect(gameState?.playedCards).toHaveLength(1);
      expect(currentPlayer?.hand).toHaveLength(2);
    });

    it('should not allow non-current player to play', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.startGame(room.id);

      const updatedRoom = gameManager.getRoom(room.id);
      const nonCurrentPlayer = updatedRoom?.gameState?.players[1];

      const gameState = gameManager.playCard(room.id, nonCurrentPlayer!.id, 0);

      expect(gameState).toBeNull();
    });
  });

  describe('callTruco', () => {
    it('should allow player to call truco', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.startGame(room.id);

      const gameState = gameManager.callTruco(room.id, player1.id);

      expect(gameState).toBeDefined();
      expect(gameState?.waitingForResponse).toBe(true);
      expect(gameState?.trucoCalledBy).toBe(player1.team);
    });

    it('should not allow calling truco when already waiting for response', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.startGame(room.id);

      gameManager.callTruco(room.id, player1.id);
      const secondCall = gameManager.callTruco(room.id, player2.id);

      expect(secondCall).toBeNull();
    });

    it('should not allow calling truco in mão de ferro', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.startGame(room.id);

      // Simula mão de ferro
      const updatedRoom = gameManager.getRoom(room.id);
      if (updatedRoom?.gameState) {
        updatedRoom.gameState.score = { team1: 11, team2: 11 };
        updatedRoom.gameState.isMaoDeFerro = true;
      }

      const gameState = gameManager.callTruco(room.id, player1.id);

      expect(gameState).toBeNull();
    });
  });

  describe('respondTruco', () => {
    it('should allow opponent team to accept truco', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 2,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.startGame(room.id);

      gameManager.callTruco(room.id, player1.id);
      const gameState = gameManager.respondTruco(room.id, player2.id, true);

      expect(gameState).toBeDefined();
      expect(gameState?.trucoState).toBe('truco');
      expect(gameState?.waitingForResponse).toBe(false);
    });

    it('should not allow same team to respond', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 2,
        isReady: true,
      };
      const player3: Player = {
        id: '3',
        name: 'Player 3',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.joinRoom(room.id, player3);
      gameManager.startGame(room.id);

      gameManager.callTruco(room.id, player1.id);
      const gameState = gameManager.respondTruco(room.id, player3.id, true);

      expect(gameState).toBeNull();
    });

    it('should award points when truco is refused', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 2,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.startGame(room.id);

      gameManager.callTruco(room.id, player1.id);
      const gameState = gameManager.respondTruco(room.id, player2.id, false);

      expect(gameState).toBeDefined();
      // Team 1 pediu truco, então deve ganhar 1 ponto (estado era 'none')
      expect(gameState?.score.team1).toBe(1);
    });
  });

  describe('Edge Cases and Validations', () => {
    it('should prevent player from joining same room twice', () => {
      const room = gameManager.createRoom('Test Room');
      const player: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: false,
      };

      const firstJoin = gameManager.joinRoom(room.id, player);
      const secondJoin = gameManager.joinRoom(room.id, player);

      expect(firstJoin).toBe(true);
      expect(secondJoin).toBe(false);
    });

    it('should prevent playing card with invalid index', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 2,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.startGame(room.id);

      const updatedRoom = gameManager.getRoom(room.id);
      const currentPlayer = updatedRoom?.gameState?.players[0];

      // Tenta jogar com índice negativo
      const invalidNegative = gameManager.playCard(room.id, currentPlayer!.id, -1);
      expect(invalidNegative).toBeNull();

      // Tenta jogar com índice muito grande
      const invalidHigh = gameManager.playCard(room.id, currentPlayer!.id, 999);
      expect(invalidHigh).toBeNull();
    });

    it('should only allow current player or players who already played to call truco', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = {
        id: '1',
        name: 'Player 1',
        hand: [],
        team: 1,
        isReady: true,
      };
      const player2: Player = {
        id: '2',
        name: 'Player 2',
        hand: [],
        team: 2,
        isReady: true,
      };
      const player3: Player = {
        id: '3',
        name: 'Player 3',
        hand: [],
        team: 1,
        isReady: true,
      };

      gameManager.joinRoom(room.id, player1);
      gameManager.joinRoom(room.id, player2);
      gameManager.joinRoom(room.id, player3);
      gameManager.startGame(room.id);

      // Player 1 é o primeiro a jogar
      const updatedRoom = gameManager.getRoom(room.id);
      const currentPlayerIndex = updatedRoom?.gameState?.currentPlayerIndex;

      // Player 3 não jogou e não tem a vez - não pode pedir truco
      if (currentPlayerIndex !== 2) {
        const trucoCall = gameManager.callTruco(room.id, player3.id);
        expect(trucoCall).toBeNull();
      }

      // Player atual sempre pode pedir truco
      const currentPlayerId = updatedRoom?.gameState?.players[currentPlayerIndex!].id;
      const validTrucoCall = gameManager.callTruco(room.id, currentPlayerId!);
      expect(validTrucoCall).toBeDefined();
    });

    it('should handle room with maximum players', () => {
      const room = gameManager.createRoom('Test Room');
      const player1: Player = { id: '1', name: 'P1', hand: [], team: 1, isReady: false };
      const player2: Player = { id: '2', name: 'P2', hand: [], team: 2, isReady: false };
      const player3: Player = { id: '3', name: 'P3', hand: [], team: 1, isReady: false };
      const player4: Player = { id: '4', name: 'P4', hand: [], team: 2, isReady: false };
      const player5: Player = { id: '5', name: 'P5', hand: [], team: 1, isReady: false };

      expect(gameManager.joinRoom(room.id, player1)).toBe(true);
      expect(gameManager.joinRoom(room.id, player2)).toBe(true);
      expect(gameManager.joinRoom(room.id, player3)).toBe(true);
      expect(gameManager.joinRoom(room.id, player4)).toBe(true);
      expect(gameManager.joinRoom(room.id, player5)).toBe(false); // 5th player should fail

      const updatedRoom = gameManager.getRoom(room.id);
      expect(updatedRoom?.players).toHaveLength(4);
    });
  });
});
