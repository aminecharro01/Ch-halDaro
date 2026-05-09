"use client";
import useSWR from 'swr';
import { Sparkles } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AISummary({ matchId }: { matchId: string }) {
  const { data, isLoading } = useSWR(`/api/match/${matchId}/summary`, fetcher);

  if (isLoading) return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/20 rounded-3xl p-6 animate-pulse">
      <div className="h-4 w-32 bg-indigo-500/20 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-indigo-500/10 rounded"></div>
        <div className="h-3 w-5/6 bg-indigo-500/10 rounded"></div>
      </div>
    </div>
  );

  if (!data?.summary) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-16 h-16 text-indigo-400" />
      </div>
      <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Résumé IA (Gemini)
      </h3>
      <p className="text-gray-200 leading-relaxed font-medium italic">
        "{data.summary}"
      </p>
    </div>
  );
}
