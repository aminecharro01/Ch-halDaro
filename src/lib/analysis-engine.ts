import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const client = new GoogleGenerativeAI(apiKey);
export const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

function formatEvents(events: { minute?: number; player?: string; type?: string }[]) {
  if (!events?.length) return 'None';
  return events
    .filter((e) => e.type === 'goal' || e.type?.includes('card'))
    .map((e) => `${e.minute ?? '?'}' ${e.player ?? 'Unknown'} (${e.type})`)
    .join(', ');
}

function extractStatValue(statistics: { team?: { id: string }; statistics?: { type: string; value: string }[] }[], label: string, side: 'home' | 'away') {
  const block = statistics?.find((s) => s.team?.id === side);
  const stat = block?.statistics?.find((x) => x.type?.toLowerCase().includes(label.toLowerCase()));
  return stat?.value ?? 'N/A';
}

export const getMatchAnalysis = async (
  match: { teams: { home: { name: string }; away: { name: string } }; goals: { home: number; away: number }; fixture: { status: { long: string } }; league: { name: string } },
  events: { minute?: number; player?: string; type?: string }[],
  statistics: { team?: { id: string }; statistics?: { type: string; value: string }[] }[]
) => {
  if (!apiKey) return "L'analyse n'est pas disponible (clé API manquante).";

  const prompt = `
    Analyze this football match and provide a concise, engaging summary in 3-4 sentences.
    
    Match: ${match.teams.home.name} vs ${match.teams.away.name}
    Score: ${match.goals.home} - ${match.goals.away}
    Status: ${match.fixture.status.long}
    League: ${match.league.name}
    
    Events: ${formatEvents(events)}
    Possession: ${extractStatValue(statistics, 'possession', 'home')} vs ${extractStatValue(statistics, 'possession', 'away')}
    
    If the match is Finished, provide a post-match analysis.
    If the match is Live, provide a current momentum update.
    If the match hasn't started, provide a pre-match preview.
    
    Keep it professional and passionate. Respond in French.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    console.error('[analysis-engine]', error);
    const err = error as { status?: number; message?: string };
    if (err.status === 429 || err.message?.includes('429')) {
      return 'Service temporairement saturé. Réessayez dans quelques minutes.';
    }
    return "L'analyse n'a pas pu être générée pour le moment.";
  }
};
