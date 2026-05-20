"use client";
import useSWR from 'swr';
import { use, useEffect } from 'react';
import { markMatchVisited } from '@/lib/match-visit-tracker';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Clock, RefreshCw } from 'lucide-react';
import { MatchDetailTabs } from '@/components/match/MatchDetailTabs';
import { getMatchStatusDisplay, isMatchLive } from '@/lib/match-status';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    if (id) markMatchVisited(id);
  }, [id]);

  const { data, error, isLoading, mutate, isValidating } = useSWR(`/api/match/${id}`, fetcher, {
    refreshInterval: (latest) => {
      if (!latest?.fixture) return 0;
      return isMatchLive(latest.fixture) ? 30000 : 0;
    },
    revalidateOnFocus: true,
  });

  const apiError = data?.error || error?.message;
  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-500 animate-pulse font-black uppercase tracking-widest">
        Gathering match data…
      </div>
    );
  }
  if (apiError || !data?.fixture) {
    return (
      <div className="text-center py-20 bg-red-950/20 border border-red-900/50 rounded-3xl">
        <div className="text-red-500 font-black mb-2 uppercase tracking-tight">Match data unreachable</div>
        {apiError && <div className="text-xs text-red-400/70 font-mono">{apiError}</div>}
      </div>
    );
  }

  const match = data.fixture;
  const media = data.media || {};
  const status = getMatchStatusDisplay(match);
  const isLive = status.phase === 'live';
  const isFinished = status.phase === 'finished';
  const isNotStarted = status.phase === 'upcoming';

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto">
      {/* Scoreboard hero — similar to LiveScore header */}
      <div className="relative overflow-hidden bg-black/50 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12">
        {media.strThumb && (
          <div className="absolute inset-0 z-0">
            <Image src={media.strThumb} alt="" fill className="object-cover opacity-15 blur-md scale-110" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
          </div>
        )}

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            href={`/league/${match.league.id}`}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white"
          >
            {match.league.logo && <img src={match.league.logo} className="w-5 h-5 object-contain" alt="" />}
            {match.league.name}
          </Link>
          <button
            type="button"
            onClick={() => void mutate()}
            disabled={isValidating}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="flex flex-col items-center gap-4 flex-1 min-w-0">
            <Image
              src={match.teams.home.logo}
              alt={match.teams.home.name}
              width={96}
              height={96}
              className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-lg"
            />
            <Link href={`/team/${match.teams.home.id}`} className="font-black text-lg md:text-2xl text-white text-center hover:text-blue-400 transition truncate max-w-[220px]">
              {match.teams.home.name}
            </Link>
          </div>

          <div className="flex flex-col items-center shrink-0">
            {isLive ? (
              <div className="flex items-center gap-2 mb-4 bg-red-600/20 text-red-400 px-4 py-2 rounded-full border border-red-500/30 text-[10px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {status.heroLabel}
              </div>
            ) : isFinished ? (
              <div className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{status.heroLabel}</div>
            ) : (
              <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                <Clock className="w-3.5 h-3.5" />
                {status.heroLabel}
              </div>
            )}
            <div className="flex items-center gap-6 md:gap-10">
              <span className="text-5xl md:text-7xl font-black text-white tabular-nums">{isNotStarted ? '–' : match.goals.home ?? 0}</span>
              <span className="text-2xl font-black text-white/20">:</span>
              <span className="text-5xl md:text-7xl font-black text-white tabular-nums">{isNotStarted ? '–' : match.goals.away ?? 0}</span>
            </div>
            {isNotStarted && match.fixture?.date && (
              <p className="mt-3 text-sm text-white/50 font-bold tabular-nums">
                {new Date(match.fixture.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · {status.label}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 flex-1 min-w-0">
            <Image
              src={match.teams.away.logo}
              alt={match.teams.away.name}
              width={96}
              height={96}
              className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-lg"
            />
            <Link href={`/team/${match.teams.away.id}`} className="font-black text-lg md:text-2xl text-white text-center hover:text-red-400 transition truncate max-w-[220px]">
              {match.teams.away.name}
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/45">
          {match.fixture?.venue?.name && (
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              {match.fixture.venue.name}
              {match.fixture.venue.city ? ` · ${match.fixture.venue.city}` : ''}
            </span>
          )}
          <span className="inline-flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Round {match.fixture?.status?.round ?? '—'}
          </span>
        </div>
      </div>

      <MatchDetailTabs matchId={id} data={data} />
    </div>
  );
}
