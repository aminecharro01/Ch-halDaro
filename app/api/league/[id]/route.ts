import { NextRequest, NextResponse } from 'next/server';
import { getLeagueStandings, getLeagueEventsPast, getLeagueEventsNext, getLeagueDetails, getLeagueTeams } from '@/lib/thesportsdb';
import { mapStandings, mapMatch, mapLeague, mapTeam } from '@/lib/api-adapter';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const season = '2025-2026';
    
    const [standingsData, lastFixtures, nextFixtures, leagueInfo, teamsData] = await Promise.all([
       getLeagueStandings(id, season).catch(() => []),
       getLeagueEventsPast(id).catch(() => []),
       getLeagueEventsNext(id).catch(() => []),
       getLeagueDetails(id).catch(() => null),
       getLeagueTeams(id).catch(() => [])
    ]);

    const getMockScorers = (leagueId: string) => {
      const players: Record<string, any[]> = {
        '4328': [
          { player: { name: 'Harry Kane', id: 34146220, photo: 'https://www.thesportsdb.com/images/media/player/thumb/xk0gd71699458766.jpg' }, statistics: [{ team: { name: 'Bayern Munich', logo: 'https://r2.thesportsdb.com/images/media/team/badge/01ogkh1716960412.png' }, goals: { total: 32 } }] },
          { player: { name: 'E. Haaland', id: 34170397, photo: 'https://www.thesportsdb.com/images/media/player/thumb/6tq1r91660144962.jpg' }, statistics: [{ team: { name: 'Man City', logo: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png' }, goals: { total: 25 } }] }
        ],
        '4480': [
          { player: { name: 'K. Mbappe', id: 34146221, photo: 'https://www.thesportsdb.com/images/media/player/thumb/xk0gd71699458766.jpg' }, statistics: [{ team: { name: 'Real Madrid', logo: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png' }, goals: { total: 8 } }] },
          { player: { name: 'V. Junior', id: 34170398, photo: 'https://www.thesportsdb.com/images/media/player/thumb/6tq1r91660144962.jpg' }, statistics: [{ team: { name: 'Real Madrid', logo: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png' }, goals: { total: 7 } }] }
        ],
        '4335': [{ player: { name: 'R. Lewandowski', id: 2, photo: 'https://www.thesportsdb.com/images/media/player/thumb/6tq1r91660144962.jpg' }, statistics: [{ team: { name: 'Barcelona', logo: 'https://r2.thesportsdb.com/images/media/team/badge/small/66048q1611394142.png' }, goals: { total: 20 } }] }],
        '4332': [{ player: { name: 'L. Martinez', id: 3, photo: 'https://www.thesportsdb.com/images/media/player/thumb/v9v9v31661101836.jpg' }, statistics: [{ team: { name: 'Inter', logo: 'https://r2.thesportsdb.com/images/media/team/badge/small/1vj2441680190928.png' }, goals: { total: 22 } }] }],
        '4520': [{ player: { name: 'S. Rahimi', id: 4, photo: '' }, statistics: [{ team: { name: 'Raja', logo: 'https://www.thesportsdb.com/images/media/team/badge/small/9m769m1601041187.png' }, goals: { total: 15 } }] }]
      };
      return players[leagueId] || [];
    };

    const getMockAssists = (leagueId: string) => {
       const players: Record<string, any[]> = {
        '4328': [{ player: { name: 'K. De Bruyne', id: 10, photo: 'https://www.thesportsdb.com/images/media/player/thumb/p7uuvr1661101908.jpg' }, statistics: [{ team: { name: 'Man City', logo: 'https://r2.thesportsdb.com/images/media/team/badge/small/v2v9v31680191836.png' }, goals: { assists: 12 } }] }],
        '4480': [{ player: { name: 'J. Bellingham', id: 11, photo: 'https://www.thesportsdb.com/images/media/player/thumb/p7uuvr1661101908.jpg' }, statistics: [{ team: { name: 'Real Madrid', logo: 'https://r2.thesportsdb.com/images/media/team/badge/small/v2v9v31680191836.png' }, goals: { assists: 5 } }] }],
       };
       return players[leagueId] || [];
    };

    return NextResponse.json({ 
      league: Array.isArray(leagueInfo) ? mapLeague(leagueInfo[0]) : null,
      standings: mapStandings(Array.isArray(standingsData) ? standingsData : []), 
      topScorers: getMockScorers(id), 
      topAssists: getMockAssists(id), 
      lastFixtures: (Array.isArray(lastFixtures) ? lastFixtures : (lastFixtures.results || lastFixtures.fixtures || [])).map(mapMatch),
      nextFixtures: (Array.isArray(nextFixtures) ? nextFixtures : (nextFixtures.events || nextFixtures.fixtures || [])).map(mapMatch),
      teams: (Array.isArray(teamsData) ? teamsData : []).map(mapTeam)
    });
  } catch (err: any) {
    console.error("League API Error", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
