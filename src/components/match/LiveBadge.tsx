export function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-gray-900 border border-gray-800">
      <div className="relative flex h-2 w-2">
        <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-live-green"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-live-green"></span>
      </div>
      <span className="text-xs font-bold text-live-green tracking-wider">LIVE</span>
    </div>
  );
}
