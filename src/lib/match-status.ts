import {
  FINISHED_STATUS_CODES,
  LIVE_STATUS_CODES,
  mapMatchStatus,
} from '@/lib/api/status-map';

export type MatchPhase = 'upcoming' | 'live' | 'finished' | 'postponed' | 'other';

export type MatchStatusDisplay = {
  phase: MatchPhase;
  /** Short label for cards (FT, 67', 15:30) */
  label: string;
  /** Longer label for hero (Full time, Live 67', Kick-off 15:30) */
  heroLabel: string;
  showLivePulse: boolean;
};

export type MatchLike = {
  fixture?: {
    date?: string;
    status?: { short?: string; long?: string; elapsed?: number };
  };
  goals?: { home?: number | null; away?: number | null };
};

const FINISHED_LONG = /finished|full\s*time|after\s+(extra|penalt)/i;
const POSTPONED_LONG = /postpon|cancel|abandon|suspend/i;

function kickoffMs(match: MatchLike): number {
  const d = match.fixture?.date;
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function hoursSinceKickoff(match: MatchLike): number {
  const k = kickoffMs(match);
  if (!k) return 0;
  return (Date.now() - k) / 3_600_000;
}

/** Reconcile API quirks (stale LIVE, numeric status, etc.). */
export function resolveMatchPhase(match: MatchLike): MatchPhase {
  const rawLong = match.fixture?.status?.long || '';
  const short = mapMatchStatus(rawLong || match.fixture?.status?.short);
  const elapsed = Number(match.fixture?.status?.elapsed) || 0;
  const hours = hoursSinceKickoff(match);

  if (POSTPONED_LONG.test(rawLong) || ['PST', 'CANC', 'ABD'].includes(short)) {
    return 'postponed';
  }

  if (FINISHED_STATUS_CODES.includes(short) || FINISHED_LONG.test(rawLong)) {
    return 'finished';
  }

  // Numeric minute-only status from provider (e.g. "90")
  if (/^\d+$/.test(String(match.fixture?.status?.short || '').trim())) {
    const min = parseInt(String(match.fixture?.status?.short), 10);
    if (min >= 90 || hours > 2) return 'finished';
    if (min > 0) return 'live';
  }

  if (elapsed >= 90 && hours > 1.5) return 'finished';

  const isLiveCode = LIVE_STATUS_CODES.includes(short) || short === 'LIVE';

  if (isLiveCode) {
    // Stale: still "Live" hours after kick-off
    if (hours > 2.5) return 'finished';
    return 'live';
  }

  if (short === 'NS' || short === 'TBD') {
    if (kickoffMs(match) > Date.now()) return 'upcoming';
    if (hours > 2.5) return 'finished';
    return 'upcoming';
  }

  if (kickoffMs(match) > Date.now()) return 'upcoming';

  if (['1H', '2H', 'HT', 'ET', 'P'].includes(short)) {
    if (hours > 2.5) return 'finished';
    return 'live';
  }

  if (hours > 3) return 'finished';

  return 'other';
}

function formatKickoffTime(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatElapsed(elapsed: number, short: string): string {
  if (elapsed > 0) return `${elapsed}'`;
  if (short === 'HT') return 'HT';
  if (short === 'ET') return 'ET';
  if (short === 'P') return 'PEN';
  return 'Live';
}

export function getMatchStatusDisplay(match: MatchLike): MatchStatusDisplay {
  const phase = resolveMatchPhase(match);
  const short = mapMatchStatus(match.fixture?.status?.long || match.fixture?.status?.short);
  const elapsed = Number(match.fixture?.status?.elapsed) || 0;
  const kickoff = formatKickoffTime(match.fixture?.date);

  switch (phase) {
    case 'finished':
      return {
        phase,
        label: 'FT',
        heroLabel: 'Full time',
        showLivePulse: false,
      };
    case 'upcoming':
      return {
        phase,
        label: kickoff,
        heroLabel: `Kick-off ${kickoff}`,
        showLivePulse: false,
      };
    case 'live': {
      const liveLabel = formatElapsed(elapsed, short);
      return {
        phase,
        label: liveLabel,
        heroLabel: `Live · ${liveLabel}`,
        showLivePulse: true,
      };
    }
    case 'postponed':
      return {
        phase,
        label: 'PPD',
        heroLabel: 'Postponed',
        showLivePulse: false,
      };
    default:
      return {
        phase,
        label: short || '—',
        heroLabel: short || '—',
        showLivePulse: false,
      };
  }
}

export function isMatchLive(match: MatchLike): boolean {
  return resolveMatchPhase(match) === 'live';
}

export function isMatchFinished(match: MatchLike): boolean {
  return resolveMatchPhase(match) === 'finished';
}
