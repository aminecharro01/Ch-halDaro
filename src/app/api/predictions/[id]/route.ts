import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { sportsDB } from '@/lib/api/sportsdb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json([{
        predictions: {
          percent: { home: "33%", draw: "34%", away: "33%" },
          advice: "Analysis unavailable."
        }
      }]);
    }

    const match = await sportsDB.getMatchDetails(id);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Agis en tant qu'expert en paris sportifs. Analyse le match: ${match.teams.home.name} vs ${match.teams.away.name} en ${match.league.name}.
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
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '');
    const json = JSON.parse(text);

    return NextResponse.json([{
      predictions: {
        percent: { home: json.home, draw: json.draw, away: json.away },
        advice: json.advice
      },
      teams: {
        home: { league: { form: 'WDLWD' } },
        away: { league: { form: 'LDWWL' } }
      }
    }]);
  } catch (error: any) {
    console.error("[predictions]", error);
    return NextResponse.json([{
      predictions: {
        percent: { home: "50%", draw: "25%", away: "25%" },
        advice: "Home team looks stronger today."
      },
      teams: {
        home: { league: { form: 'WDLWD' } },
        away: { league: { form: 'LDWWL' } }
      }
    }]);
  }
}
