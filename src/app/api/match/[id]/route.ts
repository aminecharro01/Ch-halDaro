import { NextRequest, NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import { extractHeadToHead } from '@/lib/match-head-to-head';
import { mapStandings } from '@/lib/api/normalizers';
import { squadsToLineups, lineupsHavePlayers } from '@/lib/squad-lineup';
import { DEFAULT_SEASON } from '@/lib/season';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [fixture, events, statistics, lineupsRaw, tv, media] = await Promise.all([
      sportsDB.getMatchDetails(id),
      sportsDB.getMatchTimeline(id),
      sportsDB.getMatchStats(id),
      sportsDB.getMatchLineup(id),
      sportsDB.getMatchTV(id).catch(() => []),
      sportsDB.getMatchHighlights(id).catch(() => ({})),
    ]);

    if (!fixture) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    let headToHead: ReturnType<typeof extractHeadToHead> = [];
    let leagueTable: { standings: ReturnType<typeof mapStandings>; leagueId: number; season: string } | null = null;

    const homeId = String(fixture.teams.home.id);
    const awayId = String(fixture.teams.away.id);
    const leagueId = String(fixture.league.id);
    const season = fixture.fixture.season || DEFAULT_SEASON;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lineups: any = lineupsRaw;

    if (!lineupsHavePlayers(lineups) && homeId && awayId) {
      const [homeSquad, awaySquad] = await Promise.all([
        sportsDB.getTeamSquad(homeId).catch(() => []),
        sportsDB.getTeamSquad(awayId).catch(() => []),
      ]);
      const fromSquad = squadsToLineups(
        homeSquad,
        awaySquad,
        fixture.teams.home.name,
        fixture.teams.away.name
      );
      if (fromSquad.length) lineups = fromSquad;
    }

    if (homeId && awayId) {
      const [homePast, awayPast, standingsRaw] = await Promise.all([
        sportsDB.getTeamResults(homeId).catch(() => []),
        sportsDB.getTeamResults(awayId).catch(() => []),
        sportsDB.getLeagueStandings(leagueId, season).catch(() => []),
      ]);

      headToHead = extractHeadToHead(
        homePast,
        awayPast,
        parseInt(homeId, 10),
        parseInt(awayId, 10),
        parseInt(id, 10),
        12
      );

      const standings = mapStandings(standingsRaw);
      if (standings.length) {
        leagueTable = { standings, leagueId: parseInt(leagueId, 10), season };
      }
    }

    return NextResponse.json({
      fixture,
      events,
      statistics,
      lineups,
      analysis: null,
      tv,
      media,
      injuries: [],
      headToHead,
      leagueTable,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[API Match] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
