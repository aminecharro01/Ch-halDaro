"use client";

import useSWR from 'swr';
import { useState } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { LiveBadge } from '@/components/LiveBadge';
import { Sidebar } from '@/components/Sidebar';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const LEAGUES = [
  { id: 'all', name: 'All' },
  { id: 2, name: 'Champions League' },
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78, name: 'Bundesliga' },
  { id: 61, name: 'Ligue 1' }
];

export default function Home() {
  const [activeLeague, setActiveLeague] = useState<string | number>('all');
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data, error, isLoading } = useSWR(`/api/scores?date=${activeDate}`, fetcher, { 
    refreshInterval: 60000,
    revalidateOnFocus: true
  });

  const rawMatches = Array.isArray(data) ? data : (data?.response || []);
  const matches = Array.isArray(rawMatches) ? rawMatches : [];
  
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

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Feed */}
      <div className="flex-1 space-y-8 min-w-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-gray-900/40 p-2 rounded-2xl border border-white/5 self-start">
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
        ) : error || data?.error ? (
          <div className="text-red-500 font-bold text-center py-10 bg-red-950/20 backdrop-blur-md rounded-2xl border border-red-900/50">
            {data?.error ? `Error: ${data.error}` : 'Error loading matches.'}
          </div>
        ) : (
          <>
            {liveMatches.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <LiveBadge />
                  <h2 className="text-2xl font-black text-white tracking-tight">Live Now</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveMatches.map((match: any) => (
                    <MatchCard key={match.fixture.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold mb-5 text-gray-300">
                {activeLeague === 'all' ? `${displayDate}'s Matches` : `${LEAGUES.find(l => l.id === activeLeague)?.name} - ${displayDate}`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherMatches.map((match: any) => (
                  <MatchCard key={match.fixture.id} match={match} />
                ))}
                {otherMatches.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5">
                    <p className="text-gray-500 font-medium">No matches found for {displayDate}.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
