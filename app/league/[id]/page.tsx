"use client";
import useSWR from 'swr';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FavoriteButton } from '@/components/FavoriteButton';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR(`/api/league/${id}`, fetcher);

  if (isLoading) return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-pulse">
      <div className="h-64 bg-gray-900/50 rounded-3xl border border-white/5"></div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-gray-900/50 rounded-3xl border border-white/5"></div>
        <div className="h-96 bg-gray-900/50 rounded-3xl border border-white/5"></div>
      </div>
    </div>
  );
  
  if (error || !data) return <div className="text-red-500 py-20 text-center font-bold">Error loading league data.</div>;

  const { standings, topScorers, topAssists, lastFixtures, nextFixtures } = data;

  // Flatten standings if it's a multi-group league like Champions League
  // If standings[0] is an array, it's grouped.
  const isGrouped = Array.isArray(standings[0]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-12 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gray-900/60 p-8 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-inner">
             {standings?.[0]?.[0]?.league?.logo && (
               <Image src={standings[0][0].league.logo} width={64} height={64} className="w-16 h-16 object-contain" alt="" />
             )}
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
              {standings?.[0]?.[0]?.league?.name || "League Details"}
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Saison 2024-2025</p>
          </div>
        </div>
        <div className="flex gap-4 relative z-10">
          <FavoriteButton itemId={id} itemType="league" className="scale-125" />
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
      </div>
      {/* Top Fixtures / Upcoming */}
      {nextFixtures.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            Upcoming Fixtures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextFixtures.slice(0, 6).map((f: any) => (
              <Link href={`/match/${f.fixture.id}`} key={f.fixture.id} className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-gray-800/40 transition-all group shadow-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-between w-full px-2">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      {f.teams.home.logo && (
                        <Image src={f.teams.home.logo} width={32} height={32} className="w-8 h-8 object-contain" alt="" />
                      )}
                      <span className="text-[10px] font-bold text-gray-400 text-center uppercase truncate w-20">{f.teams.home.name}</span>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <span className="text-sm font-black text-white">{new Date(f.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase">{new Date(f.fixture.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      {f.teams.away.logo && (
                        <Image src={f.teams.away.logo} width={32} height={32} className="w-8 h-8 object-contain" alt="" />
                      )}
                      <span className="text-[10px] font-bold text-gray-400 text-center uppercase truncate w-20">{f.teams.away.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Standings / Groups */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
          <span className="w-2 h-8 bg-green-500 rounded-full"></span>
          Standings {isGrouped ? "& Groups" : ""}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(isGrouped ? standings : [standings]).map((group: any, gIdx: number) => (
            <div key={gIdx} className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              {isGrouped && (
                <div className="bg-gray-800/60 p-4 border-b border-white/5">
                  <h3 className="font-bold text-blue-400 uppercase tracking-widest text-xs">{group[0]?.group || `Group ${gIdx + 1}`}</h3>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-gray-500 uppercase bg-black/20">
                    <tr>
                      <th className="px-4 py-3 text-center">#</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3 text-center">P</th>
                      <th className="px-4 py-3 text-center">GD</th>
                      <th className="px-4 py-3 text-center font-bold text-white">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((row: any) => (
                      <tr key={row.team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-center font-bold text-gray-400">{row.rank}</td>
                        <td className="px-4 py-3">
                          <Link href={`/team/${row.team.id}`} className="flex items-center gap-2 group">
                            {row.team.logo && (
                              <Image src={row.team.logo} width={20} height={20} className="w-5 h-5 object-contain" alt="" />
                            )}
                            <span className="font-medium text-gray-200 group-hover:text-white transition-colors truncate max-w-[120px]">{row.team.name}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400">{row.all.played}</td>
                        <td className="px-4 py-3 text-center text-gray-400">{row.goalsDiff}</td>
                        <td className="px-4 py-3 text-center font-black text-live-green">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Results */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
              <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
              Recent Results
            </h2>
            <div className="space-y-3">
              {lastFixtures.map((f: any) => (
                <Link href={`/match/${f.fixture.id}`} key={f.fixture.id} className="bg-gray-900/30 backdrop-blur border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/40 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    {f.teams.home.logo && (
                      <Image src={f.teams.home.logo} width={24} height={24} className="w-6 h-6 object-contain" alt="" />
                    )}
                    <span className="text-xs font-bold text-gray-300 truncate">{f.teams.home.name}</span>
                  </div>
                  <div className="px-4 flex flex-col items-center">
                    <span className="text-lg font-black text-white">{f.goals.home} - {f.goals.away}</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase">{f.fixture.status.short}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="text-xs font-bold text-gray-300 truncate">{f.teams.away.name}</span>
                    {f.teams.away.logo && (
                      <Image src={f.teams.away.logo} width={24} height={24} className="w-6 h-6 object-contain" alt="" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Stats */}
        <aside className="space-y-12">
          <section className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter border-b-2 border-green-500 pb-2 inline-block">
              Top Scorers
            </h2>
            <div className="space-y-3">
              {topScorers.slice(0, 10).map((s: any) => (
                <div key={s.player.id} className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-2xl border border-white/5">
                  {s.player.photo && (
                    <Image src={s.player.photo} width={32} height={32} className="w-8 h-8 rounded-full bg-gray-800" alt="" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-200 truncate">{s.player.name}</div>
                    <div className="text-[8px] text-gray-500 uppercase font-black">{s.statistics[0].team.name}</div>
                  </div>
                  <div className="text-sm font-black text-white">{s.statistics[0].goals.total}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter border-b-2 border-blue-500 pb-2 inline-block">
              Top Assists
            </h2>
            <div className="space-y-3">
              {topAssists.slice(0, 10).map((s: any) => (
                <div key={s.player.id} className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-2xl border border-white/5">
                  {s.player.photo && (
                    <Image src={s.player.photo} width={32} height={32} className="w-8 h-8 rounded-full bg-gray-800" alt="" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-200 truncate">{s.player.name}</div>
                    <div className="text-[8px] text-gray-500 uppercase font-black">{s.statistics[0].team.name}</div>
                  </div>
                  <div className="text-sm font-black text-white">{s.statistics[0].goals.assists || 0}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
