import { describe, expect, it } from "vitest";
import { isPossibleDuplicate } from "./duplicate-check";

describe("isPossibleDuplicate", () => {
  const existing = [{ entry_date: "2026-08-15", amount: 45.9, description: "Mercado Uau" }];

  it("é duplicata quando data, valor e nome (parecido) batem", () => {
    expect(
      isPossibleDuplicate(
        { date: "2026-08-15", amount: 45.9, description: "Mercado Uau" },
        existing,
      ),
    ).toBe(true);
  });

  it("nome parecido (não idêntico) ainda conta como duplicata", () => {
    expect(
      isPossibleDuplicate(
        { date: "2026-08-15", amount: 45.9, description: "Mercado Uau - compra" },
        existing,
      ),
    ).toBe(true);
  });

  it("data diferente não é duplicata, mesmo com valor e nome iguais", () => {
    expect(
      isPossibleDuplicate(
        { date: "2026-08-16", amount: 45.9, description: "Mercado Uau" },
        existing,
      ),
    ).toBe(false);
  });

  it("valor diferente não é duplicata, mesmo com data e nome iguais", () => {
    expect(
      isPossibleDuplicate(
        { date: "2026-08-15", amount: 50, description: "Mercado Uau" },
        existing,
      ),
    ).toBe(false);
  });

  it("nome sem nenhuma relação não é duplicata, mesmo com data e valor iguais", () => {
    expect(
      isPossibleDuplicate(
        { date: "2026-08-15", amount: 45.9, description: "Farmácia" },
        existing,
      ),
    ).toBe(false);
  });

  it("tolera diferença de centavo por arredondamento", () => {
    expect(
      isPossibleDuplicate(
        { date: "2026-08-15", amount: 45.901, description: "Mercado Uau" },
        existing,
      ),
    ).toBe(true);
  });

  it("lista vazia de lançamentos existentes nunca é duplicata", () => {
    expect(
      isPossibleDuplicate({ date: "2026-08-15", amount: 45.9, description: "Mercado Uau" }, []),
    ).toBe(false);
  });
});
