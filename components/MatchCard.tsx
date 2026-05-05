"use client";

import Link from 'next/link';
import { Heart } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function MatchCard({ match }: { match: any }) {
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(match.fixture.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(match.fixture.status.short);
  const isNotStarted = match.fixture.status.short === 'NS';

  // We'll track favorites for teams (home or away) or the match league
  // For simplicity, let's allow favoriting the home team from the card
  const itemId = match.teams.home.id.toString();
  const itemType = 'team';

  const { data: favorites } = useSWR('/api/favorites', fetcher);
  const [isToggling, setIsToggling] = useState(false);

  const isFavorited = Array.isArray(favorites) && favorites.some(
    (f: any) => f.item_id === itemId && f.item_type === itemType
  );

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!favorites || favorites.error) {
      window.location.href = '/login';
      return;
    }

    setIsToggling(true);
    const method = isFavorited ? 'DELETE' : 'POST';
    
    try {
      const res = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemType }),
      });
      
      if (res.ok) {
        mutate('/api/favorites');
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative group animate-fade-up bg-gray-900/40 backdrop-blur-md shadow-lg border border-white/10 rounded-2xl p-4 hover:bg-gray-800/60 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* League Logo Watermark */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.05] pointer-events-none transform -rotate-12 transition-transform group-hover:rotate-0 duration-700">
        <img src={match.league.logo} alt="" className="w-24 h-24 object-contain grayscale" />
      </div>

      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{match.league.name}</span>
        <div className="flex items-center gap-3">
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
          
          <button 
            onClick={toggleFavorite}
            disabled={isToggling}
            className={`transition-all duration-300 transform active:scale-125 p-1 rounded-full hover:bg-white/20 ${
              isFavorited 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-500 hover:text-red-400'
            }`}
            title={isFavorited ? "Unfollow Team" : "Follow Team"}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <Link href={`/match/${match.fixture.id}`} className="block relative z-10">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8 object-contain drop-shadow" />
              <span className="font-bold text-gray-100">{match.teams.home.name}</span>
            </div>
            <span className={`text-2xl font-black ${isLive ? 'text-white' : 'text-gray-300'}`}>
              {match.goals.home ?? '-'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8 object-contain drop-shadow" />
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
