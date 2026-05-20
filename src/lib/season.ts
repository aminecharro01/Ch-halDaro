/** Default football season (Aug–May) for 2025–26. */
export const DEFAULT_SEASON = '2025-2026';

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
