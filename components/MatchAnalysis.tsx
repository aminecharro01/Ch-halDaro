"use client";
import { useEffect, useState } from 'react';

export function MatchAnalysis({ matchData }: { matchData: any }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchData?.fixture) return;

    if (!['FT', 'AET', 'PEN'].includes(matchData.fixture.status.short)) {
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      const cached = localStorage.getItem(`analysis_${matchData.fixture.id}`);
      if (cached) {
        setAnalysis(cached);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId: matchData.fixture.id,
            homeTeam: matchData.fixture.teams?.home?.name,
            awayTeam: matchData.fixture.teams?.away?.name,
            score: `${matchData.fixture.goals?.home}-${matchData.fixture.goals?.away}`,
            events: matchData.events,
            stats: matchData.statistics
          })
        });
        const data = await res.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
          localStorage.setItem(`analysis_${matchData.fixture.id}`, data.analysis);
        }
      } catch (err) {
        console.error("Analysis failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [matchData]);

  if (!matchData?.fixture || !['FT', 'AET', 'PEN'].includes(matchData.fixture.status.short)) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 to-blue-900/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden mt-6 animate-fade-up">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-100">
        <span className="text-indigo-400">📊</span> Match Insights
      </h3>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-3 bg-indigo-900/50 rounded w-full"></div>
          <div className="h-3 bg-indigo-900/50 rounded w-[90%]"></div>
          <div className="h-3 bg-indigo-900/50 rounded w-[80%]"></div>
        </div>
      ) : analysis ? (
        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</div>
      ) : (
        <div className="text-gray-500 text-sm">Insights unavailable.</div>
      )}
    </div>
  );
}
