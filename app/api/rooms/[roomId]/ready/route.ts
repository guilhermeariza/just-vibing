import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerId, ready } = await request.json();

    if (!playerId || typeof ready !== 'boolean') {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    const success = gameManager.setPlayerReady(roomId, playerId, ready);

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao atualizar status' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, room: gameManager.getRoom(roomId) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar status' },
      { status: 500 }
    );
  }
}
