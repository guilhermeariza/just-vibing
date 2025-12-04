import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const gameState = gameManager.startGame(roomId);

    if (!gameState) {
      return NextResponse.json(
        { error: 'Não foi possível iniciar o jogo. Verifique se todos estão prontos.' },
        { status: 400 }
      );
    }

    return NextResponse.json(gameState);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao iniciar jogo' },
      { status: 500 }
    );
  }
}
