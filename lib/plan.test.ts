import { describe, expect, it } from "vitest";
import { FREE_RECOGNITION_LIMIT, isCompleto, isRecognitionLimitReached } from "./plan";

describe("isCompleto", () => {
  it("verdadeiro só pra 'completo'", () => {
    expect(isCompleto("completo")).toBe(true);
  });

  it("falso pra 'free', null, undefined ou qualquer outro valor", () => {
    expect(isCompleto("free")).toBe(false);
    expect(isCompleto(null)).toBe(false);
    expect(isCompleto(undefined)).toBe(false);
    expect(isCompleto("Completo")).toBe(false); // maiúscula errada não deve passar
  });
});

describe("isRecognitionLimitReached", () => {
  it("quem é do Completo nunca bate o limite, não importa quantos reconhecimentos já usou", () => {
    expect(isRecognitionLimitReached("completo", 0)).toBe(false);
    expect(isRecognitionLimitReached("completo", 999)).toBe(false);
  });

  it(`quem é do grátis pode usar até ${FREE_RECOGNITION_LIMIT} reconhecimentos (foto ou chat) no mês`, () => {
    for (let count = 0; count < FREE_RECOGNITION_LIMIT; count++) {
      expect(isRecognitionLimitReached("free", count)).toBe(false);
    }
  });

  it(`quem é do grátis bate o limite no ${FREE_RECOGNITION_LIMIT}º reconhecimento`, () => {
    expect(isRecognitionLimitReached("free", FREE_RECOGNITION_LIMIT)).toBe(true);
    expect(isRecognitionLimitReached("free", FREE_RECOGNITION_LIMIT + 5)).toBe(true);
  });

  it("perfil sem plano definido (null) é tratado como grátis", () => {
    expect(isRecognitionLimitReached(null, FREE_RECOGNITION_LIMIT)).toBe(true);
  });
});
