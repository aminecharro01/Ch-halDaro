"use client";

import useSWR from 'swr';
import { useState } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { LiveBadge } from '@/components/LiveBadge';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const LEAGUES = [
  { id: 'all', name: 'All' },
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78, name: 'Bundesliga' },
  { id: 61, name: 'Ligue 1' }
];

export default function Home() {
  const [activeLeague, setActiveLeague] = useState<string | number>('all');
  
  // Poll every 60s. Auto-pauses on background (revalidateOnFocus handles returns).
  const { data, error, isLoading } = useSWR('/api/scores', fetcher, { 
    refreshInterval: 60000,
    revalidateOnFocus: true
  });

  const matches = Array.isArray(data) ? data : (data?.response || []);
  
  const filteredMatches = activeLeague === 'all' 
    ? matches 
    : matches.filter((m: any) => m.league.id === activeLeague);

  const liveMatches = filteredMatches.filter((m: any) => ['1H', '2H', 'HT', 'ET', 'P'].includes(m.fixture.status.short));
  const otherMatches = filteredMatches.filter((m: any) => !['1H', '2H', 'HT', 'ET', 'P'].includes(m.fixture.status.short));

  return (
    <div className="space-y-8">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {LEAGUES.map(league => (
          <button
            key={league.id}
            onClick={() => setActiveLeague(league.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeLeague === league.id 
              ? 'bg-white text-black' 
              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {league.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-gray-900 rounded-2xl animate-pulse"></div>
          <div className="h-32 bg-gray-900 rounded-2xl animate-pulse"></div>
        </div>
      ) : error || data?.error ? (
        <div className="text-red-400 text-center py-10 bg-red-950/20 rounded-2xl">
          {data?.error ? `Error: ${data.error}` : 'Error loading matches.'}
        </div>
      ) : (
        <>
          {liveMatches.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <LiveBadge />
                <h2 className="text-xl font-bold">Live Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map((match: any) => (
                  <MatchCard key={match.fixture.id} match={match} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-300">
              {activeLeague === 'all' ? "Today's Matches" : LEAGUES.find(l => l.id === activeLeague)?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherMatches.map((match: any) => (
                <MatchCard key={match.fixture.id} match={match} />
              ))}
              {otherMatches.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No other matches today.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
