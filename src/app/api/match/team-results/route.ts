import { sportsDB } from '@/lib/api/sportsdb';
import { normalizeMatch } from '@/lib/api/normalizers';
import { filterCurrentSeasonMatches } from '@/lib/season';
import { FINISHED_STATUS_CODES } from '@/lib/api/status-map';
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
    const matches = eventList
      .map((e) => normalizeMatch(e))
      .filter((m) => FINISHED_STATUS_CODES.includes(m.fixture.status.short));

    const seasonFiltered = filterCurrentSeasonMatches(matches);

    return NextResponse.json(seasonFiltered);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load results';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
