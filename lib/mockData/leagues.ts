
export const getMockLeagueStandings = (leagueId: string | number) => {
  if (leagueId == 2) { // UCL
    const groups = ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Group G", "Group H"];
    const teams = [
      ["Man City", "Inter", "Benfica", "Leipzig"],
      ["Real Madrid", "Napoli", "Braga", "Union Berlin"],
      ["Bayern Munich", "Man United", "Copenhagen", "Galatasaray"],
      ["Arsenal", "PSV", "Lens", "Sevilla"],
      ["PSG", "Dortmund", "AC Milan", "Newcastle"],
      ["Barcelona", "Porto", "Shakhtar", "Antwerp"],
      ["Atletico Madrid", "Lazio", "Feyenoord", "Celtic"],
      ["Liverpool", "Leverkusen", "Roma", "Villarreal"]
    ];

    return groups.map((g, i) => {
      return teams[i].map((team, idx) => ({
        rank: idx + 1,
        team: { id: 1000 + i * 4 + idx, name: team, logo: `https://media.api-sports.io/football/teams/${50 + i * 10 + idx}.png` },
        group: g,
        all: { played: 6, win: 6 - idx, draw: 0, lose: idx },
        goalsDiff: 12 - idx * 4,
        points: (6 - idx) * 3
      }));
    });
  }

  // Default to Premier League (39)
  const plTeams = [
    "Liverpool", "Man City", "Arsenal", "Aston Villa", "Tottenham", 
    "Man United", "Newcastle", "Chelsea", "West Ham", "Brighton",
    "Wolves", "Fulham", "Bournemouth", "Crystal Palace", "Brentford",
    "Everton", "Nottingham Forest", "Luton", "Burnley", "Sheffield Utd"
  ];

  return plTeams.map((team, idx) => ({
    rank: idx + 1,
    team: { id: 33 + idx, name: team, logo: `https://media.api-sports.io/football/teams/${33 + idx}.png` },
    all: { played: 34, win: 34 - idx, draw: 0, lose: idx },
    goalsDiff: 50 - idx * 4,
    points: (34 - idx) * 3,
    form: "WWWDW"
  }));
};

export const getMockTopScorers = () => {
  return [
    {
      player: { id: 1100, name: "Erling Haaland", photo: "https://media.api-sports.io/football/players/1100.png" },
      statistics: [{ team: { name: "Man City" }, goals: { total: 25, assists: 5 } }]
    },
    {
      player: { id: 1101, name: "Mohamed Salah", photo: "https://media.api-sports.io/football/players/1101.png" },
      statistics: [{ team: { name: "Liverpool" }, goals: { total: 21, assists: 9 } }]
    },
    {
      player: { id: 1102, name: "Ollie Watkins", photo: "https://media.api-sports.io/football/players/1102.png" },
      statistics: [{ team: { name: "Aston Villa" }, goals: { total: 19, assists: 12 } }]
    }
  ];
};
