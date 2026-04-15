import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
export const genAI = new GoogleGenerativeAI(apiKey);
// Using gemini-2.0-flash as per instructions, adjust if needed
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
