"use client";

import Link from 'next/link';

export function MatchCard({ match }: { match: any }) {
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(match.fixture.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(match.fixture.status.short);
  const isNotStarted = match.fixture.status.short === 'NS';

  return (
    <div className="relative group animate-fade-up bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-4 hover:bg-gray-800/80 hover:border-gray-700 transition-all duration-300">
      <button 
        className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors z-10"
        title="Follow Team"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <Link href={`/match/${match.fixture.id}`} className="block">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{match.league.name}</span>
          {isLive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-live-green"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-live-green"></span>
              </span>
              <span className="text-xs text-live-green font-bold">{match.fixture.status.elapsed}'</span>
            </div>
          ) : isFinished ? (
            <span className="text-xs font-bold text-gray-500">FT</span>
          ) : isNotStarted ? (
            <span className="text-xs font-bold text-blue-400">
              {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className="text-xs font-bold text-gray-400">{match.fixture.status.short}</span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8 object-contain drop-shadow" />
              <span className="font-semibold text-gray-100">{match.teams.home.name}</span>
            </div>
            <span className={`text-2xl font-bold ${isLive ? 'text-white' : 'text-gray-300'}`}>
              {match.goals.home ?? '-'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8 object-contain drop-shadow" />
              <span className="font-semibold text-gray-100">{match.teams.away.name}</span>
            </div>
            <span className={`text-2xl font-bold ${isLive ? 'text-white' : 'text-gray-300'}`}>
              {match.goals.away ?? '-'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
