import { fetchFootballApi } from '@/lib/api-football';
import Image from 'next/image';
import Link from 'next/link';

export default async function WorldCup() {
  // Fetch tournament standings
  let standings = [];
  try {
    const data = await fetchFootballApi('/standings', { league: '1', season: '2026' }) as any;
    if (data && data[0] && data[0].league && data[0].league.standings) {
      standings = data[0].league.standings;
    }
  } catch (e) {
    console.error("Failed to fetch WC standings", e);
  }

  // World Cup 2026 has 12 groups (A-L)
  const groups = standings.length > 0 ? standings : [];

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

      <WorldCupMatches />

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

async function WorldCupMatches() {
  const matches = await fetchFootballApi('/fixtures', { league: '1', season: '2026' }) as any;

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
        <span className="text-blue-500 block w-2 h-6 rounded-sm bg-blue-500"></span>
        Featured Matches
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((m: any) => (
          <Link href={`/match/${m.fixture.id}`} key={m.fixture.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{m.league.round}</span>
              <span className="text-xs font-bold text-live-green">{m.fixture.status.short === 'FT' ? 'FT' : `${m.fixture.status.elapsed}'`}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-2 flex-1">
                <Image src={m.teams.home.logo} width={40} height={40} alt="" className="w-10 h-10 object-contain" />
                <span className="font-bold text-sm text-center">{m.teams.home.name}</span>
              </div>
              <div className="text-3xl font-black px-4">{m.goals.home} - {m.goals.away}</div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <Image src={m.teams.away.logo} width={40} height={40} alt="" className="w-10 h-10 object-contain" />
                <span className="font-bold text-sm text-center">{m.teams.away.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
