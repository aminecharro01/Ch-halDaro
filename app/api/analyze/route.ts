import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeTeam, awayTeam, score, events, stats } = body;

    const prompt = `You are a professional football match analyst. Write a concise 2-paragraph post-match report in broadcast journalism style for the following match. Be specific about key moments. Do not use filler phrases like 'in a thrilling encounter'.

Match: ${homeTeam} ${score} ${awayTeam}
Goals: ${events.filter((e: any) => e.type === 'Goal').map((e: any) => `${e.time.elapsed}' ${e.player.name}`).join(', ') || 'None'}
Possession: ${stats.home?.possession || 'N/A'}% vs ${stats.away?.possession || 'N/A'}%
Shots on target: ${stats.home?.shotsOnTarget || 'N/A'} vs ${stats.away?.shotsOnTarget || 'N/A'}
Cards: ${events.filter((e: any) => e.type === 'Card').map((e: any) => `${e.time.elapsed}' ${e.player.name} (${e.detail})`).join(', ') || 'None'}

Write the report now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ analysis: text });
  } catch (error: any) {
    console.error("API Analyze Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
