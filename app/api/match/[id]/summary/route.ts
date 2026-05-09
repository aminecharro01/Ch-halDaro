import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getMatchDetail, getMatchTimeline } from '@/lib/thesportsdb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ summary: "AI Summary unavailable (Missing API Key)." });
    }

    const [eventData, timelineData] = await Promise.all([
      getMatchDetail(id).catch(() => ({ events: [] })),
      getMatchTimeline(id).catch(() => ({ timeline: [] }))
    ]);

    const event = eventData.events?.[0];
    if (!event) {
      return NextResponse.json({ summary: "Match data not found." });
    }

    const timeline = timelineData.timeline || [];
    const eventsStr = timeline.map((e: any) => `${e.intTime}': ${e.strTimeline} by ${e.strPlayer}`).join(', ');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Génère un bref résumé (max 3 phrases) en français pour le match de football suivant:
    Affiche: ${event.strEvent}
    Score: ${event.intHomeScore} - ${event.intAwayScore}
    Événements: ${eventsStr}
    Le résumé doit être dynamique et informatif.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
  } catch (error: any) {
    console.error("Gemini Summary Error:", error);
    if (error.status === 429) {
      return NextResponse.json({ summary: "Le service d'analyse IA est temporairement saturé. Veuillez réessayer dans quelques instants." });
    }
    return NextResponse.json({ summary: "Erreur lors de la génération du résumé." }, { status: 500 });
  }
}
