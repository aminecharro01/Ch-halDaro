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
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md shadow-lg border border-white/60 dark:border-gray-800/60 rounded-2xl p-6 mt-6">
      <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
        <span>🔮</span> Pre-match Prediction
      </h4>
      <p className="text-slate-800 dark:text-gray-200 text-sm mb-6 bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-white/50 dark:border-gray-700/50 border-l-4 border-l-blue-500">
        {advice}
      </p>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-green-600 dark:text-live-green font-bold flex items-center gap-1">Home <span className="bg-green-100 dark:bg-live-green/20 px-1.5 rounded">{percent.home}</span></span>
            <span className="text-slate-500 font-medium">Draw {percent.draw}</span>
            <span className="text-blue-600 dark:text-blue-500 font-bold flex items-center gap-1"><span className="bg-blue-100 dark:bg-blue-500/20 px-1.5 rounded">{percent.away}</span> Away</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex shadow-inner bg-slate-200 dark:bg-slate-800">
            <div className="bg-green-500 h-full" style={{ width: percent.home }}></div>
            <div className="bg-slate-400 dark:bg-gray-600 h-full" style={{ width: percent.draw }}></div>
            <div className="bg-blue-500 h-full" style={{ width: percent.away }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="bg-white/50 dark:bg-gray-900/50 p-4 rounded-xl border border-white/50 dark:border-gray-800/50 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-gray-400 block mb-3 font-semibold uppercase tracking-wider">Home Form</span>
          <div className="flex gap-2">
            {(pred.teams.home.league.form || '').slice(-5).split('').map((f: string, i: number) => (
              <span key={i} className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-sm ${f === 'W' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-live-green/20 dark:text-live-green dark:border-live-green/30' : f === 'D' ? 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-gray-700 dark:text-white dark:border-gray-600' : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-500 dark:border-red-500/30'}`}>{f}</span>
            ))}
          </div>
        </div>
        <div className="bg-white/50 dark:bg-gray-900/50 p-4 rounded-xl border border-white/50 dark:border-gray-800/50 flex flex-col items-end shadow-sm">
          <span className="text-xs text-slate-500 dark:text-gray-400 block mb-3 font-semibold uppercase tracking-wider">Away Form</span>
          <div className="flex gap-2">
            {(pred.teams.away.league.form || '').slice(-5).split('').map((f: string, i: number) => (
              <span key={i} className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-sm ${f === 'W' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-live-green/20 dark:text-live-green dark:border-live-green/30' : f === 'D' ? 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-gray-700 dark:text-white dark:border-gray-600' : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-500 dark:border-red-500/30'}`}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
