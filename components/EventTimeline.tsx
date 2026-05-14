export function EventTimeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) return <div className="text-gray-500 text-center py-4">No events yet</div>;

  return (
    <div className="relative border-l-2 border-white/5 ml-4 space-y-6 pb-4">
      {events.map((event, idx) => (
        <div key={idx} className="relative pl-6">
          <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-black border-2 border-white/10 flex items-center justify-center text-[10px] z-10">
            {event.type === 'Goal' ? '⚽' : 
             event.type?.toLowerCase().includes('card') ? (event.detail?.toLowerCase().includes('red') ? '🟥' : '🟨') :
             event.type?.toLowerCase().includes('subst') ? '🔄' : 
             event.type?.toLowerCase().includes('var') ? '📺' : '🔹'}
          </span>
          <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 animate-fade-up hover:bg-white/[0.05] transition-all group">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span>{event.time.elapsed}'</span>
              <span className="w-1 h-1 bg-white/10 rounded-full"></span>
              <span className="text-white/40">{event.team.name}</span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              {event.player.name}
              <span className="text-white/30 text-xs font-medium ml-2">{event.detail}</span>
            </div>
            {event.assist?.name && (
              <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                <span className="opacity-50">Assist:</span>
                <span className="text-gray-400 font-semibold">{event.assist.name}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
