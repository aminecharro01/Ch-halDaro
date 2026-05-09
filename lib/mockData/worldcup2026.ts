
export const WORLD_CUP_TEAMS = [
  { id: 2382, name: "USA", code: "us" }, { id: 2383, name: "Canada", code: "ca" }, { id: 2384, name: "Mexico", code: "mx" },
  { id: 6, name: "Brazil", code: "br" }, { id: 26, name: "Argentina", code: "ar" }, { id: 2, name: "France", code: "fr" },
  { id: 10, name: "England", code: "gb" }, { id: 25, name: "Germany", code: "de" }, { id: 9, name: "Spain", code: "es" },
  { id: 27, name: "Portugal", code: "pt" }, { id: 15, name: "Netherlands", code: "nl" }, { id: 1, name: "Belgium", code: "be" },
  { id: 3, name: "Croatia", code: "hr" }, { id: 31, name: "Morocco", code: "ma" }, { id: 13, name: "Senegal", code: "sn" },
  { id: 16, name: "Japan", code: "jp" }, { id: 17, name: "South Korea", code: "kr" }, { id: 20, name: "Australia", code: "au" },
  { id: 2385, name: "Ecuador", code: "ec" }, { id: 7, name: "Uruguay", code: "uy" }, { id: 8, name: "Colombia", code: "co" },
  { id: 21, name: "Chile", code: "cl" }, { id: 22, name: "Peru", code: "pe" }, { id: 23, name: "Venezuela", code: "ve" },
  { id: 2386, name: "Bolivia", code: "bo" }, { id: 156, name: "Qatar", code: "qa" }, { id: 18, name: "Saudi Arabia", code: "sa" },
  { id: 155, name: "Iran", code: "ir" }, { id: 2387, name: "Iraq", code: "iq" }, { id: 2388, name: "Syria", code: "sy" },
  { id: 2389, name: "Tunisia", code: "tn" }, { id: 32, name: "Algeria", code: "dz" }, { id: 2390, name: "Egypt", code: "eg" },
  { id: 2391, name: "Cameroon", code: "cm" }, { id: 2392, name: "Ghana", code: "gh" }, { id: 2393, name: "Nigeria", code: "ng" },
  { id: 2394, name: "Ivory Coast", code: "ci" }, { id: 2395, name: "South Africa", code: "za" }, { id: 2396, name: "New Zealand", code: "nz" },
  { id: 2397, name: "Indonesia", code: "id" }, { id: 2398, name: "Thailand", code: "th" }, { id: 2399, name: "India", code: "in" },
  { id: 2400, name: "China", code: "cn" }, { id: 2401, name: "Honduras", code: "hn" }, { id: 2402, name: "Panama", code: "pa" },
  { id: 2403, name: "Costa Rica", code: "cr" }, { id: 2404, name: "Jamaica", code: "jm" }, { id: 2405, name: "Poland", code: "pl" },
  { id: 2406, name: "Italy", code: "it" }, { id: 2407, name: "Switzerland", code: "ch" }, { id: 2408, name: "Denmark", code: "dk" },
  { id: 2409, name: "Ukraine", code: "ua" }
];

const GROUPS = [
  { name: "Group A", teams: ["USA", "Panama", "Bolivia", "Morocco"] },
  { name: "Group B", teams: ["Canada", "Honduras", "Ecuador", "Germany"] },
  { name: "Group C", teams: ["Mexico", "Jamaica", "Venezuela", "France"] },
  { name: "Group D", teams: ["Argentina", "Chile", "Peru", "Poland"] },
  { name: "Group E", teams: ["Brazil", "Colombia", "South Korea", "Portugal"] },
  { name: "Group F", teams: ["England", "Costa Rica", "Cameroon", "Netherlands"] },
  { name: "Group G", teams: ["Spain", "Algeria", "Croatia", "Japan"] },
  { name: "Group H", teams: ["Uruguay", "Saudi Arabia", "Nigeria", "Belgium"] },
  { name: "Group I", teams: ["Ghana", "Iran", "Australia", "Italy"] },
  { name: "Group J", teams: ["Egypt", "Ivory Coast", "New Zealand", "Switzerland"] },
  { name: "Group K", Qatar: "Qatar", teams: ["Qatar", "Senegal", "Indonesia", "Denmark"] },
  { name: "Group L", teams: ["Tunisia", "Iraq", "Thailand", "Ukraine"] }
];

export const getMockWorldCupStandings = () => {
  return GROUPS.map(group => {
    return group.teams.map((teamName, idx) => {
      const team = WORLD_CUP_TEAMS.find(t => t.name === teamName);
      return {
        rank: idx + 1,
        team: {
          id: team?.id,
          name: teamName,
          logo: `https://media.api-sports.io/flags/${team?.code}.svg`
        },
        group: group.name,
        all: { played: 3, win: 3 - idx, draw: 0, lose: idx, goals: { for: 8 - idx * 2, against: idx * 2 } },
        goalsDiff: 8 - idx * 4,
        points: (3 - idx) * 3
      };
    });
  });
};

export const getMockWorldCupMatches = () => {
  return [
    {
      fixture: { id: 999801, status: { short: "FT" }, date: "2026-07-08T18:00:00Z" },
      league: { id: 1, name: "World Cup 2026", round: "Quarter-finals" },
      teams: { 
        home: { id: 2, name: "France", logo: "https://media.api-sports.io/flags/fr.svg" },
        away: { id: 6, name: "Brazil", logo: "https://media.api-sports.io/flags/br.svg" }
      },
      goals: { home: 2, away: 1 }
    },
    {
      fixture: { id: 999802, status: { short: "FT" }, date: "2026-07-12T19:00:00Z" },
      league: { id: 1, name: "World Cup 2026", round: "Semi-finals" },
      teams: { 
        home: { id: 26, name: "Argentina", logo: "https://media.api-sports.io/flags/ar.svg" },
        away: { id: 25, name: "Germany", logo: "https://media.api-sports.io/flags/de.svg" }
      },
      goals: { home: 1, away: 0 }
    },
    {
      fixture: { id: 999803, status: { short: "2H", elapsed: 78 }, date: "2026-07-19T20:00:00Z" },
      league: { id: 1, name: "World Cup 2026", round: "Final" },
      teams: { 
        home: { id: 10, name: "England", logo: "https://media.api-sports.io/flags/gb.svg" },
        away: { id: 9, name: "Spain", logo: "https://media.api-sports.io/flags/es.svg" }
      },
      goals: { home: 1, away: 1 }
    }
  ];
};
