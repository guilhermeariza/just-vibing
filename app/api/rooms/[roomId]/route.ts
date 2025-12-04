import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const room = gameManager.getRoom(roomId);

  if (!room) {
    return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });
  }

  return NextResponse.json(room);
}
