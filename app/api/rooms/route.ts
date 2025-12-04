import { NextRequest, NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function GET() {
  const rooms = gameManager.getAllRooms();
  return NextResponse.json(rooms);
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nome da sala é obrigatório' },
        { status: 400 }
      );
    }

    const room = gameManager.createRoom(name);
    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar sala' },
      { status: 500 }
    );
  }
}
