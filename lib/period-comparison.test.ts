import { describe, expect, it } from "vitest";
import { comparePeriods, periodComparisonSentence } from "./period-comparison";

const entry = (amount: number, categoryName: string | null) => ({ amount, categoryName });

describe("comparePeriods", () => {
  it("retorna null quando não tem nada no mesmo período do mês passado", () => {
    expect(comparePeriods([entry(100, "Mercado")], [])).toBeNull();
  });

  it("calcula o percentual de aumento corretamente", () => {
    const thisPeriod = [entry(118, "Mercado")];
    const lastPeriod = [entry(100, "Mercado")];
    const result = comparePeriods(thisPeriod, lastPeriod);
    expect(result).toEqual({ deltaPercent: 18, direction: "up", topCategory: "Mercado" });
  });

  it("calcula o percentual de queda corretamente", () => {
    const thisPeriod = [entry(80, "Mercado")];
    const lastPeriod = [entry(100, "Mercado")];
    const result = comparePeriods(thisPeriod, lastPeriod);
    expect(result).toEqual({ deltaPercent: -20, direction: "down", topCategory: "Mercado" });
  });

  it("trata diferença pequena (abaixo de 5%) como 'flat', sem categoria", () => {
    const thisPeriod = [entry(103, "Mercado")];
    const lastPeriod = [entry(100, "Mercado")];
    const result = comparePeriods(thisPeriod, lastPeriod);
    expect(result).toEqual({ deltaPercent: 3, direction: "flat", topCategory: null });
  });

  it("aponta a categoria que mais empurrou o aumento, não só a mais cara", () => {
    // Lazer é a categoria mais cara em valor absoluto, mas não mudou nada —
    // quem realmente puxou o aumento foi Mercado.
    const thisPeriod = [entry(300, "Lazer"), entry(150, "Mercado")];
    const lastPeriod = [entry(300, "Lazer"), entry(50, "Mercado")];
    const result = comparePeriods(thisPeriod, lastPeriod);
    expect(result?.topCategory).toBe("Mercado");
  });

  it("ignora categoria que caiu quando a tendência geral é de alta", () => {
    // Transporte caiu bastante, mas Mercado subiu mais ainda — o total sobe,
    // e é Mercado quem deve ser citado, nunca a categoria que caiu.
    const thisPeriod = [entry(200, "Mercado"), entry(10, "Transporte")];
    const lastPeriod = [entry(50, "Mercado"), entry(100, "Transporte")];
    const result = comparePeriods(thisPeriod, lastPeriod);
    expect(result?.direction).toBe("up");
    expect(result?.topCategory).toBe("Mercado");
  });

  it("trata lançamento sem categoria como 'Sem categoria'", () => {
    const thisPeriod = [entry(120, null)];
    const lastPeriod = [entry(100, null)];
    const result = comparePeriods(thisPeriod, lastPeriod);
    expect(result?.topCategory).toBe("Sem categoria");
  });
});

describe("periodComparisonSentence", () => {
  it("monta a frase de aumento com a categoria", () => {
    expect(periodComparisonSentence({ deltaPercent: 18, direction: "up", topCategory: "Mercado" })).toBe(
      "Você já gastou 18% a mais que no mesmo período do mês passado, puxado por Mercado.",
    );
  });

  it("monta a frase de queda com a categoria", () => {
    expect(
      periodComparisonSentence({ deltaPercent: -20, direction: "down", topCategory: "Transporte" }),
    ).toBe("Você já gastou 20% a menos que no mesmo período do mês passado, puxado por Transporte.");
  });

  it("monta a frase sem categoria quando não há uma clara", () => {
    expect(periodComparisonSentence({ deltaPercent: 12, direction: "up", topCategory: null })).toBe(
      "Você já gastou 12% a mais que no mesmo período do mês passado.",
    );
  });

  it("monta a frase de 'flat'", () => {
    expect(periodComparisonSentence({ deltaPercent: 2, direction: "flat", topCategory: null })).toBe(
      "Você tá gastando praticamente igual ao mesmo período do mês passado.",
    );
  });
});
