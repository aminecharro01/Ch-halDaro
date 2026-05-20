/** League IDs grouped by region (TheSportsDB). */
export const REGION_LEAGUES: Record<
  string,
  { id: string; name: string; country: string }[]
> = {
  europe: [
    { id: '4328', name: 'English Premier League', country: 'England' },
    { id: '4335', name: 'Spanish La Liga', country: 'Spain' },
    { id: '4332', name: 'Italian Serie A', country: 'Italy' },
    { id: '4331', name: 'German Bundesliga', country: 'Germany' },
    { id: '4334', name: 'French Ligue 1', country: 'France' },
    { id: '4480', name: 'UEFA Champions League', country: 'Europe' },
  ],
  'south-america': [
    { id: '4351', name: 'Brazilian Serie A', country: 'Brazil' },
    { id: '4367', name: 'Argentine Primera División', country: 'Argentina' },
  ],
  africa: [{ id: '4520', name: 'Botola Pro', country: 'Morocco' }],
  asia: [
    { id: '4350', name: 'Chinese Super League', country: 'China' },
    { id: '4359', name: 'Saudi Pro League', country: 'Saudi Arabia' },
  ],
};
