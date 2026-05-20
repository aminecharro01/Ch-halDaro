'use client';

type LineupPlayer = {
  player: {
    name: string;
    number?: string | number;
    position?: string;
  };
};

type TeamLineup = {
  team: { name: string };
  formation: string;
  startXI: LineupPlayer[];
  substitutes?: LineupPlayer[];
};

function getPosition(player: LineupPlayer, players: LineupPlayer[], side: 'home' | 'away') {
  const pos = player.player.position?.toLowerCase() || '';
  const gks = players.filter((p) => p.player.position?.toLowerCase().includes('goalkeeper'));
  const dfs = players.filter(
    (p) =>
      p.player.position?.toLowerCase().includes('defender') ||
      p.player.position?.toLowerCase().includes('back')
  );
  const mfs = players.filter((p) => p.player.position?.toLowerCase().includes('midfielder'));
  const fws = players.filter(
    (p) =>
      p.player.position?.toLowerCase().includes('forward') ||
      p.player.position?.toLowerCase().includes('wing') ||
      p.player.position?.toLowerCase().includes('striker')
  );

  let x = 50;
  let y = 50;

  if (gks.length === 0 && dfs.length === 0) {
    const i = players.indexOf(player);
    if (i === 0) return { x: 50, y: side === 'home' ? 8 : 92 };
    if (i < 5) return { x: 15 + (i - 1) * 17, y: side === 'home' ? 22 : 78 };
    if (i < 9) return { x: 20 + (i - 5) * 15, y: 50 };
    return { x: 25 + (i - 9) * 12, y: side === 'home' ? 38 : 62 };
  }

  if (pos.includes('goalkeeper')) {
    y = side === 'home' ? 8 : 92;
  } else if (pos.includes('defender') || pos.includes('back')) {
    const i = dfs.indexOf(player);
    x = dfs.length <= 1 ? 50 : 12 + i * (76 / Math.max(1, dfs.length - 1));
    y = side === 'home' ? 22 : 78;
  } else if (pos.includes('midfielder')) {
    const i = mfs.indexOf(player);
    x = mfs.length <= 1 ? 50 : 12 + i * (76 / Math.max(1, mfs.length - 1));
    y = 50;
  } else {
    const i = fws.indexOf(player);
    x = fws.length <= 1 ? 50 : 15 + i * (70 / Math.max(1, fws.length - 1));
    y = side === 'home' ? 38 : 62;
  }

  return { x, y };
}

export function CombinedLineupField({ home, away }: { home: TeamLineup; away: TeamLineup }) {
  const renderPlayers = (lineup: TeamLineup, side: 'home' | 'away') =>
    lineup.startXI.slice(0, 11).map((p, i) => {
      const { x, y } = getPosition(p, lineup.startXI, side);
      return (
        <div
          key={`${side}-${i}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <div
            className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center shadow-lg ${
              side === 'home' ? 'bg-blue-600 border-blue-400' : 'bg-red-600 border-red-400'
            }`}
          >
            <span className="text-[9px] font-black text-white">{p.player.number ?? '—'}</span>
          </div>
          <span className="text-[7px] md:text-[8px] font-bold text-white/90 max-w-[52px] truncate text-center bg-black/60 px-1 rounded">
            {p.player.name.split(' ').pop()}
          </span>
        </div>
      );
    });

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[3/4] max-h-[520px] bg-emerald-900/50 rounded-3xl border-4 border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-3 border-2 border-white/20 rounded-xl pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/25" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/20 rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-14 border-2 border-t-0 border-white/20" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-14 border-2 border-b-0 border-white/20" />
        </div>

        <div className="absolute top-3 left-3 right-3 flex justify-between text-[9px] font-black uppercase tracking-widest z-20 pointer-events-none">
          <span className="text-blue-300 truncate max-w-[45%]">
            {home.team.name} <span className="text-white/30">{home.formation}</span>
          </span>
          <span className="text-red-300 truncate max-w-[45%] text-right">
            {away.team.name} <span className="text-white/30">{away.formation}</span>
          </span>
        </div>

        {renderPlayers(home, 'home')}
        {renderPlayers(away, 'away')}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[home, away].map((lineup, idx) => (
          <div key={idx} className="bg-gray-900/40 border border-white/5 rounded-2xl p-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
              {lineup.team.name} — Bench
            </h4>
            <ul className="space-y-1 text-xs text-gray-300">
              {(lineup.substitutes || []).length === 0 ? (
                <li className="text-gray-600">—</li>
              ) : (
                lineup.substitutes!.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gray-500 w-5">{p.player.number ?? '·'}</span>
                    {p.player.name}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
