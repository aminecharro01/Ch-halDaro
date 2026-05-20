"use client";
import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/PageLoader';
import { matchVisitHeaders, hasVisitedMatch } from '@/lib/match-visit-tracker';

type MatchBundle = {
  fixture: {
    fixture: { id: number; status: { short: string } };
    teams: { home: { name: string }; away: { name: string } };
    goals: { home: number; away: number };
  };
  events: unknown[];
  statistics: unknown[];
};

export function MatchAnalysis({ matchId, matchData }: { matchId: string; matchData: MatchBundle }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const m = matchData.fixture;
  const statusShort = m?.fixture?.status?.short;

  useEffect(() => {
    if (!m?.fixture?.id) return;

    if (!['FT', 'AET', 'PEN'].includes(statusShort)) {
      setLoading(false);
      return;
    }

    if (!hasVisitedMatch(matchId)) {
      setLoading(false);
      return;
    }

    const cacheKey = `analysis_${m.fixture.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAnalysis(cached);
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...matchVisitHeaders(matchId),
          },
          body: JSON.stringify({
            homeTeam: m.teams.home.name,
            awayTeam: m.teams.away.name,
            score: `${m.goals.home}-${m.goals.away}`,
            events: matchData.events,
            statistics: matchData.statistics,
          }),
        });
        const data = await res.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
          localStorage.setItem(cacheKey, data.analysis);
        }
      } catch (err) {
        console.error('Analysis failed', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalysis();
  }, [matchData, m, statusShort, matchId]);

  if (!m?.fixture?.id || !['FT', 'AET', 'PEN'].includes(statusShort)) return null;

  if (!hasVisitedMatch(matchId)) {
    return (
      <p className="text-gray-500 text-sm mt-4">
        Rechargez la page du match pour afficher l’analyse complète.
      </p>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 to-blue-900/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden mt-6 animate-fade-up">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-100">
        <BarChart3 className="w-5 h-5 text-indigo-400" /> Match Insights
      </h3>
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-3 w-full" />
          <LoadingSkeleton className="h-3 w-[90%]" />
          <LoadingSkeleton className="h-3 w-[80%]" />
        </div>
      ) : analysis ? (
        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</div>
      ) : (
        <div className="text-gray-500 text-sm">Insights unavailable.</div>
      )}
    </div>
  );
}
