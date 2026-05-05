import { NextRequest, NextResponse } from 'next/server';
import { fetchFootballApi } from '@/lib/api-football';

const regionLeagues: Record<string, number[]> = {
  'europe': [39, 140, 135, 78, 61, 2, 3], 
  'south-america': [13, 71, 103, 128], 
  'asia': [17, 106, 98, 146], 
  'africa': [6, 1], 
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const leagueIds = regionLeagues[id] || [];
    
    if (leagueIds.length === 0) {
      return NextResponse.json({ leagues: [] });
    }

    // Fetch basic info for each league in the region
    const leagues = await Promise.all(
      leagueIds.map(async (leagueId) => {
        const data = await fetchFootballApi('/leagues', { id: String(leagueId) }).catch(() => null);
        return data?.[0] || null;
      })
    );

    return NextResponse.json({ 
      region: id,
      leagues: leagues.filter(l => l !== null) 
    });
  } catch (err: any) {
    console.error("Region API Error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
