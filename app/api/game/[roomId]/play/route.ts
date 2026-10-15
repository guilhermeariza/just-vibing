import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { playerId, cardIndex } = body;

    if (typeof playerId !== 'string' || !playerId) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório' }, { status: 400 });
    }
    if (!Number.isInteger(cardIndex)) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    if (!gameManager.playCard(roomId, playerId, cardIndex)) {
      return NextResponse.json({ error: 'Não foi possível jogar a carta' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
