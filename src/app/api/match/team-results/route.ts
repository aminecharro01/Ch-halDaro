import { sportsDB } from '@/lib/api/sportsdb';
import { normalizeMatch } from '@/lib/api/normalizers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing team id' }, { status: 400 });
  }

  try {
    const data = await sportsDB.getTeamResults(id);
    const eventList = Array.isArray(data) ? data : [];
    const matches = eventList.map((e) => normalizeMatch(e));
    return NextResponse.json(matches);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load results';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
