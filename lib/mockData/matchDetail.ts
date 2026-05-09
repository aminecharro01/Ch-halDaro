
export const getMockMatchDetail = (id: string | number) => {
  const startedAt = new Date();
  startedAt.setHours(startedAt.getHours() - 1);
  const elapsed = Math.min(90, Math.floor((Date.now() - startedAt.getTime()) / 60000) + 67);
  const statusShort = elapsed >= 90 ? "FT" : "2H";

  return {
    fixture: {
      fixture: { id: Number(id), status: { short: statusShort, elapsed }, date: new Date().toISOString() },
      league: { id: 140, name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
      teams: { 
        home: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
        away: { id: 529, name: "FC Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" }
      },
      goals: { home: 2, away: 1 }
    },
    events: [
      { time: { elapsed: 23 }, team: { id: 541, name: "Real Madrid" }, player: { name: "Vinicius Jr" }, type: "Goal", detail: "Normal Goal" },
      { time: { elapsed: 41 }, team: { id: 529, name: "FC Barcelona" }, player: { name: "Pedri" }, type: "Card", detail: "Yellow Card" },
      { time: { elapsed: 45, extra: 2 }, team: { id: 529, name: "FC Barcelona" }, player: { name: "Lewandowski" }, type: "Goal", detail: "Penalty" },
      { time: { elapsed: 58 }, team: { id: 541, name: "Real Madrid" }, player: { name: "Bellingham" }, type: "Goal", detail: "Normal Goal" },
      { time: { elapsed: 62 }, team: { id: 529, name: "FC Barcelona" }, player: { name: "Araujo" }, type: "Card", detail: "Red Card" },
      { time: { elapsed: 67 }, team: { id: 541, name: "Real Madrid" }, player: { name: "Valverde" }, type: "Card", detail: "Yellow Card" }
    ],
    lineups: [
      {
        team: { id: 541, name: "Real Madrid" },
        formation: "4-3-3",
        startXI: [
          { player: { id: 1, name: "Courtois", number: 1, pos: "G" } },
          { player: { id: 2, name: "Carvajal", number: 2, pos: "D" } },
          { player: { id: 3, name: "Militao", number: 3, pos: "D" } },
          { player: { id: 4, name: "Rüdiger", number: 22, pos: "D" } },
          { player: { id: 5, name: "Mendy", number: 23, pos: "D" } },
          { player: { id: 6, name: "Tchouameni", number: 18, pos: "M" } },
          { player: { id: 7, name: "Valverde", number: 15, pos: "M" } },
          { player: { id: 8, name: "Bellingham", number: 5, pos: "M" } },
          { player: { id: 9, name: "Rodrygo", number: 11, pos: "F" } },
          { player: { id: 10, name: "Mbappé", number: 9, pos: "F" } },
          { player: { id: 11, name: "Vinicius Jr", number: 7, pos: "F" } }
        ]
      },
      {
        team: { id: 529, name: "FC Barcelona" },
        formation: "4-2-3-1",
        startXI: [
          { player: { id: 21, name: "Ter Stegen", number: 1, pos: "G" } },
          { player: { id: 22, name: "Koundé", number: 23, pos: "D" } },
          { player: { id: 23, name: "Araujo", number: 4, pos: "D" } },
          { player: { id: 24, name: "Cubarsí", number: 33, pos: "D" } },
          { player: { id: 25, name: "Balde", number: 3, pos: "D" } },
          { player: { id: 26, name: "De Jong", number: 21, pos: "M" } },
          { player: { id: 27, name: "Pedri", number: 8, pos: "M" } },
          { player: { id: 28, name: "Yamal", number: 19, pos: "F" } },
          { player: { id: 29, name: "Dani Olmo", number: 20, pos: "M" } },
          { player: { id: 30, name: "Raphinha", number: 11, pos: "F" } },
          { player: { id: 31, name: "Lewandowski", number: 9, pos: "F" } }
        ]
      }
    ],
    statistics: [
      {
        team: { id: 541, name: "Real Madrid" },
        statistics: [
          { type: "Shots on Goal", value: 6 }, { type: "Ball Possession", value: "48%" },
          { type: "Total Shots", value: 14 }, { type: "Fouls", value: 12 },
          { type: "Corner Kicks", value: 5 }, { type: "Offsides", value: 2 }
        ]
      },
      {
        team: { id: 529, name: "FC Barcelona" },
        statistics: [
          { type: "Shots on Goal", value: 4 }, { type: "Ball Possession", value: "52%" },
          { type: "Total Shots", value: 11 }, { type: "Fouls", value: 15 },
          { type: "Corner Kicks", value: 4 }, { type: "Offsides", value: 3 }
        ]
      }
    ],
    injuries: [],
    h2h: []
  };
};

export const getMockH2H = () => {
  return [
    {
      fixture: { id: 999501, date: "2024-04-21T19:00:00Z", status: { short: "FT" } },
      teams: { home: { name: "Real Madrid" }, away: { name: "Barcelona" } },
      goals: { home: 3, away: 2 }
    },
    {
      fixture: { id: 999502, date: "2024-01-14T19:00:00Z", status: { short: "FT" } },
      teams: { home: { name: "Real Madrid" }, away: { name: "Barcelona" } },
      goals: { home: 4, away: 1 }
    }
  ];
};
