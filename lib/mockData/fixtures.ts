
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const startedAt = new Date();
startedAt.setHours(startedAt.getHours() - 1); // Started an hour ago

export const getMockFixtures = (date: string) => {
  if (date === yesterday) {
    return [
      {
        fixture: { id: 999101, status: { short: "FT" }, date: `${yesterday}T19:00:00Z` },
        league: { id: 39, name: "Premier League" },
        teams: { 
          home: { id: 33, name: "Man United", logo: "https://media.api-sports.io/football/teams/33.png" },
          away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" }
        },
        goals: { home: 1, away: 2 }
      },
      {
        fixture: { id: 999102, status: { short: "FT" }, date: `${yesterday}T20:00:00Z` },
        league: { id: 140, name: "La Liga" },
        teams: { 
          home: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
          away: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }
        },
        goals: { home: 2, away: 3 }
      },
      {
        fixture: { id: 999103, status: { short: "FT" }, date: `${yesterday}T18:00:00Z` },
        league: { id: 135, name: "Serie A" },
        teams: { 
          home: { id: 489, name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" },
          away: { id: 492, name: "Inter", logo: "https://media.api-sports.io/football/teams/492.png" }
        },
        goals: { home: 0, away: 0 }
      },
      {
        fixture: { id: 999104, status: { short: "FT" }, date: `${yesterday}T21:00:00Z` },
        league: { id: 78, name: "Bundesliga" },
        teams: { 
          home: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
          away: { id: 165, name: "Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" }
        },
        goals: { home: 4, away: 1 }
      },
      {
        fixture: { id: 999105, status: { short: "FT" }, date: `${yesterday}T19:30:00Z` },
        league: { id: 61, name: "Ligue 1" },
        teams: { 
          home: { id: 85, name: "PSG", logo: "https://media.api-sports.io/football/teams/85.png" },
          away: { id: 79, name: "Lille", logo: "https://media.api-sports.io/football/teams/79.png" }
        },
        goals: { home: 2, away: 0 }
      }
    ];
  }

  if (date === tomorrow) {
    return [
      {
        fixture: { id: 999301, status: { short: "NS" }, date: `${tomorrow}T14:00:00Z` },
        league: { id: 39, name: "Premier League" },
        teams: { 
          home: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
          away: { id: 50, name: "Man City", logo: "https://media.api-sports.io/football/teams/50.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 999302, status: { short: "NS" }, date: `${tomorrow}T16:00:00Z` },
        league: { id: 140, name: "La Liga" },
        teams: { 
          home: { id: 530, name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png" },
          away: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 999303, status: { short: "NS" }, date: `${tomorrow}T18:00:00Z` },
        league: { id: 2, name: "Champions League" },
        teams: { 
          home: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
          away: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 999304, status: { short: "NS" }, date: `${tomorrow}T20:45:00Z` },
        league: { id: 135, name: "Serie A" },
        teams: { 
          home: { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
          away: { id: 497, name: "Roma", logo: "https://media.api-sports.io/football/teams/497.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 999305, status: { short: "NS" }, date: `${tomorrow}T19:00:00Z` },
        league: { id: 39, name: "Premier League" },
        teams: { 
          home: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
          away: { id: 47, name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png" }
        },
        goals: { home: null, away: null }
      },
      {
        fixture: { id: 999306, status: { short: "NS" }, date: `${tomorrow}T21:00:00Z` },
        league: { id: 1, name: "World Cup 2026" },
        teams: { 
          home: { id: 2382, name: "USA", logo: "https://media.api-sports.io/flags/us.svg" },
          away: { id: 2384, name: "Mexico", logo: "https://media.api-sports.io/flags/mx.svg" }
        },
        goals: { home: null, away: null }
      }
    ];
  }

  // Today
  const elapsed = Math.min(90, Math.floor((Date.now() - startedAt.getTime()) / 60000) + 67);
  const statusShort = elapsed >= 90 ? "FT" : "2H";

  return [
    {
      fixture: { id: 999001, status: { short: statusShort, elapsed }, date: `${today}T15:00:00Z` },
      league: { id: 140, name: "La Liga" },
      teams: { 
        home: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
        away: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" }
      },
      goals: { home: 2, away: 1 }
    },
    {
      fixture: { id: 999002, status: { short: "2H", elapsed: 82 }, date: `${today}T15:05:00Z` },
      league: { id: 39, name: "Premier League" },
      teams: { 
        home: { id: 50, name: "Man City", logo: "https://media.api-sports.io/football/teams/50.png" },
        away: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" }
      },
      goals: { home: 1, away: 1 }
    },
    {
      fixture: { id: 999003, status: { short: "1H", elapsed: 24 }, date: `${today}T16:00:00Z` },
      league: { id: 135, name: "Serie A" },
      teams: { 
        home: { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
        away: { id: 492, name: "Inter", logo: "https://media.api-sports.io/football/teams/492.png" }
      },
      goals: { home: 0, away: 2 }
    },
    {
      fixture: { id: 999004, status: { short: "2H", elapsed: 58 }, date: `${today}T15:30:00Z` },
      league: { id: 78, name: "Bundesliga" },
      teams: { 
        home: { id: 165, name: "Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
        away: { id: 161, name: "Wolfsburg", logo: "https://media.api-sports.io/football/teams/161.png" }
      },
      goals: { home: 1, away: 0 }
    },
    {
      fixture: { id: 999005, status: { short: "1H", elapsed: 45 }, date: `${today}T16:15:00Z` },
      league: { id: 61, name: "Ligue 1" },
      teams: { 
        home: { id: 85, name: "PSG", logo: "https://media.api-sports.io/football/teams/85.png" },
        away: { id: 80, name: "Lyon", logo: "https://media.api-sports.io/football/teams/80.png" }
      },
      goals: { home: 3, away: 0 }
    },
    {
      fixture: { id: 999006, status: { short: "2H", elapsed: 78 }, date: `${today}T15:45:00Z` },
      league: { id: 1, name: "World Cup 2026" },
      teams: { 
        home: { id: 10, name: "England", logo: "https://media.api-sports.io/flags/gb.svg" },
        away: { id: 9, name: "Spain", logo: "https://media.api-sports.io/flags/es.svg" }
      },
      goals: { home: 1, away: 1 }
    },
    // Upcoming today
    {
      fixture: { id: 999010, status: { short: "NS" }, date: `${today}T20:00:00Z` },
      league: { id: 2, name: "Champions League" },
      teams: { 
        home: { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
        away: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }
      },
      goals: { home: null, away: null }
    },
    {
      fixture: { id: 999011, status: { short: "NS" }, date: `${today}T21:00:00Z` },
      league: { id: 39, name: "Premier League" },
      teams: { 
        home: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
        away: { id: 47, name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png" }
      },
      goals: { home: null, away: null }
    },
    // Finished today
    {
      fixture: { id: 999020, status: { short: "FT" }, date: `${today}T12:00:00Z` },
      league: { id: 39, name: "Premier League" },
      teams: { 
        home: { id: 34, name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png" },
        away: { id: 51, name: "Brighton", logo: "https://media.api-sports.io/football/teams/51.png" }
      },
      goals: { home: 2, away: 2 }
    },
    {
      fixture: { id: 999021, status: { short: "FT" }, date: `${today}T13:30:00Z` },
      league: { id: 140, name: "La Liga" },
      teams: { 
        home: { id: 531, name: "Athletic Club", logo: "https://media.api-sports.io/football/teams/531.png" },
        away: { id: 532, name: "Valencia", logo: "https://media.api-sports.io/football/teams/532.png" }
      },
      goals: { home: 1, away: 0 }
    }
  ];
};
