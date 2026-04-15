import { NextRequest, NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // According to documentation, we can parallelize these requests
    const [fixtureData, lineupsData, eventsData, statsData] = await Promise.all([
      fetchFootballApi('/fixtures', { id }),
      fetchFootballApi('/fixtures/lineups', { fixture: id }),
      fetchFootballApi('/fixtures/events', { fixture: id }),
      fetchFootballApi('/fixtures/statistics', { fixture: id })
    ]);

    const data = {
      fixture: fixtureData[0] || null,
      lineups: lineupsData || [],
      events: eventsData || [],
      statistics: statsData || []
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Match Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
