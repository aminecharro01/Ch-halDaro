import { standingsRowsFromV2Schedule } from '@/lib/v2-standings-from-schedule';

export const fetchTheSportsDb = async (endpoint: string, params: Record<string, string> = {}, revalidate: number = 60) => {
  const API_KEY = process.env.THESPORTSDB_KEY || "3";
  console.log(`[TheSportsDB] Using Key: ${API_KEY.substring(0, 3)}...`);
  const BASE_URL = `https://www.thesportsdb.com/api/v2/json`;

  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key]) url.searchParams.append(key, params[key]);
  });

  console.log(`[TheSportsDB V2] Fetching: ${url.toString()}`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-KEY': API_KEY,
        'Accept': 'application/json'
      },
      next: { revalidate }
    });

    if (!response.ok) {
      throw new Error(`TheSportsDB API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // V2 Normalization: Extract the array from root keys if they exist
    // V2 uses keys like 'lookup', 'list', 'search', 'filter', 'schedule', 'livescore', 'all'
    const v2RootKeys = ['lookup', 'list', 'search', 'filter', 'schedule', 'livescore', 'all'];
    for (const key of v2RootKeys) {
      if (data && data[key] && Array.isArray(data[key])) {
        console.log(`[TheSportsDB V2] Found root key: "${key}" (${data[key].length} items)`);
        return data[key];
      }
    }

    console.log(`[TheSportsDB V2] No standard root key found in response. Keys: ${Object.keys(data).join(', ')}`);
    return data;
  } catch (error: any) {
    console.error("TheSportsDB fetch failed", error);
    throw error;
  }
};

/**
 * V2 API Endpoints based on aa.txt
 */

// All Leagues
export const getLeagues = () => fetchTheSportsDb('all/leagues', {}, 3600);

/** Leagues merged for home `/api/scores` day view (V2 `schedule/league/{id}/{season}` per league). */
export const SCORES_TRACKED_LEAGUE_IDS: number[] = [4480, 4328, 4335, 4332, 4331, 4520];

const SCORES_LEAGUE_FALLBACK_NAME: Record<number, string> = {
  4480: 'UEFA Champions League',
  4328: 'English Premier League',
  4335: 'Spanish La Liga',
  4332: 'Italian Serie A',
  4331: 'German Bundesliga',
  4520: 'Botola Pro',
};

function soccerSeasonFromDate(dateStr: string): string {
  const fixed = process.env.THESPORTSDB_SEASON?.trim();
  if (fixed) return fixed;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '2025-2026';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(y) || Number.isNaN(m)) return '2025-2026';
  if (m >= 7) return `${y}-${y + 1}`;
  return `${y - 1}-${y}`;
}

/** Standings from full season schedule (V2 has no dedicated table endpoint). */
export const getLeagueStandings = async (leagueId: string, season: string) => {
  const list = await fetchTheSportsDb(`schedule/league/${leagueId}/${encodeURIComponent(season)}`, {}, 300);
  if (!Array.isArray(list)) return [];
  return standingsRowsFromV2Schedule(list);
};

// League Events
export const getLeagueEventsPast = (leagueId: string) => 
  fetchTheSportsDb(`schedule/previous/league/${leagueId}`, {}, 60);

export const getLeagueEventsNext = (leagueId: string) => 
  fetchTheSportsDb(`schedule/next/league/${leagueId}`, {}, 300);

// Team Events
export const getTeamEventsPast = (teamId: string) => 
  fetchTheSportsDb(`schedule/previous/team/${teamId}`, {}, 300);

export const getTeamEventsNext = (teamId: string) => 
  fetchTheSportsDb(`schedule/next/team/${teamId}`, {}, 300);

// Event Details
export const getMatchDetail = (eventId: string) => 
  fetchTheSportsDb(`lookup/event/${eventId}`, {}, 60);

export const getMatchTimeline = async (eventId: string) => {
  try {
    const data = await fetchTheSportsDb(`lookup/event_timeline/${eventId}`, {}, 60);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getMatchStatistics = (eventId: string) => 
  fetchTheSportsDb(`lookup/event_stats/${eventId}`, {}, 60);

export const getMatchLineup = (eventId: string) => 
  fetchTheSportsDb(`lookup/event_lineup/${eventId}`, {}, 60);

export const getMatchTV = (eventId: string) =>
  fetchTheSportsDb(`lookup/event_tv/${eventId}`, {}, 3600);

/** OpenAPI `scratch/aa.txt`: `/lookup/event_highlights/{idEvent}` → EventLookup (poster, thumb, video, …). */
export const getMatchMedia = (eventId: string) =>
  fetchTheSportsDb(`lookup/event_highlights/${eventId}`, {}, 3600);

// Team & Player Details
export const getTeamDetails = (teamId: string) => 
  fetchTheSportsDb(`lookup/team/${teamId}`, {}, 3600);

export const getTeamSquad = (teamId: string) => 
  fetchTheSportsDb(`list/players/${teamId}`, {}, 3600);

/** Soccer fixtures on `date` (YYYY-MM-DD) for tracked leagues via V2 season schedules. */
export const getEventsByDay = async (date: string) => {
  const season = soccerSeasonFromDate(date);
  const lists = await Promise.all(
    SCORES_TRACKED_LEAGUE_IDS.map((id) =>
      fetchTheSportsDb(`schedule/league/${id}/${encodeURIComponent(season)}`, {}, 60).catch(() => [])
    )
  );
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < lists.length; i++) {
    const id = SCORES_TRACKED_LEAGUE_IDS[i];
    const arr = lists[i];
    if (!Array.isArray(arr)) continue;
    for (const ev of arr) {
      const row = ev as Record<string, unknown>;
      if (row.dateEvent !== date) continue;
      if (String(row.strSport || '') !== 'Soccer') continue;
      out.push({
        ...row,
        idLeague: row.idLeague ?? String(id),
        strLeague: row.strLeague || SCORES_LEAGUE_FALLBACK_NAME[id] || '',
      });
    }
  }
  return out;
};

// League Details
export const getLeagueDetails = (leagueId: string) => 
  fetchTheSportsDb(`lookup/league/${leagueId}`, {}, 3600);

// League Teams — OpenAPI: `/list/teams/{idLeague}` (not `.../league/...`)
export const getLeagueTeams = (leagueId: string) =>
  fetchTheSportsDb(`list/teams/${leagueId}`, {}, 3600);
