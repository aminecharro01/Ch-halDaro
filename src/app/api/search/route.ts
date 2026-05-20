import { NextRequest, NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';

function mapTeam(t: Record<string, unknown>) {
  return {
    id: String(t.idTeam ?? t.id ?? ''),
    name: String(t.strTeam ?? t.name ?? ''),
    logo: (t.strBadge || t.strTeamBadge || t.strLogo) as string | undefined,
    type: 'team' as const,
  };
}

function mapLeague(l: Record<string, unknown>) {
  return {
    id: String(l.idLeague ?? l.id ?? ''),
    name: String(l.strLeague ?? l.name ?? ''),
    logo: (l.strBadge || l.strLogo) as string | undefined,
    type: 'league' as const,
  };
}

function mapPlayer(p: Record<string, unknown>) {
  return {
    id: String(p.idPlayer ?? p.id ?? ''),
    name: String(p.strPlayer ?? p.name ?? ''),
    photo: (p.strThumb || p.strCutout) as string | undefined,
    type: 'player' as const,
  };
}

function asArray(raw: unknown): Record<string, unknown>[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  return [];
}

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ teams: [], leagues: [], players: [] });
  }

  try {
    const [teamsRaw, leaguesRaw, playersRaw] = await Promise.all([
      sportsDB.searchTeams(q).catch(() => []),
      sportsDB.searchLeagues(q).catch(() => []),
      sportsDB.searchPlayers(q).catch(() => []),
    ]);

    const teams = asArray(teamsRaw)
      .map(mapTeam)
      .filter((t) => t.id && t.name)
      .slice(0, 8);

    const leagues = asArray(leaguesRaw)
      .map(mapLeague)
      .filter((l) => l.id && l.name)
      .slice(0, 6);

    const playersRawArr = Array.isArray(playersRaw)
      ? playersRaw
      : playersRaw
        ? [playersRaw]
        : [];
    const players = (playersRawArr as Record<string, unknown>[])
      .map(mapPlayer)
      .filter((p) => p.id && p.name)
      .slice(0, 6);

    return NextResponse.json({ teams, leagues, players });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('[Search API]', message);
    return NextResponse.json({ error: message, teams: [], leagues: [], players: [] }, { status: 500 });
  }
}
