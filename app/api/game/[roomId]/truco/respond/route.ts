import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerId, accept } = await request.json();

    if (!playerId || typeof accept !== 'boolean') {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    const gameState = gameManager.respondTruco(roomId, playerId, accept);

    if (!gameState) {
      return NextResponse.json(
        { error: 'Não foi possível responder ao truco' },
        { status: 400 }
      );
    }

    return NextResponse.json(gameState);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao responder truco' },
      { status: 500 }
    );
  }
}
