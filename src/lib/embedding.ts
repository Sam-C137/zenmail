import { GoogleGenAI } from "@google/genai";
import { env } from "@/env";

const ai = new GoogleGenAI({
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function genEmbedding(contents: string) {
    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-exp-03-07",
            contents,
        });
        return response.embeddings?.at(0)?.values;
    } catch (e) {
        console.error("Error generating embedding:", e);
    }
}
