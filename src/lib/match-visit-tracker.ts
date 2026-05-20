const STORAGE_KEY = 'chhal_visited_matches';
const MAX_STORED = 50;

export function markMatchVisited(matchId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [String(matchId), ...list.filter((id) => id !== String(matchId))].slice(0, MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([String(matchId)]));
  }
}

export function hasVisitedMatch(matchId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(String(matchId));
  } catch {
    return false;
  }
}

export function matchVisitHeaders(matchId: string): HeadersInit {
  return hasVisitedMatch(matchId) ? { 'X-Match-Visited': '1' } : {};
}
