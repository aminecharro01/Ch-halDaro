"use client";
import useSWR from 'swr';
import { use } from 'react';
import { EventTimeline } from '@/components/EventTimeline';
import { StatBar } from '@/components/StatBar';
import { PredictionPanel } from '@/components/PredictionPanel';
import { MatchAnalysis } from '@/components/MatchAnalysis';
import { AISummary } from '@/components/AISummary';
import { KeyBattle } from '@/components/KeyBattle';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const { data, error, isLoading } = useSWR(`/api/match/${id}`, fetcher, { 
    refreshInterval: 60000,
    revalidateOnFocus: true
  });

  const apiError = data?.error || error?.message;
  if (isLoading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading match details...</div>;
  if (apiError || !data?.fixture) return (
    <div className="text-center py-20">
      <div className="text-red-500 font-bold mb-2">Error loading match.</div>
      {apiError && <div className="text-xs text-gray-500">{apiError}</div>}
    </div>
  );

  const match = data.fixture;
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(match.fixture?.status?.short);
  const isNotStarted = match.fixture?.status?.short === 'NS';
  const stats = data.statistics || [];
  
  const homeStats = stats.find((s: any) => s.team.id === match.teams.home.id)?.statistics || [];
  const awayStats = stats.find((s: any) => s.team.id === match.teams.away.id)?.statistics || [];
  
  const getStat = (arr: any[], type: string) => arr.find((s: any) => s.type === type)?.value ?? 0;

  const statTypes = [
    "Ball Possession", "Total Shots", "Shots on Goal", 
    "Corner Kicks", "Fouls", "Yellow Cards", "Red Cards"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-1 rounded-b-lg text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          {match.league.name}
        </div>
        <div className="flex justify-center items-center gap-4 md:gap-12 mt-4">
          <div className="flex flex-col items-center gap-3 flex-1">
            <Image src={match.teams.home.logo} alt={match.teams.home.name} width={80} height={80} className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg" />
            <span className="font-bold text-lg md:text-xl text-gray-100">{match.teams.home.name}</span>
          </div>
          <div className="flex flex-col items-center w-24 flex-shrink-0">
            {isLive ? (
              <div className="flex items-center gap-1.5 mb-2 bg-live-green/10 text-live-green px-2 py-0.5 rounded-full border border-live-green/20">
                <span className="w-1.5 h-1.5 bg-live-green rounded-full animate-pulse-dot"></span>
                <span className="font-bold text-xs">
                  {match.fixture.status.elapsed && parseInt(match.fixture.status.elapsed) > 0 
                    ? `${match.fixture.status.elapsed}'` 
                    : match.fixture.status.short}
                </span>
              </div>
            ) : isNotStarted ? (
              <div className="text-gray-400 font-bold text-xs mb-2">
                {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : (
              <div className="text-gray-500 font-bold text-xs mb-2 bg-gray-800 px-2 py-0.5 rounded-full">{match.fixture.status.short}</div>
            )}
            <div className="text-3xl md:text-5xl font-black tracking-tighter bg-gray-950 px-4 py-2 md:px-6 md:py-3 rounded-2xl border border-gray-800 shadow-inner">
              {match.goals.home ?? '-'}<span className="mx-2 md:mx-3 text-gray-700/50">:</span>{match.goals.away ?? '-'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 flex-1">
            <Image src={match.teams.away.logo} alt={match.teams.away.name} width={80} height={80} className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg" />
            <span className="font-bold text-lg md:text-xl text-gray-100">{match.teams.away.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <AISummary matchId={id} />
          <KeyBattle matchId={id} />
          
          <div className="border border-gray-800/80 rounded-2xl p-5 bg-gray-900/30 hidden md:block">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span>📋</span> Lineups
            </h3>
            {data.lineups.length > 0 ? (
              <div className="space-y-6">
                {data.lineups.map((lineup: any, i: number) => (
                  <div key={i}>
                    <div className="font-bold text-gray-200 mb-3 pb-2 border-b border-gray-800/50 flex justify-between">
                      <span>{lineup.team.name}</span>
                      <span className="text-gray-500 font-mono text-xs bg-gray-800 px-1.5 py-0.5 rounded">{lineup.formation}</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400">
                      {lineup.startXI.map((player: any, idx: number) => (
                        <li key={idx} className="flex gap-3 items-center group">
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-800/50 text-gray-500 rounded text-xs group-hover:bg-gray-700 transition">
                            {player.player.number}
                          </span>
                          <span className="group-hover:text-gray-200 transition">{player.player.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600 text-sm italic">Lineups not available</div>
            )}
          </div>
        </div>

        <div className="col-span-1 border border-gray-800/80 rounded-2xl p-5 bg-gray-900/30">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span>⏱️</span> Match Events
          </h3>
          <EventTimeline events={data.events} />
        </div>

        <div className="col-span-1 border border-gray-800/80 rounded-2xl p-5 bg-gray-900/30 flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span>📊</span> Match Stats
          </h3>
          {homeStats.length > 0 ? (
           <div className="space-y-2">
            {statTypes.map(type => (
              <StatBar 
                key={type} 
                label={type === "Ball Possession" ? "Possession" : type} 
                homeTotal={getStat(homeStats, type)} 
                awayTotal={getStat(awayStats, type)} 
              />
            ))}
           </div>
          ) : (
            <div className="text-gray-600 text-sm text-center py-10 italic flex-1 flex items-center justify-center border border-gray-800/50 border-dashed rounded-xl">
              Stats will appear during the match
            </div>
          )}
        </div>
      </div>

      {data.injuries.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🏥</span> Match Injuries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.injuries.map((injury: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 bg-white/5 dark:bg-black/20 p-3 rounded-xl border border-white/10 dark:border-white/5">
                <div className="relative">
                  <Image src={injury.player.photo} width={40} height={40} className="w-10 h-10 rounded-full border border-gray-800" alt="" />
                  <span className="absolute -bottom-1 -right-1 text-xs">⚠️</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-200">{injury.player.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold flex gap-2">
                    <span>{injury.team.name}</span>
                    <span className="text-red-400">{injury.player.type || 'Injured'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isNotStarted && <PredictionPanel fixtureId={id} />}
      {!isNotStarted && ['FT', 'AET', 'PEN'].includes(match.fixture?.status?.short) && <MatchAnalysis matchData={data} />}
    </div>
  );
}
