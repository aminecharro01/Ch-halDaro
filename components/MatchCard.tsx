"use client";

import Link from 'next/link';
import { FavoriteButton } from '@/components/FavoriteButton';

export function MatchCard({ match }: { match: any }) {
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(match.fixture?.status?.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(match.fixture?.status?.short);
  const isNotStarted = match.fixture?.status?.short === 'NS';

  return (
    <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-6 transition-all duration-500 hover:bg-gray-800/40 hover:border-white/10 group shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
          {match.league.logo && (
            <img src={match.league.logo} alt="" className="w-4 h-4 object-contain opacity-50 group-hover:opacity-100 transition-opacity" />
          )}
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">{match.league.name}</span>
        </div>
        <FavoriteButton 
          itemId={match.fixture.id} 
          itemType="match" 
          itemName={`${match.teams.home.name} vs ${match.teams.away.name}`}
          itemLogo={match.league.logo}
          className="scale-75" 
        />
      </div>

      <Link href={`/match/${match.fixture.id}`} className="block space-y-4 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            {isLive ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-live-green"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live-green"></span>
                </span>
                <span className="text-xs text-live-green font-bold">
                  {match.fixture.status.elapsed && parseInt(match.fixture.status.elapsed) > 0 
                    ? `${match.fixture.status.elapsed}'` 
                    : match.fixture.status.short}
                </span>
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
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {match.teams.home.logo && (
                <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8 object-contain drop-shadow" />
              )}
              <span className="font-bold text-gray-100">{match.teams.home.name}</span>
            </div>
            <span className={`text-2xl font-black ${isLive ? 'text-white' : 'text-gray-300'}`}>
              {match.goals.home ?? '-'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {match.teams.away.logo && (
                <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8 object-contain drop-shadow" />
              )}
              <span className="font-bold text-gray-100">{match.teams.away.name}</span>
            </div>
            <span className={`text-2xl font-black ${isLive ? 'text-white' : 'text-gray-300'}`}>
              {match.goals.away ?? '-'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
