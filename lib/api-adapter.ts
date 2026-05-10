export const mapMatch = (tsdbMatch: any) => {
  if (!tsdbMatch) return null;
  return {
    fixture: {
      id: parseInt(tsdbMatch.idEvent || tsdbMatch.id),
      date: (tsdbMatch.dateEvent || tsdbMatch.date) + 'T' + (tsdbMatch.strTime || tsdbMatch.time || '00:00:00'),
      status: {
        short: mapStatus(tsdbMatch.strStatus || tsdbMatch.status),
        elapsed: tsdbMatch.strProgress || tsdbMatch.progress || 0
      }
    },
    league: {
      id: parseInt(tsdbMatch.idLeague || tsdbMatch.league_id),
      name: tsdbMatch.strLeague || tsdbMatch.league_name,
      logo: tsdbMatch.strLeagueBadge || tsdbMatch.league_badge || ""
    },
    teams: {
      home: {
        id: parseInt(tsdbMatch.idHomeTeam || tsdbMatch.home_id),
        name: tsdbMatch.strHomeTeam || tsdbMatch.home_name,
        logo: tsdbMatch.strHomeTeamBadge || tsdbMatch.home_badge
      },
      away: {
        id: parseInt(tsdbMatch.idAwayTeam || tsdbMatch.away_id),
        name: tsdbMatch.strAwayTeam || tsdbMatch.away_name,
        logo: tsdbMatch.strAwayTeamBadge || tsdbMatch.away_badge
      }
    },
    goals: {
      home: parseInt(tsdbMatch.intHomeScore || tsdbMatch.home_score) || 0,
      away: parseInt(tsdbMatch.intAwayScore || tsdbMatch.away_score) || 0
    }
  };
};

// ... mapStatus remains same ...
const mapStatus = (status: string) => {
  if (!status) return 'NS';
  const s = status.toUpperCase();
  if (s === 'NS' || s === 'NOT STARTED' || s === 'SCHEDULED' || s === 'POSTPONED') return 'NS';
  if (s === 'FT' || s === 'FINISHED' || s === 'MATCH FINISHED' || s === 'FULL TIME') return 'FT';
  if (s === '1H' || s === '1ST HALF' || s === 'FIRST HALF') return '1H';
  if (s === '2H' || s === '2ND HALF' || s === 'SECOND HALF') return '2H';
  if (s === 'HT' || s === 'HALFTIME') return 'HT';
  if (s === 'ET' || s === 'EXTRA TIME') return 'ET';
  if (s === 'PEN' || s === 'PENALTY' || s === 'PENALTIES') return 'P';
  if (s === 'LIVE' || s === 'IN PLAY') return '1H'; // Default to 1H if just "LIVE"
  return s.substring(0, 3); // Fallback
};

export const mapStandings = (tsdbTable: any[]) => {
  if (!tsdbTable) return [];
  return tsdbTable.map(row => ({
    rank: parseInt(row.intRank || row.rank),
    team: {
      id: parseInt(row.idTeam || row.team_id),
      name: row.strTeam || row.team_name,
      logo: row.strBadge || row.strTeamBadge || row.team_badge
    },
    points: parseInt(row.intPoints || row.points),
    goalsDiff: parseInt(row.intGoalDifference || row.goal_difference),
    group: row.strGroup || row.group_name || null,
    all: {
      played: parseInt(row.intPlayed || row.played),
      win: parseInt(row.intWin || row.win),
      draw: parseInt(row.intDraw || row.draw),
      loss: parseInt(row.intLoss || row.loss)
    }
  }));
};

export const mapTimeline = (tsdbTimeline: any[]) => {
  if (!tsdbTimeline) return [];
  return tsdbTimeline.map(item => ({
    time: { elapsed: parseInt(item.intTime || item.time) },
    team: { id: parseInt(item.idTeam || item.team_id), name: item.strTeam || item.team_name },
    player: { name: item.strPlayer || item.player_name },
    type: mapEventType(item.strTimeline || item.type),
    detail: item.strTimelineDetail || item.detail
  }));
};

const mapEventType = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("goal")) return "Goal";
  if (t.includes("yellow")) return "Card"; // API-Football uses "Card"
  if (t.includes("red")) return "Card";
  if (t.includes("penalty")) return "Goal"; // If scored
  if (t.includes("var")) return "VAR";
  return type;
};

export const mapSquad = (tsdbData: any) => {
  const players = Array.isArray(tsdbData) ? tsdbData : (tsdbData?.player || tsdbData?.players || []);
  return players.map((p: any) => ({
    id: parseInt(p.idPlayer),
    name: p.strPlayer,
    age: p.dateBorn ? new Date().getFullYear() - new Date(p.dateBorn).getFullYear() : null,
    number: p.strNumber,
    position: p.strPosition,
    photo: p.strCutout || p.strThumb
  }));
};

export const mapLeague = (tsdbLeague: any) => {
  if (!tsdbLeague) return null;
  return {
    id: parseInt(tsdbLeague.idLeague),
    name: tsdbLeague.strLeague,
    logo: tsdbLeague.strBadge || tsdbLeague.strLogo,
    banner: tsdbLeague.strBanner,
    country: tsdbLeague.strCountry,
    season: tsdbLeague.strCurrentSeason
  };
};

export const mapTeam = (tsdbTeam: any) => {
  return {
    team: {
      id: parseInt(tsdbTeam.idTeam),
      name: tsdbTeam.strTeam,
      logo: tsdbTeam.strBadge || tsdbTeam.strTeamBadge,
      country: tsdbTeam.strCountry,
      founded: tsdbTeam.intFormedYear
    },
    venue: {
      name: tsdbTeam.strStadium,
      city: tsdbTeam.strStadiumLocation,
      capacity: parseInt(tsdbTeam.intStadiumCapacity),
      image: tsdbTeam.strStadiumThumb
    }
  };
};
