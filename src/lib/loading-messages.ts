export type LoadingContext = 'scores' | 'match' | 'league' | 'team' | 'region' | 'summary';

export const LOADING_MESSAGES: Record<LoadingContext, string[]> = {
  scores: [
    'Kickoff incoming…',
    'Scanning every pitch on the planet',
    'The ref is checking his watch',
    'Warm-up laps around the globe',
    'Today\'s fixtures are lining up',
    'Ball is rolling — stand by',
  ],
  match: [
    'Building the tunnel walk',
    'Tactics board coming up',
    'VAR is rewinding the tape',
    'Lineups almost locked in',
    'Stadium lights turning on',
    'Kickoff vibes loading',
  ],
  league: [
    'Title race data incoming',
    'Reading the league table',
    'Top scorers on their way',
    'Promotion drama loading',
    'Relegation zone on alert',
    'Standings being calculated',
  ],
  team: [
    'Scouting the squad',
    'Form guide incoming',
    'Club crest getting polished',
    'Recent results loading',
    'Tactical setup on the way',
    'Squad depth being checked',
  ],
  region: [
    'Mapping football territories',
    'Local leagues loading',
    'Finding derbies near you',
    'Exploring the region\'s pitches',
    'Football map unfolding',
  ],
  summary: [
    'Rewinding the highlights',
    'Commentary booth warming up',
    'Full-time whistle processing',
    'Match story being written',
    'Best moments compiling',
  ],
};

export function pickLoadingMessage(context: LoadingContext): string {
  const messages = LOADING_MESSAGES[context];
  return messages[Math.floor(Math.random() * messages.length)];
}
