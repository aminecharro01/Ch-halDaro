import { NextRequest, NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const season = new Date().getFullYear() - 1; // Depending on month, 2024 is current season for most leagues now (e.g. 24/25)
    
    const [standingsData, topScorers, topAssists, fixtures] = await Promise.all([
       fetchFootballApi('/standings', { league: id, season: String(season) }).catch(() => null),
       fetchFootballApi('/players/topscorers', { league: id, season: String(season) }).catch(() => null),
       fetchFootballApi('/players/topassists', { league: id, season: String(season) }).catch(() => null),
       fetchFootballApi('/fixtures', { league: id, season: String(season), last: '10' }).catch(() => null)
    ]);
    return NextResponse.json({ 
      standings: standingsData?.[0]?.league?.standings?.[0] || [], 
      topScorers: topScorers || [],
      topAssists: topAssists || [],
      fixtures: fixtures || []
    });
  } catch (err: any) {
    console.error("League API Error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
