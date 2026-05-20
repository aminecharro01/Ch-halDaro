import { normalizeMatch } from '@/lib/api/normalizers';

function asEventArray(raw: unknown): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const o = raw as Record<string, unknown>;
  return (Array.isArray(o.results) ? o.results : Array.isArray(o.events) ? o.events : []) as any[];
}

function eventTeamIds(ev: Record<string, unknown>): { hid: number; aid: number; eid: number } {
  const hid = parseInt(String(ev.idHomeTeam ?? ev.idHome ?? ev.home_id ?? ''), 10);
  const aid = parseInt(String(ev.idAwayTeam ?? ev.idAway ?? ev.away_id ?? ''), 10);
  const eid = parseInt(String(ev.idEvent ?? ev.idMatch ?? ev.id ?? ''), 10);
  return { hid, aid, eid };
}

function isFinishedEvent(ev: Record<string, unknown>): boolean {
  const status = String(ev.strStatus ?? ev.strProgress ?? '').toUpperCase();
  if (!status) return true;
  return ['FT', 'AET', 'PEN', 'FINISHED', 'FULL TIME', 'MATCH FINISHED'].some((s) => status.includes(s));
}

/** Past meetings between two clubs (excludes current event). */
export function extractHeadToHead(
  homePast: unknown,
  awayPast: unknown,
  homeTeamId: number,
  awayTeamId: number,
  currentEventId: number,
  limit = 10
) {
  if (!homeTeamId || !awayTeamId) return [];
  const merged = [...asEventArray(homePast), ...asEventArray(awayPast)];
  const seen = new Set<string>();
  const h2h: any[] = [];

  for (const ev of merged) {
    if (!ev || typeof ev !== 'object') continue;
    const { hid, aid, eid } = eventTeamIds(ev as Record<string, unknown>);
    if (!eid || Number.isNaN(eid) || eid === currentEventId) continue;
    if (!isFinishedEvent(ev as Record<string, unknown>)) continue;
    const isPair =
      (hid === homeTeamId && aid === awayTeamId) || (hid === awayTeamId && aid === homeTeamId);
    if (!isPair) continue;
    const key = String(eid);
    if (seen.has(key)) continue;
    seen.add(key);
    h2h.push(ev);
  }

  h2h.sort((a, b) => {
    const da = String(a.dateEvent || a.date || '');
    const db = String(b.dateEvent || b.date || '');
    return db.localeCompare(da);
  });

  return h2h
    .slice(0, limit)
    .map((e) => normalizeMatch(e))
    .filter((m) => m != null);
}
