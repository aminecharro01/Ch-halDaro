import { mapMatchStatus } from './status-map';

export const normalizeMatch = (event: any) => {
  const rawStatus = event.strStatus ?? event.strProgress ?? '';
  const short = mapMatchStatus(rawStatus);
  const elapsed = parseInt(event.intProgress || event.intTime || '0', 10);
  // If status is a minute string, use it as elapsed
  const minuteFromStatus = /^\d+$/.test(String(rawStatus).trim())
    ? parseInt(String(rawStatus).trim(), 10)
    : 0;

  return {
    fixture: {
      id: parseInt(event.idEvent || event.event_id, 10),
      date: event.strTimestamp || `${event.dateEvent}T${event.strTime || '00:00:00'}`,
      venue: {
        name: event.strVenue,
        city: event.strCity,
        id: event.idVenue ? parseInt(event.idVenue, 10) : undefined,
      },
      status: {
        long: event.strStatus,
        short,
        elapsed: minuteFromStatus || elapsed,
        round: event.intRound,
      },
      description: event.strDescriptionEN || event.strDescription || null,
      spectators: event.intSpectators ? parseInt(event.intSpectators, 10) : null,
      official: event.strOfficial || null,
      postponed: event.strPostponed === 'yes',
      group: event.strGroup || null,
      season: event.strSeason || null,
    },
    league: {
      id: parseInt(event.idLeague, 10),
      name: event.strLeague,
      logo: event.strBadge || event.strLeagueBadge,
      country: event.strCountry,
    },
    teams: {
      home: {
        id: parseInt(event.idHomeTeam, 10),
        name: event.strHomeTeam,
        logo: event.strHomeTeamBadge,
      },
      away: {
        id: parseInt(event.idAwayTeam, 10),
        name: event.strAwayTeam,
        logo: event.strAwayTeamBadge,
      },
    },
    goals: {
      home: parseInt(event.intHomeScore || '0', 10),
      away: parseInt(event.intAwayScore || '0', 10),
    },
    video: event.strVideo || null,
    media: {
      thumb: event.strThumb,
      poster: event.strPoster,
      banner: event.strBanner,
      fanart: event.strFanart,
      square: event.strSquare,
      video: event.strVideo,
    },
  };
};

export const normalizeTimeline = (timeline: any[]): any[] => {
  if (!Array.isArray(timeline)) return [];
  return timeline.map((item) => ({
    id: item.idTimeline || item.id,
    minute: parseInt(item.intTime || item.time || '0', 10),
    type: mapTimelineType(item.strTimeline || item.type),
    team: item.strHome === 'Yes' || item.strHome === 'home' ? 'home' : 'away',
    player: item.strPlayer || item.player_name || 'Unknown Player',
    assist: item.strAssist || null,
    detail: item.strTimelineDetail || item.detail || '',
  }));
};

const mapTimelineType = (type: string) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('goal')) return 'goal';
  if (t.includes('yellow')) return 'yellowcard';
  if (t.includes('red')) return 'redcard';
  if (t.includes('subst')) return 'substitution';
  if (t.includes('var')) return 'var';
  return 'other';
};

export const normalizeStats = (stats: any[]) => {
  if (!Array.isArray(stats) || stats.length === 0) return [];

  const first = stats[0];
  const isV2 =
    first &&
    (first.intHome !== undefined ||
      first.intAway !== undefined ||
      (first.strStat && !first.strHome));

  if (isV2 && (first.intHome !== undefined || first.intAway !== undefined)) {
    const homeStats = stats.map((s) => ({
      type: s.strStat,
      value: String(s.intHome ?? '0'),
    }));
    const awayStats = stats.map((s) => ({
      type: s.strStat,
      value: String(s.intAway ?? '0'),
    }));
    return [
      { team: { id: 'home', name: 'Home' }, statistics: homeStats },
      { team: { id: 'away', name: 'Away' }, statistics: awayStats },
    ];
  }

  const homeStats = stats
    .filter((s) => s.strHome === 'Yes')
    .map((s) => ({ type: s.strStat, value: String(s.intStat ?? s.value ?? '0') }));
  const awayStats = stats
    .filter((s) => s.strHome === 'No')
    .map((s) => ({ type: s.strStat, value: String(s.intStat ?? s.value ?? '0') }));

  return [
    { team: { id: 'home', name: 'Home' }, statistics: homeStats },
    { team: { id: 'away', name: 'Away' }, statistics: awayStats },
  ];
};

