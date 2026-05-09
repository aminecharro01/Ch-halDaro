
export const getMockTeamProfile = (id: string | number) => {
  return {
    team: {
      id: Number(id),
      name: "Real Madrid",
      logo: "https://media.api-sports.io/football/teams/541.png",
      country: "Spain",
      founded: 1902,
      venue: { name: "Santiago Bernabéu", capacity: 81044 }
    },
    venue: { name: "Santiago Bernabéu", address: "Avenida de Concha Espina, 1", city: "Madrid" }
  };
};

export const getMockTeamStats = () => {
  return {
    fixtures: { played: 34, wins: 26, draws: 6, loses: 2 },
    goals: { for: 74, against: 22 }
  };
};

export const getMockSquad = () => {
  return [
    { player: { id: 1, name: "Thibaut Courtois", age: 31, number: 1, pos: "Goalkeeper", photo: "https://media.api-sports.io/football/players/1.png" } },
    { player: { id: 2, name: "Dani Carvajal", age: 32, number: 2, pos: "Defender", photo: "https://media.api-sports.io/football/players/2.png" } },
    { player: { id: 3, name: "Vinicius Jr", age: 23, number: 7, pos: "Attacker", photo: "https://media.api-sports.io/football/players/3.png" } },
    { player: { id: 4, name: "Jude Bellingham", age: 20, number: 5, pos: "Midfielder", photo: "https://media.api-sports.io/football/players/4.png" } },
    { player: { id: 5, name: "Kylian Mbappé", age: 25, number: 9, pos: "Attacker", photo: "https://media.api-sports.io/football/players/5.png" } }
  ];
};
