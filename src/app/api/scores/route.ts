import { NextRequest, NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import { normalizeMatch } from '@/lib/api/normalizers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    // We use the day schedule for the scores feed
    // Note: getEventsByDay is currently in the client but uses V1 for daily lists
    // which is more reliable for full lists of leagues.
    const eventListRaw = await sportsDB.getEventsByDay(date);

    const matches = eventListRaw
      .map((m: any) => normalizeMatch(m));

    return NextResponse.json({ response: matches });
  } catch (error: any) {
    console.error("[API Scores] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
