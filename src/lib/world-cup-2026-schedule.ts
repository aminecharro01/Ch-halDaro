/**
 * FIFA World Cup 2026 structure (from official schedule v17, Apr 2026).
 * Match details enriched at runtime via TheSportsDB league 4429.
 */

export const WC_LEAGUE_ID = '4429';
export const WC_SEASON = '2026';

export type WcPhase =
  | 'group'
  | 'round32'
  | 'round16'
  | 'quarter'
  | 'semi'
  | 'third'
  | 'final';

export type WcScheduleGroup = {
  id: string;
  label: string;
  teams: string[];
};

/** 12 groups × 4 teams (48-team format). */
export const WC_GROUPS: WcScheduleGroup[] = [
  { id: 'A', label: 'Group A', teams: ['Mexico', 'South Africa', 'South Korea', 'TBD'] },
  { id: 'B', label: 'Group B', teams: ['Canada', 'Qatar', 'Switzerland', 'TBD'] },
  { id: 'C', label: 'Group C', teams: ['Brazil', 'Morocco', 'Haiti', 'Scotland'] },
  { id: 'D', label: 'Group D', teams: ['USA', 'Paraguay', 'Australia', 'TBD'] },
  { id: 'E', label: 'Group E', teams: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'] },
  { id: 'F', label: 'Group F', teams: ['Netherlands', 'Japan', 'Tunisia', 'TBD'] },
  { id: 'G', label: 'Group G', teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'] },
  { id: 'H', label: 'Group H', teams: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'] },
  { id: 'I', label: 'Group I', teams: ['France', 'Senegal', 'Iraq', 'Norway'] },
  { id: 'J', label: 'Group J', teams: ['Argentina', 'Algeria', 'Austria', 'Jordan'] },
  { id: 'K', label: 'Group K', teams: ['Portugal', 'Colombia', 'Uzbekistan', 'TBD'] },
  { id: 'L', label: 'Group L', teams: ['England', 'Croatia', 'Ghana', 'Panama'] },
];

export const WC_KNOCKOUT_ROUNDS: { phase: WcPhase; label: string; dates: string }[] = [
  { phase: 'round32', label: 'Round of 32', dates: '28 Jun – 3 Jul 2026' },
  { phase: 'round16', label: 'Round of 16', dates: '4 – 7 Jul 2026' },
  { phase: 'quarter', label: 'Quarter-finals', dates: '9 – 11 Jul 2026' },
  { phase: 'semi', label: 'Semi-finals', dates: '14 – 15 Jul 2026' },
  { phase: 'third', label: 'Third place', dates: '18 Jul 2026' },
  { phase: 'final', label: 'Final', dates: '19 Jul 2026 · MetLife Stadium' },
];

export const WC_HOST_CITIES = [
  'Vancouver',
  'Seattle',
  'San Francisco Bay Area',
  'Los Angeles',
  'Guadalajara',
  'Mexico City',
  'Monterrey',
  'Houston',
  'Dallas',
  'Kansas City',
  'Atlanta',
  'Miami',
  'Toronto',
  'Boston',
  'New York / New Jersey',
  'Philadelphia',
];

export const WC_GROUP_STAGE_DATES = '11 – 27 June 2026';
