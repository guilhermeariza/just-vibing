import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { playerId, accept, raise } = body;

    if (typeof playerId !== 'string' || !playerId) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório' }, { status: 400 });
    }
    if (typeof accept !== 'boolean') {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    if (!gameManager.respondTruco(roomId, playerId, accept, raise === true)) {
      return NextResponse.json({ error: 'Não foi possível responder ao truco' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
