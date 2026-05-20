"use client";

import Link from 'next/link';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { MatchStatusBadge } from '@/components/match/MatchStatusBadge';
import { getMatchStatusDisplay } from '@/lib/match-status';

export function MatchCard({ match }: { match: any }) {
  const { phase } = getMatchStatusDisplay(match);
  const isLive = phase === 'live';
  const isNotStarted = phase === 'upcoming';

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
          <MatchStatusBadge match={match} variant="card" />
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
              {isNotStarted ? '–' : (match.goals.home ?? '-')}
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
              {isNotStarted ? '–' : (match.goals.away ?? '-')}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
