"use client";

interface Player {
  player: {
    name: string;
    number: string | number;
    position: string;
  };
}

interface LineupProps {
  teamName: string;
  formation: string;
  players: Player[];
  side: 'home' | 'away';
}

export function LineupField({ teamName, formation, players, side }: LineupProps) {
  // Simple positioning logic based on player roles
  const getPosition = (player: Player, index: number, total: number) => {
    const pos = player.player.position?.toLowerCase() || "";
    
    // Categorize players
    const gks = players.filter(p => p.player.position?.toLowerCase().includes("goalkeeper"));
    const dfs = players.filter(p => p.player.position?.toLowerCase().includes("defender") || p.player.position?.toLowerCase().includes("back"));
    const mfs = players.filter(p => p.player.position?.toLowerCase().includes("midfielder"));
    const fws = players.filter(p => p.player.position?.toLowerCase().includes("forward") || p.player.position?.toLowerCase().includes("wing") || p.player.position?.toLowerCase().includes("striker"));

    // Default to index if categories are empty
    if (gks.length === 0 && dfs.length === 0) {
        // Simple fallback distribution if position names are missing
        if (index === 0) return { x: 50, y: 5 };
        if (index < 5) return { x: 20 + (index - 1) * 20, y: 25 };
        if (index < 8) return { x: 25 + (index - 5) * 25, y: 55 };
        return { x: 30 + (index - 8) * 20, y: 80 };
    }

    let x = 50, y = 50;

    if (pos.includes("goalkeeper")) {
      x = 50;
      y = 10;
    } else if (pos.includes("defender") || pos.includes("back")) {
      const i = dfs.indexOf(player);
      x = 15 + (i * (70 / Math.max(1, dfs.length - 1)));
      if (dfs.length === 1) x = 50;
      y = 30;
    } else if (pos.includes("midfielder")) {
      const i = mfs.indexOf(player);
      x = 15 + (i * (70 / Math.max(1, mfs.length - 1)));
      if (mfs.length === 1) x = 50;
      y = 55;
    } else {
      const i = fws.indexOf(player);
      x = 20 + (i * (60 / Math.max(1, fws.length - 1)));
      if (fws.length === 1) x = 50;
      y = 80;
    }

    // Flip Y for away team
    if (side === 'away') {
      y = 100 - y;
    }

    return { x, y };
  };

  return (
    <div className="relative w-full aspect-[2/3] bg-emerald-900/40 rounded-3xl border-4 border-white/10 overflow-hidden shadow-2xl">
      {/* Pitch Markings */}
      <div className="absolute inset-4 border-2 border-white/20 rounded-xl pointer-events-none">
        {/* Center Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20"></div>
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full"></div>
        {/* Penalty Areas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-t-0 border-white/20"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-b-0 border-white/20"></div>
      </div>

      {/* Team Header */}
      <div className={`absolute left-4 z-20 font-black text-[10px] tracking-widest uppercase ${side === 'home' ? 'top-6 text-white/40' : 'bottom-6 text-white/40'}`}>
        {teamName} <span className="ml-2 text-white/20">{formation}</span>
      </div>

      {/* Players */}
      {players.slice(0, 11).map((p, i) => {
        const { x, y } = getPosition(p, i, players.length);
        return (
          <div 
            key={i} 
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${side === 'home' ? 'bg-blue-600 border-blue-400' : 'bg-red-600 border-red-400'}`}>
              <span className="text-[10px] font-black text-white">{p.player.number}</span>
            </div>
            <div className="bg-gray-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
              <span className="text-[8px] font-bold text-gray-200 whitespace-nowrap">{p.player.name.split(' ').pop()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
