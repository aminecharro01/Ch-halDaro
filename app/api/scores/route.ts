import { NextResponse } from 'next/server';
import { getEventsByDay } from '@/lib/thesportsdb';
import { mapMatch } from '@/lib/api-adapter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const data = await getEventsByDay(date);
    const eventList = Array.isArray(data) ? data : (data.events || data.livescore || []);
    const matches = eventList
      .filter((m: any) => (m.strSport || m.sport) === 'Soccer')
      .map((m: any) => mapMatch(m));

    // Deduplicate by fixture ID
    const uniqueMatches = Array.from(new Map(matches.map((m: any) => [m.fixture.id, m])).values());

    return NextResponse.json({ response: uniqueMatches });
  } catch (error: any) {
    console.error("API Scores Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
