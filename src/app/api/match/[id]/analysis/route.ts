import { NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import { getMatchAnalysis } from '@/lib/analysis-engine';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [fixture, events, statistics] = await Promise.all([
      sportsDB.getMatchDetails(id),
      sportsDB.getMatchTimeline(id),
      sportsDB.getMatchStats(id),
    ]);

    if (!fixture) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const analysis = await getMatchAnalysis(fixture, events, statistics);
    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
