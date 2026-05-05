import Link from 'next/link';
import { Trophy, Globe, Medal } from 'lucide-react';

export function Sidebar() {
  const topTeams = [
    { id: '541', name: 'Real Madrid', img: 'https://media.api-sports.io/football/teams/541.png' },
    { id: '50', name: 'Manchester City', img: 'https://media.api-sports.io/football/teams/50.png' },
    { id: '85', name: 'PSG', img: 'https://media.api-sports.io/football/teams/85.png' },
    { id: '157', name: 'Bayern Munich', img: 'https://media.api-sports.io/football/teams/157.png' },
    { id: '42', name: 'Arsenal', img: 'https://media.api-sports.io/football/teams/42.png' },
  ];

  const topCompetitions = [
    { id: '2', name: 'Champions League' },
    { id: '39', name: 'Premier League' },
    { id: '140', name: 'La Liga' },
    { id: '135', name: 'Serie A' },
    { id: '78', name: 'Bundesliga' },
  ];

  const regions = [
    { id: 'europe', name: 'Europe' },
    { id: 'south-america', name: 'South America' },
    { id: 'asia', name: 'Asia' },
    { id: 'africa', name: 'Africa' },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
      {/* Top Teams */}
      <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-yellow-500" /> Top 5 Teams
        </h3>
        <ul className="space-y-3">
          {topTeams.map((team, idx) => (
            <li key={team.id}>
              <Link href={`/team/${team.id}`} className="flex items-center gap-3 group">
                <span className="text-xs font-bold text-gray-500 w-3">{idx + 1}</span>
                <img src={team.img} className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" alt={team.name} />
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{team.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Competitions */}
      <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-500" /> Top Competitions
        </h3>
        <ul className="space-y-3">
          {topCompetitions.map((comp) => (
            <li key={comp.id}>
              <Link href={`/league/${comp.id}`} className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {comp.name}
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
