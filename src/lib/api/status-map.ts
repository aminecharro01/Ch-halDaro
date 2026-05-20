/** Maps TheSportsDB strStatus values to short codes used in the UI. */
export const STATUS_MAP: Record<string, string> = {
  'Not Started': 'NS',
  NS: 'NS',
  TBD: 'TBD',
  'First Half': '1H',
  '1H': '1H',
  Halftime: 'HT',
  HT: 'HT',
  'Second Half': '2H',
  '2H': '2H',
  'Extra Time': 'ET',
  ET: 'ET',
  Penalties: 'P',
  P: 'P',
  'Match Finished': 'FT',
  FT: 'FT',
  'After Extra Time': 'AET',
  AET: 'AET',
  'After Penalties': 'PEN',
  PEN: 'PEN',
  Postponed: 'PST',
  PST: 'PST',
  Cancelled: 'CANC',
  CANC: 'CANC',
  Abandoned: 'ABD',
  ABD: 'ABD',
  Live: 'LIVE',
  LIVE: 'LIVE',
};

export const LIVE_STATUS_CODES = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'];
export const FINISHED_STATUS_CODES = ['FT', 'AET', 'PEN'];

export function mapMatchStatus(strStatus: string | null | undefined): string {
  if (!strStatus) return 'NS';
  const trimmed = strStatus.trim();
  if (STATUS_MAP[trimmed]) return STATUS_MAP[trimmed];

  // Provider sometimes sends minute as status (e.g. "90", "67")
  if (/^\d+$/.test(trimmed)) {
    const min = parseInt(trimmed, 10);
    if (min >= 90) return 'FT';
    if (min > 45) return '2H';
    if (min > 0) return '1H';
    return 'NS';
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes('first') && lower.includes('half')) return '1H';
  if (lower.includes('second') && lower.includes('half')) return '2H';
  if (lower.includes('half') && lower.includes('time')) return 'HT';
  if (lower.includes('finished') || lower === 'ft' || lower.includes('full time')) return 'FT';
  if (lower.includes('not started')) return 'NS';
  if (lower.includes('extra time')) return 'ET';
  if (lower.includes('penalt')) return 'PEN';
  // Only treat as live when explicitly in progress, not generic "live" on old events
  if (lower === 'live' || lower === 'in progress' || lower === 'playing') return 'LIVE';
  return trimmed;
}
