import { NextRequest, NextResponse } from 'next/server';
import { fetchTheSportsDb } from '@/lib/thesportsdb';

const regionLeagues: Record<string, string[]> = {
  'europe': ['4328', '4335', '4332', '4331', '4334', '4480'], 
  'south-america': ['4425', '4426'], 
  'asia': ['4431'], 
  'africa': ['4422', '4520'], 
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
        const data = await fetchTheSportsDb('lookupleague.php', { id: leagueId }).catch(() => null);
        const league = data?.leagues?.[0];
        if (!league) return null;
        return {
          league: {
            id: parseInt(league.idLeague),
            name: league.strLeague,
            logo: league.strBadge
          }
        };
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
