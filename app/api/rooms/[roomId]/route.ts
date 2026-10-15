import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const playerId = request.nextUrl.searchParams.get('playerId');
  const room = gameManager.getRoomView(roomId, playerId);

  if (!room) {
    return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });
  }

  return NextResponse.json(room, { headers: { 'Cache-Control': 'no-store' } });
}
