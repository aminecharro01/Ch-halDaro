import { NextRequest, NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (process.env.DEMO_MODE === "true") {
      const { getMockData } = await import("@/lib/mockData");
      const fixtureData = getMockData('/fixtures', { id }) as any;
      const lineupsData = getMockData('/fixtures/lineups', { fixture: id }) as any;
      const eventsData = getMockData('/fixtures/events', { fixture: id }) as any;
      const statsData = getMockData('/fixtures/statistics', { fixture: id }) as any;
      const injuriesData = getMockData('/fixtures/injuries', { fixture: id }) as any;
      
      return NextResponse.json({
        fixture: fixtureData[0] || (fixtureData.fixture ? fixtureData : null), // Handle both list and object
        lineups: lineupsData || [],
        events: eventsData || [],
        statistics: statsData || [],
        injuries: injuriesData || []
      });
    }
    
    // According to documentation, we can parallelize these requests
    const [fixtureData, lineupsData, eventsData, statsData, injuriesData] = await Promise.all([
      fetchFootballApi('/fixtures', { id }).catch(err => { console.error("Fixture fail", err); return []; }),
      fetchFootballApi('/fixtures/lineups', { fixture: id }).catch(() => []),
      fetchFootballApi('/fixtures/events', { fixture: id }).catch(() => []),
      fetchFootballApi('/fixtures/statistics', { fixture: id }).catch(() => []),
      fetchFootballApi('/fixtures/injuries', { fixture: id }).catch(() => [])
    ]);

    const data = {
      fixture: fixtureData[0] || null,
      lineups: lineupsData || [],
      events: eventsData || [],
      statistics: statsData || [],
      injuries: injuriesData || []
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Match Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
