import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getMatchDetail, getTeamSquad } from '@/lib/thesportsdb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ analysis: "Key Battle analysis unavailable." });
    }

    const eventData = await getMatchDetail(id);
    const event = eventData.events?.[0];

    if (!event) {
      return NextResponse.json({ analysis: "Match data not found." });
    }

    // Fetch squads to get player names for analysis
    const [homeSquad, awaySquad] = await Promise.all([
      getTeamSquad(event.idHomeTeam).catch(() => ({ player: [] })),
      getTeamSquad(event.idAwayTeam).catch(() => ({ player: [] }))
    ]);

    const homePlayers = (homeSquad.player || homeSquad.players || []).slice(0, 5).map((p: any) => p.strPlayer).join(', ');
    const awayPlayers = (awaySquad.player || awaySquad.players || []).slice(0, 5).map((p: any) => p.strPlayer).join(', ');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyse le match de football: ${event.strEvent}.
    Joueurs clés domicile: ${homePlayers}
    Joueurs clés extérieur: ${awayPlayers}
    Identifie UN "Duel Clé" (Key Battle) entre deux joueurs opposés. 
    Explique pourquoi ce duel sera déterminant pour l'issue du match.
    Format: Une courte analyse percutante de 2-3 phrases en français.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
  } catch (error: any) {
    console.error("Gemini Key Battle Error:", error);
    if (error.status === 429) {
      return NextResponse.json({ analysis: "Analyse tactique en attente (Quota IA atteint). Le duel se jouera sur le terrain !" });
    }
    return NextResponse.json({ analysis: "Erreur lors de l'analyse du duel clé." }, { status: 500 });
  }
}
