import { NextRequest, NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import { normalizeMatch, mapStandings } from '@/lib/api/normalizers';
import { pickCurrentSeason } from '@/lib/season';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const seasonsList = await sportsDB.getLeagueSeasons(id).catch(() => []);
    const seasonNames = seasonsList
      .map((s: { strSeason?: string }) => s.strSeason)
      .filter(Boolean) as string[];
    const season = searchParams.get('season') || pickCurrentSeason(seasonNames);

    const [standingsData, lastFixtures, nextFixtures, leagueInfo, teamsData] = await Promise.all([
      sportsDB.getLeagueStandings(id, season).catch(() => []),
      sportsDB.getLeagueResults(id).catch(() => []),
      sportsDB.getLeagueFixtures(id).catch(() => []),
      sportsDB.getLeagueDetails(id).catch(() => null),
      sportsDB.getLeagueTeams(id).catch(() => []),
    ]);

    const leagueRow = Array.isArray(leagueInfo) ? leagueInfo[0] : leagueInfo;

    return NextResponse.json(
      {
        league: leagueRow
          ? {
              id: leagueRow.idLeague,
              name: leagueRow.strLeague,
              logo: leagueRow.strBadge || leagueRow.strLogo,
              country: leagueRow.strCountry,
              season,
              banner: leagueRow.strBanner,
              description: leagueRow.strDescriptionEN || leagueRow.strDescription,
              social: {
                website: leagueRow.strWebsite,
                facebook: leagueRow.strFacebook,
                twitter: leagueRow.strTwitter,
                instagram: leagueRow.strInstagram,
              },
            }
          : null,
        standings: mapStandings(standingsData),
        topScorers: [],
        topAssists: [],
        lastFixtures: lastFixtures.map((e: unknown) => normalizeMatch(e)),
        nextFixtures: nextFixtures.map((e: unknown) => normalizeMatch(e)),
        teams: teamsData,
        seasons: seasonNames,
      },
      {
        headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'League load failed';
    console.error('[API League] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
