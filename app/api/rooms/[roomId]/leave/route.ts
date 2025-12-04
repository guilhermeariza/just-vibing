import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: 'ID do jogador é obrigatório' },
        { status: 400 }
      );
    }

    const success = gameManager.leaveRoom(roomId, playerId);

    if (!success) {
      return NextResponse.json(
        { error: 'Não foi possível sair da sala' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao sair da sala' },
      { status: 500 }
    );
  }
}
