"use client";
import useSWR from 'swr';
import { Swords } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function KeyBattle({ matchId }: { matchId: string }) {
  const { data, isLoading } = useSWR(`/api/match/${matchId}/key-battle`, fetcher);

  if (isLoading) return (
    <div className="bg-gray-900/40 border border-amber-500/20 rounded-3xl p-6 animate-pulse">
      <div className="h-4 w-32 bg-amber-500/20 rounded mb-4"></div>
      <div className="h-3 w-full bg-amber-500/10 rounded"></div>
    </div>
  );

  if (!data?.analysis) return null;

  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
      <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Swords className="w-4 h-4" />
        Le Duel Clé
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        {data.analysis}
      </p>
    </div>
  );
}
