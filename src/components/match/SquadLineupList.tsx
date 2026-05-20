'use client';

import { useState } from 'react';

type PlayerRow = {
  player: {
    name: string;
    number?: string | number;
    position?: string;
    photo?: string | null;
  };
};

type TeamLineup = {
  team: { name: string };
  formation?: string;
  startXI: PlayerRow[];
  substitutes?: PlayerRow[];
};

function formatShirtNumber(number?: string | number): string | null {
  if (number === undefined || number === null) return null;
  const s = String(number).trim();
  if (!s || s === '?' || s === '—') return null;
  return s;
}

function PlayerAvatar({ photo, number }: { photo?: string | null; number?: string | number }) {
  const [broken, setBroken] = useState(false);
  const shirtNum = formatShirtNumber(number);
  const showPhoto = photo && !broken;

  return (
    <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
      {showPhoto ? (
        <img
          src={photo}
          alt=""
          className="w-full h-full object-cover object-top"
          onError={() => setBroken(true)}
        />
      ) : shirtNum ? (
        <span className="text-sm font-black text-white tabular-nums">{shirtNum}</span>
      ) : (
        <span className="text-[10px] font-bold text-gray-600">·</span>
      )}
    </div>
  );
}

function PlayerRowItem({ p, sub }: { p: PlayerRow; sub?: boolean }) {
  return (
    <li
      className={`flex items-center gap-3 py-2 px-2 rounded-xl ${sub ? 'opacity-80' : ''}`}
    >
      <PlayerAvatar photo={p.player.photo} number={p.player.number} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{p.player.name}</p>
        {p.player.position ? (
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{p.player.position}</p>
        ) : null}
      </div>
      <span className="text-xs font-black text-gray-500 tabular-nums w-6 text-center">
        {formatShirtNumber(p.player.number) ?? '·'}
      </span>
    </li>
  );
}

export function SquadLineupList({ home, away }: { home: TeamLineup; away: TeamLineup }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[home, away].map((lineup) => (
        <div
          key={lineup.team.name}
          className="bg-gray-900/40 border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h4 className="font-black text-white text-sm uppercase tracking-widest">
              {lineup.team.name}
            </h4>
            {lineup.formation ? (
              <span className="text-[10px] font-bold text-gray-500">{lineup.formation}</span>
            ) : null}
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
            Starting XI
          </p>
          <ul className="space-y-1 mb-4">
            {lineup.startXI.length === 0 ? (
              <li className="text-sm text-gray-600 py-4">No lineup data</li>
            ) : (
              lineup.startXI.map((p, i) => <PlayerRowItem key={i} p={p} />)
            )}
          </ul>
          {(lineup.substitutes?.length ?? 0) > 0 && (
            <>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Bench
              </p>
              <ul className="space-y-1">
                {lineup.substitutes!.map((p, i) => (
                  <PlayerRowItem key={i} p={p} sub />
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
