import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';
import { isQuotaExceeded, ruleBasedPrediction } from '@/lib/content-fallback';

const PREDICTION_FORM = {
  home: { league: { form: 'WDLWD' } },
  away: { league: { form: 'LDWWL' } },
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let home = 'Home';
  let away = 'Away';

  try {
    const match = await sportsDB.getMatchDetails(id);

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    home = match.teams.home.name;
    away = match.teams.away.name;
    const fallback = ruleBasedPrediction(home, away);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json([{ predictions: fallback, teams: PREDICTION_FORM, source: 'fallback' }]);
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Agis en tant qu'expert en paris sportifs. Analyse le match: ${home} vs ${away} en ${match.league.name}.
    Donne des probabilités de victoire (Home, Draw, Away) totalisant 100%.
    Donne un conseil court (max 20 mots) en français.
    Réponds EXCLUSIVEMENT au format JSON:
    {
      "home": "XX%",
      "draw": "XX%",
      "away": "XX%",
      "advice": "Le conseil ici"
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '');
    const json = JSON.parse(text);

    return NextResponse.json([{
      predictions: {
        percent: { home: json.home, draw: json.draw, away: json.away },
        advice: json.advice,
      },
      teams: PREDICTION_FORM,
      source: 'generated',
    }]);
  } catch (error: unknown) {
    const fallback = ruleBasedPrediction(home, away);

    if (isQuotaExceeded(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[predictions] Gemini quota exceeded — using rule-based fallback');
      }
    } else {
      const message = error instanceof Error ? error.message : 'Prediction failed';
      console.error('[predictions]', message);
    }

    return NextResponse.json([{ predictions: fallback, teams: PREDICTION_FORM, source: 'fallback' }]);
  }
}
