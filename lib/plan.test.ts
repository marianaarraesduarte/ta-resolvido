import { describe, expect, it } from "vitest";
import { FREE_PHOTO_LIMIT, isCompleto, isPhotoLimitReached } from "./plan";

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

describe("isPhotoLimitReached", () => {
  it("quem é do Completo nunca bate o limite, não importa quantas fotos já usou", () => {
    expect(isPhotoLimitReached("completo", 0)).toBe(false);
    expect(isPhotoLimitReached("completo", 999)).toBe(false);
  });

  it(`quem é do grátis pode usar até ${FREE_PHOTO_LIMIT} fotos no mês`, () => {
    for (let count = 0; count < FREE_PHOTO_LIMIT; count++) {
      expect(isPhotoLimitReached("free", count)).toBe(false);
    }
  });

  it(`quem é do grátis bate o limite na ${FREE_PHOTO_LIMIT}ª foto`, () => {
    expect(isPhotoLimitReached("free", FREE_PHOTO_LIMIT)).toBe(true);
    expect(isPhotoLimitReached("free", FREE_PHOTO_LIMIT + 5)).toBe(true);
  });

  it("perfil sem plano definido (null) é tratado como grátis", () => {
    expect(isPhotoLimitReached(null, FREE_PHOTO_LIMIT)).toBe(true);
  });
});
