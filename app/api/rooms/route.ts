import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(gameManager.getRoomSummaries());
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da sala é obrigatório' },
        { status: 400 }
      );
    }

    const room = gameManager.createRoom(name);
    return NextResponse.json({ id: room.id, name: room.name });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar sala' }, { status: 500 });
  }
}
