export const fetchTheSportsDb = async (endpoint: string, params: Record<string, string> = {}, revalidate: number = 60) => {
  const API_KEY = process.env.THESPORTSDB_KEY || "3";
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

// League Standings (Fallback to REST pattern if documented, else keep V1 pattern)
// Note: 'aa.txt' didn't show this, but REST pattern is standard in V2
// League Standings (Fallback to V1 because V2 is undocumented for tables)
export const getLeagueStandings = (leagueId: string, season: string) => {
  const API_KEY = process.env.THESPORTSDB_KEY || "3";
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookuptable.php?l=${leagueId}&s=${season}`;
  return fetch(url, { next: { revalidate: 300 } }).then(res => res.json()).then(data => data.table || []);
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

export const getMatchTimeline = (eventId: string) => 
  fetchTheSportsDb(`lookup/event_timeline/${eventId}`, {}, 60);

export const getMatchStatistics = (eventId: string) => 
  fetchTheSportsDb(`lookup/event_stats/${eventId}`, {}, 60);

export const getMatchLineup = (eventId: string) => 
  fetchTheSportsDb(`lookup/event_lineup/${eventId}`, {}, 60);

// Team & Player Details
export const getTeamDetails = (teamId: string) => 
  fetchTheSportsDb(`lookup/team/${teamId}`, {}, 3600);

export const getTeamSquad = (teamId: string) => 
  fetchTheSportsDb(`list/players/${teamId}`, {}, 3600);

// Filter by Day (Using V1 endpoint because it is richer than V2 filter/tv/day)
export const getEventsByDay = (date: string) => {
  const API_KEY = process.env.THESPORTSDB_KEY || "3";
  // We use eventsday.php because it returns full team names and badges which V2 filter/tv/day lacks
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php?d=${date}&s=Soccer`;
  console.log(`[TheSportsDB] Fetching Daily Events: ${url}`);
  return fetch(url, { next: { revalidate: 60 } })
    .then(res => res.json())
    .then(data => data.events || []);
};

// League Details
export const getLeagueDetails = (leagueId: string) => 
  fetchTheSportsDb(`lookup/league/${leagueId}`, {}, 3600);
