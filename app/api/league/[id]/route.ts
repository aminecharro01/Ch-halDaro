import { NextRequest, NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (process.env.DEMO_MODE === "true") {
      const { getMockData } = await import("@/lib/mockData");
      const standings = getMockData('/standings', { league: id }) as any;
      const scorers = getMockData('/players/topscorers', { league: id }) as any;
      const assists = getMockData('/players/topassists', { league: id }) as any;
      const nextFixtures = getMockData('/fixtures', { league: id }) as any;
      
      return NextResponse.json({
        standings: standings?.[0]?.league?.standings || [],
        topScorers: scorers || [],
        topAssists: assists || [],
        lastFixtures: [],
        nextFixtures: nextFixtures || []
      });
    }

    const season = new Date().getFullYear() - 1; // Depending on month, 2024 is current season for most leagues now (e.g. 24/25)
    
    const [standingsData, topScorers, topAssists, lastFixtures, nextFixtures] = await Promise.all([
       fetchFootballApi('/standings', { league: id, season: String(season) }, 3600).catch(() => null),
       fetchFootballApi('/players/topscorers', { league: id, season: String(season) }, 3600).catch(() => null),
       fetchFootballApi('/players/topassists', { league: id, season: String(season) }, 3600).catch(() => null),
       fetchFootballApi('/fixtures', { league: id, season: String(season), last: '15' }, 3600).catch(() => null),
       fetchFootballApi('/fixtures', { league: id, season: String(season), next: '15' }, 3600).catch(() => null)
    ]);
    return NextResponse.json({ 
      standings: standingsData?.[0]?.league?.standings || [], 
      topScorers: topScorers || [],
      topAssists: topAssists || [],
      lastFixtures: lastFixtures || [],
      nextFixtures: nextFixtures || []
    });
  } catch (err: any) {
    console.error("League API Error", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
