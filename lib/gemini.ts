import { ApiError, GoogleGenAI, Type } from "@google/genai";

/**
 * Cadeia de modelos, em ordem de preferência: a primeira que responder ganha.
 *
 * Antes daqui existia um modelo só, o alias "gemini-flash-latest". O problema
 * é que alias sempre aponta pro modelo mais novo — e modelo novo é justamente
 * o mais concorrido. Em 30/08/2026 esse alias passou horas devolvendo 503
 * ("this model is currently experiencing high demand") enquanto os modelos
 * fixos respondiam normalmente. Não adianta ter crédito ou plano pago: 503 de
 * demanda é falta de capacidade do Google, não falta de cota nossa.
 *
 * A medição que definiu esta ordem, feita durante a pane de 30/08/2026 com a
 * mesma imagem e o mesmo schema:
 *
 *   gemini-3.5-flash          200 em  1,7s   <- geração anterior, folgada
 *   gemini-3.5-flash-lite     200 em  1,7s
 *   gemini-3.6-flash          200 em 26,5s   <- mais novo, congestionado
 *   gemini-flash-lite-latest  200 em 21,8s
 *   gemini-flash-latest       503 em 47,2s   <- o que o app usava
 *
 * Daí a regra: geração anterior primeiro (é a que sobra capacidade), modelo
 * completo antes do lite (extrair valor de extrato pede leitura boa — lite
 * só como rede de segurança), e alias por último. E os modelos fixos, um dia,
 * saem do ar pra chaves novas (foi o que aconteceu com o gemini-2.5-flash,
 * que hoje responde 404 mandando usar um mais recente) — quando isso
 * acontecer, a cadeia pula pro próximo em vez de quebrar o app, e o alias no
 * fim garante que sempre exista pelo menos um nome válido.
 *
 * Dá pra trocar a lista sem mexer no código, pela variável de ambiente
 * GEMINI_MODELS (nomes separados por vírgula) — útil pra reagir na hora se um
 * dia todos esses saírem de circulação.
 */
const DEFAULT_MODEL_CHAIN = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
];

function modelChain(): string[] {
  const fromEnv = process.env.GEMINI_MODELS?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_MODEL_CHAIN;
}

/**
 * Orçamento de tempo. Os dois limites existem por motivos diferentes:
 *
 * - ATTEMPT: quanto uma tentativa isolada pode demorar antes de a gente
 *   desistir dela e tentar outro modelo. Curto de propósito — modelo
 *   sobrecarregado costuma ficar lento antes de dar erro, e ficar esperando
 *   nele é desperdiçar o tempo que daria pra tentar um que está saudável.
 * - BUDGET: o teto do conjunto todo (todas as tentativas, de todos os
 *   modelos). Tem que caber DENTRO do maxDuration da função na Vercel
 *   (60s, ver app/app/novo/page.tsx), senão a plataforma corta a chamada no
 *   meio e a usuária recebe um erro sem mensagem nenhuma. A folga que sobra é
 *   pro resto da action: sessão, consultas no Supabase e a resposta.
 */
const TEXT_ATTEMPT_MS = 15_000;
const TEXT_BUDGET_MS = 40_000;
const DOCUMENT_ATTEMPT_MS = 20_000;
const DOCUMENT_BUDGET_MS = 50_000;

/**
 * A API do Gemini recusa (400 INVALID_ARGUMENT) qualquer deadline menor que
 * 10s. Descoberto num teste ao vivo: quando o orçamento estava quase no fim,
 * a gente mandava uma tentativa de 6s e o erro que voltava não era passageiro
 * — derrubava tudo em vez de cair pro próximo modelo. Então, se não sobrou
 * pelo menos isso, não vale nem tentar.
 */
const MIN_ATTEMPT_MS = 10_000;

/**
 * Uma falha rápida (503 que volta na hora) é barata de repetir; já um modelo
 * que fica pendurado até o nosso timeout consumiu o orçamento inteiro, e
 * insistir nele custaria a chance de tentar um modelo saudável. Por isso só
 * repetimos o mesmo modelo quando ele falhou rápido.
 */
const FAST_FAILURE_MS = 5_000;

/** Quantas vezes insistir no MESMO modelo antes de passar pro próximo. */
const ATTEMPTS_PER_MODEL = 2;

/**
 * Erro de "a IA não está disponível agora", separado dos demais pra que a
 * mensagem que chega na tela diga o que fazer (esperar e tentar de novo) em
 * vez do genérico "não deu pra analisar", que servia pra qualquer causa e não
 * ajudava ninguém.
 */
