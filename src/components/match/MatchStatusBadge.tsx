'use client';

import { getMatchStatusDisplay, type MatchLike } from '@/lib/match-status';

export function MatchStatusBadge({
  match,
  variant = 'card',
}: {
  match: MatchLike;
  variant?: 'card' | 'hero';
}) {
  const { label, heroLabel, showLivePulse, phase } = getMatchStatusDisplay(match);
  const text = variant === 'hero' ? heroLabel : label;

  if (phase === 'live' && showLivePulse) {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-live-green" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-live-green" />
        </span>
        <span className="text-xs text-live-green font-bold tabular-nums">{text}</span>
      </div>
    );
  }

  if (phase === 'finished') {
    return <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{text}</span>;
  }

  if (phase === 'upcoming') {
    return <span className="text-xs font-bold text-blue-400 tabular-nums">{text}</span>;
  }

  return <span className="text-xs font-bold text-gray-400">{text}</span>;
}
