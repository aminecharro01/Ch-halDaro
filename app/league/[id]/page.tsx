"use client";
import useSWR from 'swr';
import { use } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR(`/api/league/${id}`, fetcher);

  if (isLoading) return <div className="animate-pulse space-y-4 py-10"><div className="h-64 bg-gray-900 rounded-2xl"></div></div>;
  if (error || !data) return <div className="text-red-500 py-10">Error loading league data.</div>;

  const { standings, topScorers } = data;

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="bg-gray-900/40 border border-gray-800/60 rounded-3xl overflow-hidden">
        <h2 className="bg-gray-800/60 font-bold p-4 text-gray-200">League Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
              <tr>
                <th className="px-4 py-3">Pos</th>
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
                <tr key={row.team.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-semibold text-gray-300">{row.rank}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={row.team.logo} className="w-6 h-6" alt={row.team.name} />
                    <span className="font-medium text-white">{row.team.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">{row.all.played}</td>
                  <td className="px-4 py-3 text-center">{row.all.win}</td>
                  <td className="px-4 py-3 text-center">{row.all.draw}</td>
                  <td className="px-4 py-3 text-center">{row.all.lose}</td>
                  <td className="px-4 py-3 text-center">{row.goalsDiff}</td>
                  <td className="px-4 py-3 text-center font-bold text-live-green">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-gray-900/40 border border-gray-800/60 rounded-3xl overflow-hidden p-4 md:p-6">
        <h2 className="font-bold text-gray-200 mb-6 flex justify-between items-center">
          <span>Top Scorers</span>
          <span className="text-xl">👟⚽</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topScorers.slice(0, 10).map((s: any, idx: number) => (
            <div key={s.player.id} className="flex items-center gap-4 bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span className="text-gray-600 font-bold w-4">{idx + 1}</span>
              <img src={s.player.photo} className="w-10 h-10 rounded-full bg-gray-800 object-cover" alt="" />
              <div className="flex-1">
                <div className="font-medium text-gray-100">{s.player.name}</div>
                <div className="text-xs text-gray-500">{s.statistics[0].team.name}</div>
              </div>
              <div className="text-xl font-bold text-white mr-2">{s.statistics[0].goals.total}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
