import { NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const player = await sportsDB.getPlayer(id);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json({ player });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load player';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
