export const fetchFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const BASE_URL = `https://v3.football.api-sports.io`;

  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY || "",
    },
    cache: 'no-store'
  });

  if (response.status === 429) {
    console.warn("Rate limit hit! Returning mock data...");
    if (endpoint.includes("/fixtures/events")) {
      return [{ time: { elapsed: 45 }, team: { name: "Home" }, player: { name: "Star player" }, type: "Goal", detail: "Normal Goal" }];
    }
    if (endpoint.includes("/fixtures/statistics")) {
      return [
        { team: { id: 1, name: "Home" }, statistics: [{ type: "Ball Possession", value: "65%" }, { type: "Total Shots", value: 12 }] },
        { team: { id: 2, name: "Away" }, statistics: [{ type: "Ball Possession", value: "35%" }, { type: "Total Shots", value: 4 }] }
      ];
    }
    if (endpoint.includes("/predictions")) {
      return [{ predictions: { percent: { home: "60%", draw: "20%", away: "20%" }, advice: "Home win expected" }, teams: { home: { league: { form: "WWWDW" } }, away: { league: { form: "LLDLL" } } } }];
    }
    if (endpoint.includes("/standings")) {
      return [];
    }
    // Default mock for /fixtures
    return [{
      fixture: { id: 999, status: { short: "2H", elapsed: 72 }, date: new Date().toISOString() },
      league: { id: 39, name: "Premier League Mock" },
      teams: { 
        home: { id: 1, name: "Arsenal (Mock)", logo: "https://media.api-sports.io/football/teams/42.png" }, 
        away: { id: 2, name: "Chelsea (Mock)", logo: "https://media.api-sports.io/football/teams/49.png" } 
      },
      goals: { home: 2, away: 1 }
    }];
  }

  if (!response.ok) {
    throw new Error(`API Football Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
};
