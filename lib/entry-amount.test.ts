import { describe, expect, it } from "vitest";
import { entryAmountError } from "./entry-amount";

describe("entryAmountError", () => {
  it("aceita valor positivo dentro ou fora de fatura", () => {
    expect(entryAmountError(45.9, false)).toBeNull();
    expect(entryAmountError(45.9, true)).toBeNull();
  });

  it("aceita negativo dentro de fatura — é o estorno", () => {
    expect(entryAmountError(-120, true)).toBeNull();
  });

  it("recusa negativo fora de fatura", () => {
    expect(entryAmountError(-120, false)).toContain("estorno");
  });

  it("recusa zero nos dois casos", () => {
    expect(entryAmountError(0, true)).not.toBeNull();
    expect(entryAmountError(0, false)).not.toBeNull();
  });

  it("recusa valor que não é número (veio quebrado do cliente)", () => {
    expect(entryAmountError(Number.NaN, true)).not.toBeNull();
    expect(entryAmountError(Number.POSITIVE_INFINITY, true)).not.toBeNull();
  });
});