export class GeminiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(
      "A IA do Google está sobrecarregada neste momento. Espera um minutinho e toca em tentar de novo.",
    );
    this.name = "GeminiUnavailableError";
    this.cause = cause;
  }
}

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

// Problemas passageiros do lado do Google — vale insistir. 429 entra aqui
// porque cada modelo tem sua própria cota: estourar no primeiro não quer
// dizer que o próximo da fila também vai recusar.
const TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);

/**
 * Quando o nosso próprio timeout estoura, o SDK aborta a chamada e joga um
 * AbortError (não um ApiError com status) — confirmado ao vivo num caso real
 * de fatura. Sem essa checagem, esse caso passava direto sem nenhuma
 * tentativa extra.
 */
function isTimeoutError(err: unknown): boolean {
  return err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
}

function isTransientError(err: unknown): boolean {
  if (err instanceof ApiError && TRANSIENT_STATUS.has(err.status)) return true;
  return isTimeoutError(err);
}

/**
 * Modelo que não existe mais pra essa chave (404). Diferente do erro
 * passageiro: insistir no mesmo modelo nunca vai resolver, então pula direto
 * pro próximo da cadeia.
 */
function isModelGone(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Roda a chamada percorrendo a cadeia de modelos: insiste um pouco em cada um
 * enquanto o erro for passageiro, e passa pro próximo quando aquele modelo
 * está sobrecarregado ou saiu do ar. Erro de verdade (chave inválida, schema
 * errado) falha na hora, sem gastar o orçamento à toa.
 */
async function runWithFallback<T>(
  call: (model: string, timeoutMs: number) => Promise<T>,
  attemptMs: number,
  budgetMs: number,
): Promise<T> {
  const deadline = Date.now() + budgetMs;
  let lastError: unknown;

  for (const model of modelChain()) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt++) {
      const remaining = deadline - Date.now();
      // Sem tempo pro mínimo que a API aceita: encerra com a mensagem certa,
      // em vez de mandar um deadline inválido ou estourar o limite da função.
      if (remaining < MIN_ATTEMPT_MS) {
        throw new GeminiUnavailableError(lastError);
      }

      const startedAt = Date.now();
      try {
        return await call(model, Math.max(MIN_ATTEMPT_MS, Math.min(attemptMs, remaining)));
      } catch (err) {
        lastError = err;
        const elapsed = Date.now() - startedAt;

        if (isModelGone(err)) {
          console.error(`[gemini] modelo ${model} indisponível (404), indo pro próximo:`, err);
          break;
        }
        if (!isTransientError(err)) throw err;

        console.error(
          `[gemini] tentativa ${attempt}/${ATTEMPTS_PER_MODEL} em ${model} falhou em ${elapsed}ms:`,
          err,
        );
        // Timeout já quer dizer, por definição, que esse modelo consumiu a
        // tentativa inteira — repetir nele é o mesmo desperdício, sem precisar
        // conferir o relógio.
        if (attempt === ATTEMPTS_PER_MODEL || isTimeoutError(err) || elapsed >= FAST_FAILURE_MS) {
          break;
        }

        const pause = Math.min(700 * attempt, Math.max(0, deadline - Date.now() - MIN_ATTEMPT_MS));
        if (pause > 0) await sleep(pause);
      }
    }
  }

  throw new GeminiUnavailableError(lastError);
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

  const response = await runWithFallback(
    (model, timeout) =>
      ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, { inlineData: { mimeType, data } }],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          httpOptions: { timeout },
        },
      }),
    DOCUMENT_ATTEMPT_MS,
    DOCUMENT_BUDGET_MS,
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

  const response = await runWithFallback(
    (model, timeout) =>
      ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, { text: userText }],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          httpOptions: { timeout },
        },
      }),
    TEXT_ATTEMPT_MS,
    TEXT_BUDGET_MS,
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

  const response = await runWithFallback(
    (model, timeout) =>
      ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { httpOptions: { timeout } },
      }),
    TEXT_ATTEMPT_MS,
    TEXT_BUDGET_MS,
  );

  const text = response.text;
  if (!text) {
    throw new Error("Resposta vazia da IA.");
  }

  return text.trim();
}

/**
 * Mensagem pra mostrar na tela depois de uma falha de reconhecimento. Se a
 * causa foi sobrecarga do Gemini, repassa a explicação de verdade (a usuária
 * precisa saber que é só esperar); qualquer outra causa continua virando a
 * mensagem genérica, sem vazar detalhe técnico.
 */
export function recognitionErrorMessage(err: unknown, fallback: string): Error {
  return err instanceof GeminiUnavailableError ? new Error(err.message) : new Error(fallback);
}

export { Type };
