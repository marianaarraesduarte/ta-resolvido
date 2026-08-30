import { describe, expect, it } from "vitest";
import { parseInstallmentInfo } from "./installment-detect";

describe("parseInstallmentInfo", () => {
  it("reconhece 'nome 3/10'", () => {
    expect(parseInstallmentInfo("Amazon BR 03/10")).toEqual({
      baseDescription: "Amazon BR",
      number: 3,
      total: 10,
    });
  });

  it("reconhece 'nome parcela 3 de 10'", () => {
    expect(parseInstallmentInfo("Notebook Dell parcela 3 de 10")).toEqual({
      baseDescription: "Notebook Dell",
      number: 3,
      total: 10,
    });
  });

  it("reconhece 'nome (3 de 12)'", () => {
    expect(parseInstallmentInfo("Sofá Móveis Anália (3 de 12)")).toEqual({
      baseDescription: "Sofá Móveis Anália",
      number: 3,
      total: 12,
    });
  });

  it("ignora quando número é maior que o total", () => {
    expect(parseInstallmentInfo("Uber 25/12")).toBeNull();
  });

  it("ignora quando não há nome antes do número", () => {
    expect(parseInstallmentInfo("3/10")).toBeNull();
  });

  it("ignora descrição sem marcação de parcela", () => {
    expect(parseInstallmentInfo("Ifood")).toBeNull();
  });

  it("ignora total fora do intervalo plausível de parcelamento", () => {
    expect(parseInstallmentInfo("Compra 1/60")).toBeNull();
  });
});
