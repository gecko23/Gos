import { GoogleGenAI } from "@google/genai";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: 'A red skateboard' }]
      }
    });
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
