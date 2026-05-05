"use client";
import useSWR from 'swr';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR(`/api/league/${id}`, fetcher);

  if (isLoading) return <div className="animate-pulse space-y-4 py-10"><div className="h-64 bg-gray-900 rounded-2xl"></div></div>;
  if (error || !data) return <div className="text-red-500 py-10">Error loading league data.</div>;

  const { standings, topScorers, topAssists, fixtures } = data;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ... previous content ... */}
      <section className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-lg">
        <div className="bg-gray-800/40 p-4 border-b border-white/5">
          <h2 className="font-bold text-gray-100 uppercase tracking-wider text-xs">League Standings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-black/30">
              <tr>
                <th className="px-4 py-3 text-center">Pos</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-center">P</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">D</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">GD</th>
                <th className="px-4 py-3 text-center font-bold text-white">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row: any) => (
                <tr key={row.team.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-center font-semibold text-gray-300">{row.rank}</td>
                  <td className="px-4 py-3">
                    <Link href={`/team/${row.team.id}`} className="flex items-center gap-3 group">
                      <Image src={row.team.logo} width={24} height={24} className="w-6 h-6 object-contain drop-shadow-sm group-hover:scale-110 transition-transform" alt={row.team.name} />
                      <span className="font-medium text-white group-hover:text-green-400 transition-colors">{row.team.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">{row.all.played}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{row.all.win}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{row.all.draw}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{row.all.lose}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{row.goalsDiff}</td>
                  <td className="px-4 py-3 text-center font-bold text-live-green">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Results */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-black text-gray-100 text-2xl flex items-center gap-2 tracking-tight uppercase">
             Recent Results
          </h2>
          <div className="space-y-4">
            {fixtures.map((f: any) => (
              <Link href={`/match/${f.fixture.id}`} key={f.fixture.id} className="bg-gray-900/30 backdrop-blur border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/40 transition-all shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                   <Image src={f.teams.home.logo} width={24} height={24} className="w-6 h-6 object-contain" alt="" />
                   <span className="text-sm font-bold text-gray-200 truncate">
                     {f.teams.home.name}
                   </span>
                </div>
                <div className="px-6 flex flex-col items-center">
                  <span className="text-xl font-black text-white">{f.goals.home} - {f.goals.away}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {new Date(f.fixture.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                   <span className="text-sm font-bold text-gray-200 truncate">
                     {f.teams.away.name}
                   </span>
                   <Image src={f.teams.away.logo} width={24} height={24} className="w-6 h-6 object-contain" alt="" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-12">
          {/* Top Scorers */}
          <div className="space-y-6">
            <h2 className="font-black text-gray-100 text-xl tracking-tight uppercase border-b-2 border-green-500 pb-2 inline-block">
              Top Scorers
            </h2>
            <div className="space-y-4">
              {topScorers.slice(0, 5).map((s: any, idx: number) => (
                <div key={s.player.id} className="flex items-center gap-4 bg-gray-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-sm">
                  <Image src={s.player.photo} width={40} height={40} className="w-10 h-10 rounded-full border-2 border-gray-800 object-cover" alt="" />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-100">{s.player.name}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase truncate">{s.statistics[0].team.name}</div>
                  </div>
                  <div className="text-lg font-black text-white">{s.statistics[0].goals.total}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Assists */}
          <div className="space-y-6">
            <h2 className="font-black text-gray-100 text-xl tracking-tight uppercase border-b-2 border-blue-500 pb-2 inline-block">
              Top Assists
            </h2>
            <div className="space-y-4">
              {topAssists.slice(0, 5).map((s: any, idx: number) => (
                <div key={s.player.id} className="flex items-center gap-4 bg-gray-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-sm">
                  <Image src={s.player.photo} width={40} height={40} className="w-10 h-10 rounded-full border-2 border-gray-800 object-cover" alt="" />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-100">{s.player.name}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase truncate">{s.statistics[0].team.name}</div>
                  </div>
                  <div className="text-lg font-black text-white">{s.statistics[0].goals.assists || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
