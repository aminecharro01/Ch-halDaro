"use client";
import useSWR from 'swr';
import { Swords } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/PageLoader';
import { matchVisitHeaders } from '@/lib/match-visit-tracker';

const fetcher = (url: string, headers?: HeadersInit) =>
  fetch(url, { headers }).then((res) => res.json());

export function KeyBattle({ matchId, enabled = true }: { matchId: string; enabled?: boolean }) {
  const { data, isLoading } = useSWR(
    enabled ? `/api/match/${matchId}/key-battle` : null,
    (url: string) => fetcher(url, matchVisitHeaders(matchId))
  );

  if (!enabled) return null;

  if (isLoading) {
    return (
      <div className="bg-gray-900/40 border border-amber-500/20 rounded-3xl p-6 space-y-3">
        <LoadingSkeleton className="h-4 w-32" />
        <LoadingSkeleton className="h-3 w-full" />
        <LoadingSkeleton className="h-3 w-4/5" />
      </div>
    );
  }

  if (!data?.analysis || data.skipped) return null;

  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
      <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Swords className="w-4 h-4" />
        Le Duel Clé
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed">{data.analysis}</p>
    </div>
  );
}
