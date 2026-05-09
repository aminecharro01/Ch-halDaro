"use client";
import Link from 'next/link';
import { Trophy, Globe, Medal } from 'lucide-react';

export function Sidebar() {
  const topTeams = [
    { id: '133602', name: 'Liverpool', img: 'https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png' },
    { id: '133613', name: 'Manchester City', img: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png' },
    { id: '133738', name: 'Real Madrid', img: 'https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png' },
    { id: '133664', name: 'Bayern Munich', img: 'https://r2.thesportsdb.com/images/media/team/badge/01ogkh1716960412.png' },
    { id: '133604', name: 'Arsenal', img: 'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png' },
  ];

  const topCompetitions = [
    { id: '4480', name: 'Champions League', img: 'https://r2.thesportsdb.com/images/media/league/badge/small/dq7mve1738367912.png' },
    { id: '4328', name: 'Premier League', img: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png' },
    { id: '4335', name: 'La Liga', img: 'https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png' },
    { id: '4332', name: 'Serie A', img: 'https://r2.thesportsdb.com/images/media/league/badge/67q3q21679951383.png' },
    { id: '4331', name: 'Bundesliga', img: 'https://r2.thesportsdb.com/images/media/league/badge/teqh1b1679952008.png' },
    { id: '4520', name: 'Botola Pro', img: 'https://r2.thesportsdb.com/images/media/league/badge/small/9m769m1601041187.png' },
  ];

  const regions = [
    { id: 'Europe', name: 'Europe' },
    { id: 'South-America', name: 'South America' },
    { id: 'Asia', name: 'Asia' },
    { id: 'Africa', name: 'Africa' },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
      {/* Top Teams */}
      <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
          <Medal className="w-4 h-4 text-yellow-500" /> Top 5 Teams
        </h3>
        <ul className="space-y-3">
          {topTeams.map((team, idx) => (
            <li key={team.id}>
              <Link href={`/team/${team.id}`} className="flex items-center gap-3 group p-1.5 rounded-xl hover:bg-white/5 transition-all">
                <span className="text-[10px] font-bold text-gray-600 w-3">{idx + 1}</span>
                <img src={team.img} className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" alt={team.name} />
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors truncate">{team.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Competitions */}
      <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
          <Trophy className="w-4 h-4 text-indigo-500" /> Competitions
        </h3>
        <ul className="space-y-3">
          {topCompetitions.map((comp) => (
            <li key={comp.id}>
              <Link href={`/league/${comp.id}`} className="flex items-center gap-3 group p-1.5 rounded-xl hover:bg-white/5 transition-all">
                <img src={comp.img} className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity" alt={comp.name} />
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors truncate">{comp.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Regions */}
      <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> Regions
        </h3>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <Link key={region.id} href={`/region/${region.id}`} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5  border border-white/10 text-gray-300 hover:bg-green-900/30 hover:text-green-400 shadow-sm transition-colors">
              {region.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