const mapLineupPlayer = (p: any) => ({
  player: {
    id: p.idPlayer,
    name: p.strPlayer,
    number: p.intSquadNumber || p.intNumber || p.strNumber,
    position: p.strPosition,
    photo: p.strCutout || p.strThumb || null,
  },
});

export const normalizeLineup = (lineup: any[]) => {
  if (!Array.isArray(lineup)) return [];

  const homeXI = lineup.filter((p) => p.strHome === 'Yes' && p.strSubstitute === 'No');
  const awayXI = lineup.filter((p) => p.strHome === 'No' && p.strSubstitute === 'No');
  const homeSubs = lineup.filter((p) => p.strHome === 'Yes' && p.strSubstitute === 'Yes');
  const awaySubs = lineup.filter((p) => p.strHome === 'No' && p.strSubstitute === 'Yes');

  return [
    {
      team: { name: homeXI[0]?.strTeam || 'Home' },
      formation: homeXI[0]?.strFormation || '4-4-2',
      startXI: homeXI.map(mapLineupPlayer),
      substitutes: homeSubs.map(mapLineupPlayer),
    },
    {
      team: { name: awayXI[0]?.strTeam || 'Away' },
      formation: awayXI[0]?.strFormation || '4-4-2',
      startXI: awayXI.map(mapLineupPlayer),
      substitutes: awaySubs.map(mapLineupPlayer),
    },
  ];
};

export const normalizeHighlights = (raw: any) => {
  if (!raw) return {};
  const item = Array.isArray(raw) ? raw[0] : raw;
  return {
    strThumb: item.strThumb,
    strVideo: item.strVideo,
    strPoster: item.strPoster,
    strFanart: item.strFanart,
    strBanner: item.strBanner,
    strSquare: item.strSquare,
  };
};

export const normalizeTeam = (team: any) => {
  if (!team) return null;
  return {
    id: parseInt(team.idTeam, 10),
    name: team.strTeam,
    logo: team.strBadge || team.strTeamBadge,
    banner: team.strBanner,
    equipment: team.strEquipment,
    country: team.strCountry,
    founded: team.intFormedYear,
    description: team.strDescriptionEN,
    leagueId: team.idLeague ? parseInt(team.idLeague, 10) : null,
    leagueName: team.strLeague || null,
    venue: {
      name: team.strStadium,
      city: team.strStadiumLocation,
      capacity: parseInt(team.intStadiumCapacity || '0', 10),
      image: team.strStadiumThumb,
    },
    social: {
      website: team.strWebsite,
      facebook: team.strFacebook,
      twitter: team.strTwitter,
      instagram: team.strInstagram,
    },
  };
};

export const normalizeStandings = (table: any[]) => {
  if (!Array.isArray(table)) return [];
  return table.map((row) => ({
    rank: parseInt(row.intRank || row.rank, 10),
    team: {
      id: parseInt(row.idTeam || row.team_id, 10),
      name: row.strTeam || row.team_name,
      logo: row.strBadge || row.strTeamBadge || row.team_logo,
    },
    points: parseInt(row.intPoints || row.points || '0', 10),
    goalsDiff: parseInt(row.intGoalDifference || row.goals_diff || '0', 10),
    all: {
      played: parseInt(row.intPlayed || row.played || '0', 10),
      win: parseInt(row.intWin || row.win || '0', 10),
      draw: parseInt(row.intDraw || row.draw || '0', 10),
      loss: parseInt(row.intLoss || row.loss || '0', 10),
      goals: {
        for: parseInt(row.intGoalsFor || row.gf || '0', 10),
        against: parseInt(row.intGoalsAgainst || row.ga || '0', 10),
      },
    },
    group: row.strGroup || row.group || null,
  }));
};

export const normalizeSquad = (squad: any[]) => {
  if (!Array.isArray(squad)) return [];
  return squad.map((p) => ({
    id: p.idPlayer,
    name: p.strPlayer,
    photo: p.strCutout || p.strThumb,
    position: p.strPosition,
    number: p.strNumber,
  }));
};

export const mapStandings = normalizeStandings;
export const mapSquad = normalizeSquad;
export const mapMatch = normalizeMatch;
