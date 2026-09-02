import { describe, expect, it } from "vitest";
import {
  FIRST_MONTH_RECOGNITION_LIMIT,
  FREE_RECOGNITION_LIMIT,
  isCompleto,
  isRecognitionLimitReached,
  recognitionAllowance,
} from "./plan";

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

describe("recognitionAllowance", () => {
  const criadaEm = new Date("2026-09-02T10:00:00Z");

  it("dá a cota de estreia nos primeiros 30 dias, contando desde a criação da conta", () => {
    const dentro = new Date("2026-09-20T10:00:00Z");
    const cota = recognitionAllowance(criadaEm, dentro);

    expect(cota.limit).toBe(FIRST_MONTH_RECOGNITION_LIMIT);
    expect(cota.isFirstMonth).toBe(true);
    expect(cota.countFrom).toEqual(criadaEm);
  });

  it("quem se cadastra no fim do mês não perde a cota de estreia na virada", () => {
    const fimDoMes = new Date("2026-09-28T10:00:00Z");
    const jaEmOutubro = new Date("2026-10-05T10:00:00Z");
    const cota = recognitionAllowance(fimDoMes, jaEmOutubro);

    // O caso que a contagem por mês do calendário quebraria: dia 5 de outubro
    // ainda está dentro dos 30 dias de quem entrou dia 28 de setembro.
    expect(cota.limit).toBe(FIRST_MONTH_RECOGNITION_LIMIT);
    expect(cota.countFrom).toEqual(fimDoMes);
  });

  it("depois de 30 dias volta pra cota mensal, contada do dia 1º", () => {
    const depois = new Date("2026-10-15T10:00:00Z");
    const cota = recognitionAllowance(criadaEm, depois);

    expect(cota.limit).toBe(FREE_RECOGNITION_LIMIT);
    expect(cota.isFirstMonth).toBe(false);
    expect(cota.countFrom.getDate()).toBe(1);
    expect(cota.countFrom.getMonth()).toBe(9); // outubro
    expect(cota.countFrom.getHours()).toBe(0);
  });

  it("sem data de criação, cai na cota mensal em vez de liberar a maior", () => {
    const cota = recognitionAllowance(null, new Date("2026-10-15T10:00:00Z"));
    expect(cota.limit).toBe(FREE_RECOGNITION_LIMIT);
    expect(cota.isFirstMonth).toBe(false);
  });

  it("data inválida também cai na cota mensal", () => {
    const cota = recognitionAllowance("nao-e-data", new Date("2026-10-15T10:00:00Z"));
    expect(cota.limit).toBe(FREE_RECOGNITION_LIMIT);
  });
});

describe("isRecognitionLimitReached com cota de estreia", () => {
  it("no primeiro mês, o limite é a cota maior", () => {
    expect(isRecognitionLimitReached("free", 9, FIRST_MONTH_RECOGNITION_LIMIT)).toBe(false);
    expect(isRecognitionLimitReached("free", 10, FIRST_MONTH_RECOGNITION_LIMIT)).toBe(true);
  });

  it("quem é do Completo continua sem limite, mesmo passando a cota de estreia", () => {
    expect(isRecognitionLimitReached("completo", 50, FIRST_MONTH_RECOGNITION_LIMIT)).toBe(false);
  });
});
