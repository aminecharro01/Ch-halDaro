"use client";
import Link from 'next/link';
import { Trophy, Globe, Medal } from 'lucide-react';
import { LeagueLogo } from '@/components/ui/LeagueLogo';

export function Sidebar() {
  const topTeams = [
    { id: '133602', name: 'Liverpool', img: 'https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png' },
    { id: '133613', name: 'Manchester City', img: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png' },
    { id: '133738', name: 'Real Madrid', img: 'https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png' },
    { id: '133664', name: 'Bayern Munich', img: 'https://r2.thesportsdb.com/images/media/team/badge/01ogkh1716960412.png' },
    { id: '133604', name: 'Arsenal', img: 'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png' },
  ];

  const topCompetitions = [
    { id: '4480', name: 'Champions League' },
    { id: '4328', name: 'Premier League' },
    { id: '4335', name: 'La Liga' },
    { id: '4332', name: 'Serie A' },
    { id: '4331', name: 'Bundesliga' },
    { id: '4520', name: 'Botola Pro' },
  ];

  const regions = [
    { id: 'europe', name: 'Europe' },
    { id: 'south-america', name: 'South America' },
    { id: 'asia', name: 'Asia' },
    { id: 'africa', name: 'Africa' },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
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

      <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
          <Trophy className="w-4 h-4 text-indigo-500" /> Competitions
        </h3>
        <ul className="space-y-3">
          {topCompetitions.map((comp) => (
            <li key={comp.id}>
              <Link href={`/league/${comp.id}`} className="flex items-center gap-3 group p-1.5 rounded-xl hover:bg-white/5 transition-all">
                <LeagueLogo leagueId={comp.id} name={comp.name} className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors truncate">{comp.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/tv"
        className="block bg-green-900/20 backdrop-blur-md border border-green-500/20 rounded-2xl p-4 text-center text-xs font-black uppercase tracking-widest text-green-400 hover:bg-green-900/40 transition"
      >
        TV Guide — tonight
      </Link>

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
