/** Build lineup-shaped data from team squad when event lineup is missing. */

type SquadPlayer = {
  strPlayer?: string;
  strNumber?: string;
  strPosition?: string;
  strCutout?: string;
  strThumb?: string;
  intSquadNumber?: string | number;
};

function mapSquadPlayer(p: SquadPlayer) {
  return {
    player: {
      name: p.strPlayer || 'Unknown',
      number: p.intSquadNumber || p.strNumber,
      position: p.strPosition,
      photo: p.strCutout || p.strThumb || null,
    },
  };
}

export function squadsToLineups(
  homeSquad: SquadPlayer[],
  awaySquad: SquadPlayer[],
  homeName: string,
  awayName: string
) {
  const home = homeSquad.filter((p) => p.strPlayer);
  const away = awaySquad.filter((p) => p.strPlayer);

  if (home.length === 0 && away.length === 0) return [];

  return [
    {
      team: { name: homeName },
      formation: '—',
      startXI: home.slice(0, 11).map(mapSquadPlayer),
      substitutes: home.slice(11).map(mapSquadPlayer),
    },
    {
      team: { name: awayName },
      formation: '—',
      startXI: away.slice(0, 11).map(mapSquadPlayer),
      substitutes: away.slice(11).map(mapSquadPlayer),
    },
  ];
}

export function lineupsHavePlayers(lineups: { startXI?: unknown[] }[] | null | undefined) {
  return (
    Array.isArray(lineups) &&
    lineups.length >= 2 &&
    lineups.some((l) => (l.startXI?.length ?? 0) > 0)
  );
}
