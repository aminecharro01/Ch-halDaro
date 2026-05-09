import { NextRequest, NextResponse } from 'next/server';
import { getLeagueStandings, getLeagueEventsPast, getLeagueEventsNext } from '@/lib/thesportsdb';
import { mapStandings, mapMatch } from '@/lib/api-adapter';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const season = '2024-2025'; // Standard season for now
    
    const [standingsData, lastFixtures, nextFixtures] = await Promise.all([
       getLeagueStandings(id, season).catch(() => []),
       getLeagueEventsPast(id).catch(() => []),
       getLeagueEventsNext(id).catch(() => [])
    ]);

    const getMockScorers = (leagueId: string) => {
      // Basic mock data for demo
      const players: Record<string, any[]> = {
        '4328': [{ player: { name: 'E. Haaland', id: 1, photo: 'https://www.thesportsdb.com/images/media/player/thumb/p7uuvr1661101908.jpg' }, statistics: [{ team: { name: 'Man City' }, goals: { total: 25 } }] }],
        '4335': [{ player: { name: 'R. Lewandowski', id: 2, photo: 'https://www.thesportsdb.com/images/media/player/thumb/6tq1r91660144962.jpg' }, statistics: [{ team: { name: 'Barcelona' }, goals: { total: 20 } }] }],
        '4332': [{ player: { name: 'L. Martinez', id: 3, photo: 'https://www.thesportsdb.com/images/media/player/thumb/v9v9v31661101836.jpg' }, statistics: [{ team: { name: 'Inter' }, goals: { total: 22 } }] }],
        '4520': [{ player: { name: 'S. Rahimi', id: 4, photo: '' }, statistics: [{ team: { name: 'Raja' }, goals: { total: 15 } }] }]
      };
      return players[leagueId] || [];
    };

    return NextResponse.json({ 
      standings: mapStandings(Array.isArray(standingsData) ? standingsData : (standingsData.table || standingsData.standings || [])), 
      topScorers: getMockScorers(id), 
      topAssists: [], 
      lastFixtures: (Array.isArray(lastFixtures) ? lastFixtures : (lastFixtures.results || lastFixtures.fixtures || [])).map(mapMatch),
      nextFixtures: (Array.isArray(nextFixtures) ? nextFixtures : (nextFixtures.events || nextFixtures.fixtures || [])).map(mapMatch)
    });
  } catch (err: any) {
    console.error("League API Error", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
