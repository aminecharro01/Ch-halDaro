"use client";
import useSWR from 'swr';
import { LoadingSkeleton } from '@/components/ui/PageLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PredictionPanel({ fixtureId }: { fixtureId: string | number }) {
  const { data, error, isLoading } = useSWR(`/api/predictions/${fixtureId}`, fetcher);

  if (isLoading) return <LoadingSkeleton className="h-32 backdrop-blur rounded-xl mt-6 border border-white/5" />;
  if (error || !data || !Array.isArray(data) || data.length === 0 || !data[0].predictions) return null;

  const pred = data[0];
  const { percent, advice } = pred.predictions;
  
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 mt-6">
      <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
        <span>🔮</span> Pre-match Prediction
      </h4>
      <p className="text-gray-200 text-sm mb-6 bg-white/5 p-4 rounded-xl border border-white/10 border-l-4 border-l-blue-500">
        {advice}
      </p>
      
      <div className="space-y-4">
        <div>
          <div className="flex flex-wrap justify-between gap-2 text-xs mb-2">
            <span className="text-live-green font-bold flex items-center gap-1">Home <span className="bg-live-green/20 px-1.5 rounded">{percent.home}</span></span>
            <span className="text-gray-400 font-medium">Draw {percent.draw}</span>
            <span className="text-blue-400 font-bold flex items-center gap-1"><span className="bg-blue-500/20 px-1.5 rounded">{percent.away}</span> Away</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex shadow-inner bg-slate-800">
            <div className="bg-green-500 h-full" style={{ width: percent.home }}></div>
            <div className="bg-gray-600 h-full" style={{ width: percent.draw }}></div>
            <div className="bg-blue-500 h-full" style={{ width: percent.away }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <span className="text-xs text-gray-400 block mb-3 font-semibold uppercase tracking-wider">Home Form</span>
          <div className="flex flex-wrap gap-2">
            {(pred.teams.home.league.form || '').slice(-5).split('').map((f: string, i: number) => (
              <span key={i} className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${f === 'W' ? 'bg-live-green/20 text-live-green border border-live-green/30' : f === 'D' ? 'bg-gray-700 text-white border border-gray-600' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{f}</span>
            ))}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 sm:flex sm:flex-col sm:items-end">
          <span className="text-xs text-gray-400 block mb-3 font-semibold uppercase tracking-wider">Away Form</span>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {(pred.teams.away.league.form || '').slice(-5).split('').map((f: string, i: number) => (
              <span key={i} className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${f === 'W' ? 'bg-live-green/20 text-live-green border border-live-green/30' : f === 'D' ? 'bg-gray-700 text-white border border-gray-600' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
