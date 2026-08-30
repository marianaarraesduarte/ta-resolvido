import { beforeEach, describe, expect, it, vi } from "vitest";

// O SDK é trocado por um dublê pra que os testes cubram a cadeia de modelos
// sem rede: o que importa aqui é QUAL modelo é chamado, em que ordem, e o que
// acontece com cada tipo de erro.
const generateContent = vi.fn();

vi.mock("@google/genai", () => {
  class ApiError extends Error {
    status: number;
    constructor(options: { message: string; status: number }) {
      super(options.message);
      this.status = options.status;
    }
  }
  class GoogleGenAI {
    models = { generateContent };
  }
  return {
    ApiError,
    GoogleGenAI,
    Type: { ARRAY: "ARRAY", OBJECT: "OBJECT", STRING: "STRING", NUMBER: "NUMBER" },
  };
});

const { ApiError } = await import("@google/genai");
const { extractFromText, GeminiUnavailableError } = await import("@/lib/gemini");

function apiError(status: number) {
  return new ApiError({ message: `erro ${status}`, status });
}

function respostaOk(texto = '{"ok":true}') {
  return { text: texto };
}

/** Os modelos efetivamente chamados, na ordem em que foram chamados. */
function modelosChamados(): string[] {
  return generateContent.mock.calls.map((call) => call[0].model);
}

beforeEach(() => {
  generateContent.mockReset();
  process.env.GEMINI_API_KEY = "chave-de-teste";
  delete process.env.GEMINI_MODELS;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("cadeia de modelos", () => {
  it("usa o primeiro modelo quando ele responde", async () => {
    process.env.GEMINI_MODELS = "modelo-a,modelo-b";
    generateContent.mockResolvedValueOnce(respostaOk());

    await expect(extractFromText("oi", "prompt", {})).resolves.toEqual({ ok: true });
    expect(modelosChamados()).toEqual(["modelo-a"]);
  });

  it("passa pro próximo modelo quando o primeiro está sobrecarregado", async () => {
    process.env.GEMINI_MODELS = "modelo-a,modelo-b";
    generateContent
      .mockRejectedValueOnce(apiError(503))
      .mockRejectedValueOnce(apiError(503))
      .mockResolvedValueOnce(respostaOk());

    await expect(extractFromText("oi", "prompt", {})).resolves.toEqual({ ok: true });
    // Insiste no A (falha rápida é barata) e só então cai pro B.
    expect(modelosChamados()).toEqual(["modelo-a", "modelo-a", "modelo-b"]);
  });

  it("não insiste num modelo que saiu do ar (404), vai direto pro próximo", async () => {
    process.env.GEMINI_MODELS = "modelo-velho,modelo-novo";
    generateContent.mockRejectedValueOnce(apiError(404)).mockResolvedValueOnce(respostaOk());

    await expect(extractFromText("oi", "prompt", {})).resolves.toEqual({ ok: true });
    expect(modelosChamados()).toEqual(["modelo-velho", "modelo-novo"]);
  });

  it("falha na hora em erro que não é passageiro, sem gastar a cadeia", async () => {
    process.env.GEMINI_MODELS = "modelo-a,modelo-b";
    generateContent.mockRejectedValueOnce(apiError(400));

    await expect(extractFromText("oi", "prompt", {})).rejects.toThrow("erro 400");
    expect(modelosChamados()).toEqual(["modelo-a"]);
  });

  it("com todos sobrecarregados, explica que é pra tentar de novo depois", async () => {
    process.env.GEMINI_MODELS = "modelo-a,modelo-b";
    generateContent.mockRejectedValue(apiError(503));

    const erro = await extractFromText("oi", "prompt", {}).catch((e) => e);
    expect(erro).toBeInstanceOf(GeminiUnavailableError);
    expect((erro as Error).message).toContain("sobrecarregada");
    expect(modelosChamados()).toEqual(["modelo-a", "modelo-a", "modelo-b", "modelo-b"]);
  });

  it("trata timeout nosso (AbortError) como passageiro", async () => {
    process.env.GEMINI_MODELS = "modelo-a,modelo-b";
    const abort = new Error("abortado");
    abort.name = "AbortError";
    generateContent.mockRejectedValueOnce(abort).mockResolvedValueOnce(respostaOk());

    await expect(extractFromText("oi", "prompt", {})).resolves.toEqual({ ok: true });
    expect(modelosChamados()).toEqual(["modelo-a", "modelo-b"]);
  });
});
