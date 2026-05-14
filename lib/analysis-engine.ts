import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
export const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const getMatchAnalysis = async (fixture: any, events: any[], stats: any[]) => {
  if (!apiKey) return "AI Analysis is currently unavailable (API Key missing).";

  const prompt = `
    Analyze this football match and provide a concise, engaging summary in 3-4 sentences.
    
    Match: ${fixture.teams.home.name} vs ${fixture.teams.away.name}
    Score: ${fixture.goals.home} - ${fixture.goals.away}
    Status: ${fixture.fixture.status.long}
    League: ${fixture.league.name}
    
    Events: ${events.map(e => `${e.time.elapsed}' ${e.player.name} (${e.type})`).join(', ')}
    
    Stats: ${JSON.stringify(stats)}

    If the match is Finished, provide a post-match analysis.
    If the match is Live, provide a current momentum update.
    If the match hasn't started, provide a pre-match preview based on the team names.
    
    Keep it professional and passionate.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    if (error.status === 429 || error.message?.includes("429")) {
      return "The AI analysis engine is temporarily at capacity. Please check back in a few minutes.";
    }
    return "Analysis could not be generated at this time.";
  }
};
