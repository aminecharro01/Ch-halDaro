
import { getMockFixtures } from './fixtures';
import { getMockWorldCupStandings, getMockWorldCupMatches } from './worldcup2026';
import { getMockMatchDetail, getMockH2H } from './matchDetail';
import { getMockLeagueStandings, getMockTopScorers } from './leagues';
import { getMockTeamProfile, getMockTeamStats, getMockSquad } from './teams';
import { getMockPredictions } from './predictions';
import { getMockAnalysis } from './analysis';
import { getMockNotifications } from './notifications';

export const getMockData = (endpoint: string, params: any) => {
  if (endpoint.includes('/fixtures/events') || endpoint.includes('/fixtures/lineups') || endpoint.includes('/fixtures/statistics') || endpoint.includes('/fixtures/injuries')) {
    const detail = getMockMatchDetail(params.fixture || params.id);
    if (endpoint.includes('/events')) return detail.events;
    if (endpoint.includes('/lineups')) return detail.lineups;
    if (endpoint.includes('/statistics')) return detail.statistics;
    if (endpoint.includes('/injuries')) return detail.injuries;
  }

  if (endpoint.includes('/fixtures/headtohead')) return getMockH2H();

  if (endpoint.includes('/fixtures')) {
    if (params.league == 1) return getMockWorldCupMatches();
    return getMockFixtures(params.date || new Date().toISOString().split('T')[0]);
  }

  if (endpoint.includes('/standings')) {
    if (params.league == 1) return [{ league: { standings: getMockWorldCupStandings() } }];
    return [{ league: { standings: [getMockLeagueStandings(params.league)] } }];
  }

  if (endpoint.includes('/players/topscorers')) return getMockTopScorers();
  if (endpoint.includes('/players/topassists')) return getMockTopScorers(); // Mock as same for now

  if (endpoint.includes('/teams/statistics')) return getMockTeamStats();
  if (endpoint.includes('/players')) return getMockSquad();
  if (endpoint.includes('/teams')) return [{ team: getMockTeamProfile(params.id).team, venue: getMockTeamProfile(params.id).venue }];

  if (endpoint.includes('/predictions')) return getMockPredictions(params.fixture);

  return [];
};

export { getMockAnalysis, getMockNotifications };
