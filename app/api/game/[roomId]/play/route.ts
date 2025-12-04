import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerId, cardIndex } = await request.json();

    if (!playerId || typeof cardIndex !== 'number') {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    const gameState = gameManager.playCard(roomId, playerId, cardIndex);

    if (!gameState) {
      return NextResponse.json(
        { error: 'Não foi possível jogar a carta' },
        { status: 400 }
      );
    }

    return NextResponse.json(gameState);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao jogar carta' },
      { status: 500 }
    );
  }
}
