"use client";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PredictionPanel({ fixtureId }: { fixtureId: string | number }) {
  const { data, error, isLoading } = useSWR(`/api/predictions/${fixtureId}`, fetcher);

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-900 rounded-xl mt-6"></div>;
  if (error || !data || data.length === 0) return null;

  const pred = data[0];
  const { percent, win_or_draw, advice } = pred.predictions;
  
  return (
    <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-5 mt-6">
      <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
        <span>🔮</span> Pre-match Prediction
      </h4>
      <p className="text-gray-200 text-sm mb-5 bg-gray-800/30 p-3 rounded-lg border border-gray-800 border-l-4 border-l-blue-500">
        {advice}
      </p>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-live-green font-bold flex items-center gap-1">Home <span className="bg-live-green/20 px-1 rounded">{percent.home}</span></span>
            <span className="text-gray-500">Draw {percent.draw}</span>
            <span className="text-blue-500 font-bold flex items-center gap-1"><span className="bg-blue-500/20 px-1 rounded">{percent.away}</span> Away</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-live-green h-full" style={{ width: percent.home }}></div>
            <div className="bg-gray-600 h-full" style={{ width: percent.draw }}></div>
            <div className="bg-blue-500 h-full" style={{ width: percent.away }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800/50">
          <span className="text-xs text-gray-500 block mb-2 font-medium">Home Form</span>
          <div className="flex gap-1.5">
            {(pred.teams.home.league.form || '').slice(-5).split('').map((f: string, i: number) => (
              <span key={i} className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${f === 'W' ? 'bg-live-green/20 text-live-green border border-live-green/30' : f === 'D' ? 'bg-gray-700 text-white border border-gray-600' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>{f}</span>
            ))}
          </div>
        </div>
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800/50 flex flex-col items-end">
          <span className="text-xs text-gray-500 block mb-2 font-medium">Away Form</span>
          <div className="flex gap-1.5">
            {(pred.teams.away.league.form || '').slice(-5).split('').map((f: string, i: number) => (
              <span key={i} className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${f === 'W' ? 'bg-live-green/20 text-live-green border border-live-green/30' : f === 'D' ? 'bg-gray-700 text-white border border-gray-600' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
