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

    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Nome do jogador é obrigatório' },
        { status: 400 }
      );
    }

    const player: Player = {
      id: Math.random().toString(36).substring(7),
      name: playerName,
      hand: [],
      team: 1, // Será atribuído automaticamente
      isReady: false,
    };

    const success = gameManager.joinRoom(roomId, player);

    if (!success) {
      return NextResponse.json(
        { error: 'Não foi possível entrar na sala' },
        { status: 400 }
      );
    }

    return NextResponse.json({ player, room: gameManager.getRoom(roomId) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao entrar na sala' },
      { status: 500 }
    );
  }
}
