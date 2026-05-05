import { fetchFootballApi } from '@/lib/api-football';
import Image from 'next/image';

export default async function WorldCup() {
  // Fetch tournament standings
  let standings = [];
  try {
    const data = await fetchFootballApi('/standings', { league: '1', season: '2022' });
    if (data && data[0] && data[0].league && data[0].league.standings) {
      standings = data[0].league.standings;
    }
  } catch (e) {
    console.error("Failed to fetch WC standings", e);
  }

  // Fallback if no data
  const groups = standings.length > 0 ? standings : Array.from({ length: 8 }).map((_, i) => [
    { team: { name: 'TBD 1' }, points: 0, goalsDiff: 0 },
    { team: { name: 'TBD 2' }, points: 0, goalsDiff: 0 },
    { team: { name: 'TBD 3' }, points: 0, goalsDiff: 0 },
    { team: { name: 'TBD 4' }, points: 0, goalsDiff: 0 },
  ]);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="text-center space-y-3 py-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-blue-900/40 rounded-3xl border border-blue-800/50">
        <span className="text-5xl">🏆</span>
        <h1 className="text-3xl font-black text-white tracking-tighter">World Cup 2026</h1>
        <p className="text-blue-300 font-medium">Coming June 11, 2026 — North America</p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
          <span className="text-live-green block w-2 h-6 rounded-sm bg-live-green"></span>
          Group Stage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groups.map((group: any, idx: number) => {
            const groupName = group[0]?.group || `Group ${String.fromCharCode(65 + idx)}`;
            return (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4 transition duration-500">
                <h3 className="font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2">{groupName}</h3>
                <ul className="space-y-2 text-sm">
                  {group.map((row: any, i: number) => (
                    <li key={i} className="flex justify-between items-center text-gray-300">
                      <div className="flex items-center gap-2">
                        {row.team.logo && <Image src={row.team.logo} alt={row.team.name} width={16} height={16} className="w-4 h-4 object-contain" />}
                        <span>{row.team.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500 text-xs w-4 text-right" title="Goal Difference">{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</span>
                        <span className="font-bold w-4 text-right">{row.points}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="opacity-50">
        <h2 className="text-xl font-bold text-gray-200 mb-6 mt-12 flex items-center gap-2">
          <span className="text-gray-500 block w-2 h-6 rounded-sm bg-gray-500"></span>
          Knockout Bracket
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center border-dashed">
          <div className="text-gray-500 italic">Knockout bracket will render here once Round of 32 begins</div>
        </div>
      </section>
    </div>
  );
}
