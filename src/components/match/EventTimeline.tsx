import { Goal, Square, RefreshCw, Monitor, Circle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TimelineEvent = {
  id?: string | number;
  minute: number;
  type: string;
  team: 'home' | 'away' | string;
  player: string;
  assist?: string | null;
  detail?: string;
};

function eventIcon(type: string, detail?: string): { Icon: LucideIcon; className: string } {
  const t = type.toLowerCase();
  if (t === 'goal') return { Icon: Goal, className: 'text-green-400' };
  if (t.includes('yellow')) return { Icon: Square, className: 'text-yellow-400 fill-yellow-400' };
  if (t.includes('red')) return { Icon: Square, className: 'text-red-500 fill-red-500' };
  if (t.includes('subst')) return { Icon: RefreshCw, className: 'text-blue-400' };
  if (t.includes('var')) return { Icon: Monitor, className: 'text-purple-400' };
  if (detail?.toLowerCase().includes('red')) return { Icon: Square, className: 'text-red-500 fill-red-500' };
  if (detail?.toLowerCase().includes('yellow')) return { Icon: Square, className: 'text-yellow-400 fill-yellow-400' };
  return { Icon: Circle, className: 'text-gray-400' };
}

function teamLabel(team: string, homeName?: string, awayName?: string) {
  if (team === 'home') return homeName || 'Home';
  if (team === 'away') return awayName || 'Away';
  return team;
}

export function EventTimeline({
  events,
  homeName,
  awayName,
}: {
  events: TimelineEvent[];
  homeName?: string;
  awayName?: string;
}) {
  if (!events?.length) {
    return <div className="text-gray-500 text-center py-4">No events yet</div>;
  }

  const sorted = [...events].sort((a, b) => (b.minute || 0) - (a.minute || 0));

  return (
    <div className="relative border-l-2 border-white/5 ml-4 space-y-6 pb-4">
      {sorted.map((event, idx) => {
        const { Icon, className } = eventIcon(event.type, event.detail);
        return (
          <div key={event.id ?? idx} className="relative pl-6">
            <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-black border-2 border-white/10 flex items-center justify-center z-10">
              <Icon className={`w-3 h-3 ${className}`} />
            </span>
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 animate-fade-up hover:bg-white/[0.05] transition-all group">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span>{event.minute}&apos;</span>
                <span className="w-1 h-1 bg-white/10 rounded-full" />
                <span className="text-white/40">{teamLabel(event.team, homeName, awayName)}</span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                {event.player}
                {event.detail ? (
                  <span className="text-white/30 text-xs font-medium ml-2">{event.detail}</span>
                ) : null}
              </div>
              {event.assist ? (
                <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <span className="opacity-50">Assist:</span>
                  <span className="text-gray-400 font-semibold">{event.assist}</span>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
