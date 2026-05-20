/** Default football season (Aug–May) for 2025–26. */
export const DEFAULT_SEASON = '2025-2026';

const CURRENT_SEASON_ALIASES = new Set([
  DEFAULT_SEASON,
  '2025-26',
  '2025/2026',
  '2025/26',
]);

/** True when an API season string belongs to the current campaign. */
export function isCurrentSeason(season: string | null | undefined): boolean {
  if (!season) return false;
  const normalized = season.trim().replace(/\//g, '-');
  if (CURRENT_SEASON_ALIASES.has(season.trim()) || CURRENT_SEASON_ALIASES.has(normalized)) {
    return true;
  }
  return normalized.startsWith('2025') && /2026|26/.test(normalized);
}

/** Keep matches from the current season; if none tagged, keep all (API often omits strSeason). */
export function filterCurrentSeasonMatches<T extends { fixture?: { season?: string | null } }>(
  matches: T[]
): T[] {
  const tagged = matches.filter((m) => m.fixture?.season);
  if (tagged.length === 0) return matches;
  const current = tagged.filter((m) => isCurrentSeason(m.fixture?.season));
  return current.length > 0 ? current : matches;
}

/** Pick the best season string from API list (prefers current campaign). */
export function pickCurrentSeason(seasons: string[]): string {
  const list = seasons.filter(Boolean);
  if (list.includes(DEFAULT_SEASON)) return DEFAULT_SEASON;
  if (list.includes('2025-26')) return '2025-26';

  const normalized = list
    .map((s) => ({ raw: s, sort: seasonSortKey(s) }))
    .sort((a, b) => b.sort - a.sort);

  return normalized[0]?.raw || DEFAULT_SEASON;
}

function seasonSortKey(season: string): number {
  const m = season.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : 0;
}
