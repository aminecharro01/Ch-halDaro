import { getLeagueStandings, getLeagueEventsNext } from '@/lib/thesportsdb';
import { mapStandings, mapMatch } from '@/lib/api-adapter';
import Image from 'next/image';

export default async function WorldCup() {
  // Fetch tournament standings (World Cup ID in TSDB is 4429)
  let standings = [];
  try {
    const data = await getLeagueStandings('4429', '2026');
    const tableData = Array.isArray(data) ? data : (data?.table || data?.standings || []);
    
    if (tableData.length > 0) {
      // TSDB table is usually flat, but we want to group by 'strGroup' if possible
      const rawStandings = mapStandings(tableData);
      const groupsMap: Record<string, any[]> = {};
      rawStandings.forEach(row => {
        const group = row.group || 'Group A';
        if (!groupsMap[group]) groupsMap[group] = [];
        groupsMap[group].push(row);
      });
      standings = Object.values(groupsMap);
    }
  } catch (e) {
    console.error("Failed to fetch WC standings", e);
  }

  let fixtures = [];
  try {
    const data = await getLeagueEventsNext('4429');
    const eventData = Array.isArray(data) ? data : (data?.events || data?.fixtures || []);
    if (eventData.length > 0) {
      fixtures = eventData.map(mapMatch);
    }
  } catch (e) {
    console.error("Failed to fetch WC fixtures", e);
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

      <section>
        <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
          <span className="text-blue-500 block w-2 h-6 rounded-sm bg-blue-500"></span>
          Upcoming Fixtures
        </h2>
        {fixtures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixtures.map((match: any) => (
              <div key={match.fixture.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  {match.teams.home.logo && (
                    <Image src={match.teams.home.logo} alt="" width={24} height={24} />
                  )}
                  <span className="text-sm font-bold truncate">{match.teams.home.name}</span>
                </div>
                <div className="px-4 text-xs font-mono text-gray-500">
                  {new Date(match.fixture.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end text-right">
                  <span className="text-sm font-bold truncate">{match.teams.away.name}</span>
                  {match.teams.away.logo && (
                    <Image src={match.teams.away.logo} alt="" width={24} height={24} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center border-dashed">
            <div className="text-gray-500 italic">Fixtures will be announced soon</div>
          </div>
        )}
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
