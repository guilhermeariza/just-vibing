import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

import { Player } from '@/types/game';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerName } = await request.json();

    if (typeof playerName !== 'string' || !playerName.trim()) {
      return NextResponse.json(
        { error: 'Nome do jogador é obrigatório' },
        { status: 400 }
      );
    }

    const room = gameManager.getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });
    }
    if (room.gameState?.gameStarted) {
      return NextResponse.json({ error: 'O jogo já começou' }, { status: 400 });
    }
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json({ error: 'Sala cheia' }, { status: 400 });
    }

    const player: Player = {
      id: randomUUID(),
      name: playerName,
      hand: [],
      team: 1, // Será atribuído automaticamente
      isReady: false,
    };

    if (!gameManager.joinRoom(roomId, player)) {
      return NextResponse.json(
        { error: 'Nome já em uso nesta sala' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      player: { id: player.id, name: player.name, team: player.team },
      room: gameManager.getRoomView(roomId, player.id),
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao entrar na sala' }, { status: 500 });
  }
}
