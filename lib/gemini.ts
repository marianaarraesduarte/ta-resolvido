import { GoogleGenAI, Type } from "@google/genai";

// Alias que a Google mantém apontando pro modelo Flash recomendado do
// momento — evita ter que trocar o nome do modelo manualmente quando um
// específico (ex: gemini-2.5-flash) sai de disponibilidade pra chaves novas.
const MODEL = "gemini-flash-latest";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no servidor.");
  }
  return new GoogleGenAI({ apiKey });
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Formato de arquivo inválido.");
  }
  return { mimeType: match[1], data: match[2] };
}

/**
 * Manda uma foto ou PDF (em data URL) pro Gemini com um prompt e um schema
 * de saída, e devolve o resultado já parseado como JSON.
 */
export async function extractFromDocument<T>(
  fileDataUrl: string,
  prompt: string,
  schema: object,
): Promise<T> {
  const ai = getClient();
  const { mimeType, data } = parseDataUrl(fileDataUrl);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType, data } }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Resposta vazia da IA.");
  }

  return JSON.parse(text) as T;
}

/**
 * Pede um texto curto em linguagem natural pro Gemini (sem imagem, sem
 * schema estruturado) — usado pra análise mensal.
 */
export async function generateText(prompt: string): Promise<string> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = response.text;
  if (!text) {
    throw new Error("Resposta vazia da IA.");
  }

  return text.trim();
}

export { Type };
