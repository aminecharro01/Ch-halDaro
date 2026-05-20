export function ruleBasedMatchSummary(
  home: string,
  away: string,
  homeGoals: number,
  awayGoals: number,
  events: { minute?: number; type?: string; player?: string }[]
) {
  const goals = events.filter((e) => e.type === 'goal');
  const goalText =
    goals.length > 0
      ? goals.map((g) => `${g.minute}' ${g.player}`).join(', ')
      : 'aucun but enregistré';

  if (homeGoals > awayGoals) {
    return `${home} s'impose ${homeGoals}-${awayGoals} face à ${away}. Buts : ${goalText}.`;
  }
  if (awayGoals > homeGoals) {
    return `${away} l'emporte ${awayGoals}-${homeGoals} à l'extérieur. Buts : ${goalText}.`;
  }
  return `Match nul ${homeGoals}-${awayGoals} entre ${home} et ${away}. Buts : ${goalText}.`;
}

export function isQuotaExceeded(error: unknown): boolean {
  const err = error as { status?: number; message?: string };
  return err.status === 429 || String(err.message || '').includes('429') || String(err.message || '').includes('quota');
}

export function requireVisitedMatch(request: Request): boolean {
  return request.headers.get('x-match-visited') === '1';
}

export function ruleBasedKeyBattle(home: string, away: string) {
  return `Le duel clé oppose les moteurs offensifs de ${home} aux leviers défensifs de ${away}. La domination au milieu et la gestion des transitions devraient peser sur le résultat.`;
}

export function ruleBasedAnalysis(home: string, away: string, score: string) {
  return `${home} et ${away} se sont affrontés pour un score final de ${score}. Le match a offert des phases distinctes où la possession et les occasions ont fait pencher la balance.`;
}

export function ruleBasedPrediction(home: string, away: string) {
  return {
    percent: { home: '40%', draw: '30%', away: '30%' },
    advice: `${home} vs ${away} — match serré, l'avantage du terrain pourrait faire la différence.`,
  };
}
