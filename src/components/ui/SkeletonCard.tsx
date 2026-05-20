export function SkeletonMatchCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="h-3 w-20 animate-shimmer rounded" />
        <div className="h-3 w-10 animate-shimmer rounded" />
      </div>
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 animate-shimmer rounded-full mb-2" />
          <div className="h-3 w-16 animate-shimmer rounded" />
        </div>
        <div className="h-6 w-12 animate-shimmer rounded" />
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 animate-shimmer rounded-full mb-2" />
          <div className="h-3 w-16 animate-shimmer rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatBar() {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <div className="h-3 w-10 animate-shimmer rounded" />
        <div className="h-3 w-20 animate-shimmer rounded" />
        <div className="h-3 w-10 animate-shimmer rounded" />
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full flex overflow-hidden">
        <div className="h-full w-1/3 animate-shimmer" />
        <div className="h-full w-1/3 bg-transparent" />
        <div className="h-full w-1/3 animate-shimmer" />
      </div>
    </div>
  );
}
