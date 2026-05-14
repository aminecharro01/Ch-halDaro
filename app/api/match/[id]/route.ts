import { NextRequest, NextResponse } from 'next/server';
import {
  getMatchDetail,
  getMatchTimeline,
  getTeamSquad,
  getMatchStatistics,
  getMatchLineup,
  getMatchTV,
  getMatchMedia,
  getTeamEventsPast,
  getLeagueStandings,
} from '@/lib/thesportsdb';
import { mapMatch, mapTimeline, mapStats, mapStandings } from '@/lib/api-adapter';
import { getMatchAnalysis } from '@/lib/analysis-engine';
import { extractHeadToHead } from '@/lib/match-head-to-head';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const [eventData, timelineRes, statsRes, lineupRes, tvRes, mediaRes] = await Promise.all([
      getMatchDetail(id).catch(() => []),
      getMatchTimeline(id).catch(() => []),
      getMatchStatistics(id).catch(() => []),
      getMatchLineup(id).catch(() => []),
      getMatchTV(id).catch(() => []),
      getMatchMedia(id).catch(() => [])
    ]);

    const event = Array.isArray(eventData) ? eventData[0] : (eventData.event?.[0] || eventData.events?.[0]);
    const timeline = Array.isArray(timelineRes) ? timelineRes : [];

    const homeTeamIdNum = parseInt(event?.idHomeTeam || event?.home_id);
    const awayTeamIdNum = parseInt(event?.idAwayTeam || event?.away_id);
    const homeTeamId = String(homeTeamIdNum);
    const awayTeamId = String(awayTeamIdNum);

    // Stats Mapping
    let stats = mapStats(statsRes);
    if (stats.length === 0) {
      // Fallback stats if empty
      stats = [
        {
          team: { id: homeTeamId, name: event?.strHomeTeam || event?.home_name },
          statistics: [
            { type: "Goals", value: parseInt(event?.intHomeScore || event?.home_score) || 0 },
            { type: "Yellow Cards", value: timeline.filter((e: any) => parseInt(e.idTeam || e.team_id) === homeTeamIdNum && (e.strTimeline || e.type)?.toLowerCase().includes("yellow")).length },
            { type: "Red Cards", value: timeline.filter((e: any) => parseInt(e.idTeam || e.team_id) === homeTeamIdNum && (e.strTimeline || e.type)?.toLowerCase().includes("red")).length }
          ]
        },
        {
          team: { id: awayTeamId, name: event?.strAwayTeam || event?.away_name },
          statistics: [
            { type: "Goals", value: parseInt(event?.intAwayScore || event?.away_score) || 0 },
            { type: "Yellow Cards", value: timeline.filter((e: any) => parseInt(e.idTeam || e.team_id) === awayTeamIdNum && (e.strTimeline || e.type)?.toLowerCase().includes("yellow")).length },
            { type: "Red Cards", value: timeline.filter((e: any) => parseInt(e.idTeam || e.team_id) === awayTeamIdNum && (e.strTimeline || e.type)?.toLowerCase().includes("red")).length }
          ]
        }
      ];
    }

    // Lineup Mapping
    let lineups: any[] = [];
    if (Array.isArray(lineupRes) && lineupRes.length > 0) {
      const homeXI = lineupRes.filter((l: any) => l.strPosition !== 'Substitution' && parseInt(l.idTeam) === homeTeamIdNum);
      const awayXI = lineupRes.filter((l: any) => l.strPosition !== 'Substitution' && parseInt(l.idTeam) === awayTeamIdNum);
      lineups = [
        { 
          team: { name: event?.strHomeTeam }, 
          formation: event?.strHomeFormation || "4-3-3", 
          startXI: homeXI.map((l: any) => ({ 
            player: { name: l.strPlayer, number: l.intSquadNumber, position: l.strPosition } 
          })) 
        },
        { 
          team: { name: event?.strAwayTeam }, 
          formation: event?.strAwayFormation || "4-3-3", 
          startXI: awayXI.map((l: any) => ({ 
            player: { name: l.strPlayer, number: l.intSquadNumber, position: l.strPosition } 
          })) 
        }
      ];
    }

    if (lineups.length === 0) {
      // Fallback to squads
      const [homeSquad, awaySquad] = await Promise.all([
        getTeamSquad(homeTeamId).catch(() => []),
        getTeamSquad(awayTeamId).catch(() => [])
      ]);

      const mapSquadToLineup = (squad: any) => {
        const players = (Array.isArray(squad) ? squad : (squad.player || squad.players || [])).slice(0, 11);
        return players.map((p: any, i: number) => {
          let pos = p.strPosition || "";
          if (!pos) {
            if (i === 0) pos = "Goalkeeper";
            else if (i < 5) pos = "Defender";
            else if (i < 8) pos = "Midfielder";
            else pos = "Forward";
          }
          return { player: { name: p.strPlayer, number: p.strNumber || i+1, position: pos } };
        });
      };

      lineups = [
        { 
          team: { name: event?.strHomeTeam || event?.home_name }, 
          formation: "4-3-3", 
          startXI: mapSquadToLineup(homeSquad)
        },
        { 
          team: { name: event?.strAwayTeam || event?.away_name }, 
          formation: "4-3-3", 
          startXI: mapSquadToLineup(awaySquad)
        }
      ];
    }

    const fixture = event ? mapMatch(event) : null;
    const mappedTimeline = mapTimeline(timeline);

    console.log(`[Match API] Mapped ${mappedTimeline.length} events for ${id}`);

    const analysis = fixture ? await getMatchAnalysis(fixture, mappedTimeline, stats) : null;

    const tv = Array.isArray(tvRes) ? tvRes : (tvRes.lookup || []);
    const media = Array.isArray(mediaRes) ? mediaRes[0] : (mediaRes.lookup?.[0] || mediaRes.media?.[0] || {});

    let headToHead: NonNullable<ReturnType<typeof mapMatch>>[] = [];
    let leagueTable: { standings: ReturnType<typeof mapStandings>; leagueId: number; season: string } | null = null;

    if (event && homeTeamIdNum && awayTeamIdNum) {
      const leagueIdNum = parseInt(String(event.idLeague || event.league_id || ''), 10);
      const season = String(event.strSeason || '2025-2026');
      const currentEventId = parseInt(String(event.idEvent || id), 10);

      const [homePast, awayPast, standingsRaw] = await Promise.all([
        getTeamEventsPast(String(homeTeamIdNum)).catch(() => []),
        getTeamEventsPast(String(awayTeamIdNum)).catch(() => []),
        leagueIdNum ? getLeagueStandings(String(leagueIdNum), season).catch(() => []) : Promise.resolve([]),
      ]);

      headToHead = extractHeadToHead(homePast, awayPast, homeTeamIdNum, awayTeamIdNum, currentEventId, 12);

      if (leagueIdNum) {
        let rows = Array.isArray(standingsRaw)
          ? standingsRaw
          : ((standingsRaw as { table?: unknown[] })?.table ?? (standingsRaw as { standings?: unknown[] })?.standings ?? []);
        if (rows.length && Array.isArray(rows[0])) rows = (rows as unknown[][]).flat();
        const standings = mapStandings(rows as any[]);
        if (standings.length) {
          leagueTable = { standings, leagueId: leagueIdNum, season };
        }
      }
    }

    const data = {
      fixture,
      lineups,
      events: mappedTimeline,
      statistics: stats,
      analysis,
      tv,
      media,
      injuries: [],
      headToHead,
      leagueTable,
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Match Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
