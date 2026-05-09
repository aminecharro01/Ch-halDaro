"use client";

import useSWR from 'swr';
import { useState } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { LiveBadge } from '@/components/LiveBadge';
import { Sidebar } from '@/components/Sidebar';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const LEAGUES = [
  { id: 'all', name: 'All' },
  { id: 4480, name: 'Champions League' },
  { id: 4328, name: 'Premier League' },
  { id: 4335, name: 'La Liga' },
  { id: 4332, name: 'Serie A' },
  { id: 4331, name: 'Bundesliga' },
  { id: 4334, name: 'Ligue 1' },
  { id: 4520, name: 'Botola Pro' }
];

export default function Home() {
  const [activeLeague, setActiveLeague] = useState<string | number>('all');
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data, error, isLoading } = useSWR(`/api/scores?date=${activeDate}`, fetcher, { 
    refreshInterval: 60000,
    revalidateOnFocus: true
  });

  const rawMatches = data?.response || (Array.isArray(data) ? data : []);
  const matches = Array.isArray(rawMatches) ? rawMatches : [];
  const apiError = data?.error || error?.message;
  
  const filteredMatches = activeLeague === 'all' 
    ? matches 
    : matches.filter((m: any) => Number(m.league?.id) === Number(activeLeague));

  const liveMatches = filteredMatches.filter((m: any) => ['1H', '2H', 'HT', 'ET', 'P'].includes(m.fixture?.status?.short));
  const otherMatches = filteredMatches.filter((m: any) => !['1H', '2H', 'HT', 'ET', 'P'].includes(m.fixture?.status?.short));

  const changeDate = (days: number) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + days);
    setActiveDate(d.toISOString().split('T')[0]);
  };

  const isToday = activeDate === new Date().toISOString().split('T')[0];
  const displayDate = isToday ? "Today" : new Date(activeDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  // Group matches by league
  const groupedMatches: Record<string, { league: any, matches: any[] }> = {};
  filteredMatches.forEach((match: any) => {
    const leagueId = match.league.id;
    if (!groupedMatches[leagueId]) {
      groupedMatches[leagueId] = {
        league: match.league,
        matches: []
      };
    }
    groupedMatches[leagueId].matches.push(match);
  });

  const leagueGroups = Object.values(groupedMatches);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Feed */}
      <div className="flex-1 space-y-8 min-w-0">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 bg-gray-900/40 p-2 rounded-2xl border border-white/5 self-start backdrop-blur-md">
            <button 
              onClick={() => changeDate(-1)}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Yesterday
            </button>
            <button 
              onClick={() => setActiveDate(new Date().toISOString().split('T')[0])}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${isToday ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Today
            </button>
            <button 
              onClick={() => changeDate(1)}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Tomorrow
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {LEAGUES.map(league => (
              <button
                key={league.id}
                onClick={() => setActiveLeague(league.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all border ${
                  activeLeague === league.id 
                  ? 'bg-white text-black border-transparent shadow-md transform scale-105' 
                  : 'bg-gray-900/40 border-white/10 text-gray-400 hover:bg-gray-800/60'
                }`}
              >
                {league.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-900/20 backdrop-blur-sm rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : apiError ? (
          <div className="text-red-500 font-bold text-center py-10 bg-red-950/20 backdrop-blur-md rounded-2xl border border-red-900/50">
            Error: {apiError}
          </div>
        ) : leagueGroups.length > 0 ? (
          <div className="space-y-10">
            {leagueGroups.map((group: any) => (
              <div key={group.league.id} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  {group.league.logo && (
                    <img src={group.league.logo} alt="" className="w-6 h-6 object-contain" />
                  )}
                  <h2 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    {group.league.name}
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-800 px-1.5 py-0.5 rounded ml-2">
                      {group.matches.length}
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.matches.map((match: any) => (
                    <MatchCard key={match.fixture.id} match={match} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-gray-900/20 rounded-3xl border border-gray-800/50 border-dashed">
            <span className="text-4xl opacity-20">⚽</span>
            <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">No matches found for this date</div>
          </div>
        )}
      </div>
    </div>
  );
}
