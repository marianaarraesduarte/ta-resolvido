import { ApiError, GoogleGenAI, Type } from "@google/genai";

// Alias que a Google mantém apontando pro modelo Flash recomendado do
// momento — evita ter que trocar o nome do modelo manualmente quando um
// específico (ex: gemini-2.5-flash) sai de disponibilidade pra chaves novas.
const MODEL = "gemini-flash-latest";

// Sem isso, uma chamada que trava (rede lenta, API sem responder) fica
// esperando pra sempre — a tela de "Analisando..." nunca sai do lugar e
// nenhum erro chega a aparecer pra usuária. Foto/PDF demora bem mais que
// texto pro Gemini processar, por isso tem um timeout maior próprio. 20s
// pro texto se mostrou curto demais na prática — um pico de lentidão do
// Gemini já estourava esse limite antes mesmo de dar chance de retry.
const TEXT_TIMEOUT_MS = 30_000;
const DOCUMENT_TIMEOUT_MS = 45_000;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no servidor.");
  }
  return new GoogleGenAI({ apiKey, httpOptions: { timeout: TEXT_TIMEOUT_MS } });
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Formato de arquivo inválido.");
  }
  return { mimeType: match[1], data: match[2] };
}

// 503 (sobrecarga momentânea) e 504 (o Gemini demorou demais pra responder)
// — os dois são problemas passageiros do lado do Google, não erro de
// verdade. Qualquer outro tipo (chave inválida, schema errado etc.)
// continua falhando na hora, sem retry.
const TRANSIENT_STATUS = new Set([503, 504]);

/**
 * Em vez de já desistir e mostrar erro pra usuária num problema passageiro,
 * tenta de novo mais duas vezes com uma pausa curta antes.
 */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isTransient = err instanceof ApiError && TRANSIENT_STATUS.has(err.status);
      if (!isTransient || attempt >= maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
    }
  }
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

  const response = await withRetry(() =>
    ai.models.generateContent({
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
        httpOptions: { timeout: DOCUMENT_TIMEOUT_MS },
      },
    }),
  );

  const text = response.text;
  if (!text) {
    throw new Error("Resposta vazia da IA.");
  }

  return JSON.parse(text) as T;
}

/**
 * Manda um texto (sem imagem) pro Gemini com um prompt e um schema de saída,
 * e devolve o resultado já parseado como JSON — usado pro lançamento por chat.
 */
export async function extractFromText<T>(
  userText: string,
  prompt: string,
  schema: object,
): Promise<T> {
  const ai = getClient();

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, { text: userText }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  );

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

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  );

  const text = response.text;
  if (!text) {
    throw new Error("Resposta vazia da IA.");
  }

  return text.trim();
}

export { Type };
