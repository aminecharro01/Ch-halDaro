export function StatBar({ label, homeTotal, awayTotal }: { label: string; homeTotal: number | string; awayTotal: number | string }) {
  // Convert "%" string to number if needed (e.g. possession)
  const h = typeof homeTotal === 'string' ? parseInt(homeTotal.replace('%',''), 10) : homeTotal;
  const a = typeof awayTotal === 'string' ? parseInt(awayTotal.replace('%',''), 10) : awayTotal;
  
  const t = (h || 0) + (a || 0);
  const homePct = t === 0 ? 50 : Math.round(((h || 0) / t) * 100);
  const awayPct = t === 0 ? 50 : 100 - homePct;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5 font-medium">
        <span className="text-white">{homeTotal ?? 0}</span>
        <span className="text-gray-500 uppercase tracking-wide text-[10px]">{label}</span>
        <span className="text-white">{awayTotal ?? 0}</span>
      </div>
      <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden flex">
        <div className="bg-white h-full transition-all duration-1000" style={{ width: `${homePct}%` }}></div>
        <div className="bg-gray-700 h-full transition-all duration-1000" style={{ width: `${awayPct}%` }}></div>
      </div>
    </div>
  );
}
