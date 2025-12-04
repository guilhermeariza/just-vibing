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

    const gameState = gameManager.callTruco(roomId, playerId);

    if (!gameState) {
      return NextResponse.json(
        { error: 'Não foi possível pedir truco' },
        { status: 400 }
      );
    }

    return NextResponse.json(gameState);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao pedir truco' },
      { status: 500 }
    );
  }
}
