export function EventTimeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) return <div className="text-gray-500 text-center py-4">No events yet</div>;

  return (
    <div className="relative border-l-2 border-gray-800 ml-4 space-y-6 pb-4">
      {events.map((event, idx) => (
        <div key={idx} className="relative pl-6">
          <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-gray-950 border-2 border-gray-700 flex items-center justify-center text-[10px] z-10">
            {event.type === 'Goal' ? '⚽' : 
             event.type?.toLowerCase().includes('card') ? (event.detail?.toLowerCase().includes('red') ? '🟥' : '🟨') :
             event.type?.toLowerCase().includes('subst') ? '🔄' : 
             event.type?.toLowerCase().includes('var') ? '📺' : '🔹'}
          </span>
          <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800/50 animate-fade-up hover:bg-gray-800/50 transition">
            <div className="text-xs font-bold text-gray-500 mb-1">{event.time.elapsed}' <span className="text-gray-300">{event.team.name}</span></div>
            <div className="text-sm font-semibold text-gray-100">{event.player.name} <span className="text-gray-400 text-xs ml-1">{event.detail}</span></div>
            {event.assist?.name && <div className="text-xs text-gray-500 mt-1">Assist: {event.assist.name}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
