import { describe, expect, it } from "vitest";
import { isPossibleDuplicate } from "./duplicate-check";

describe("isPossibleDuplicate", () => {
  const existing = [{ entry_date: "2026-08-15", amount: 45.9, description: "Mercado Uau" }];

  it("é duplicata quando data e valor batem, com o mesmo nome", () => {
    expect(
      isPossibleDuplicate(
        { date: "2026-08-15", amount: 45.9, description: "Mercado Uau" },
        existing,
      ),
    ).toBe(true);
  });

  it("é duplicata quando data e valor batem, mesmo com nome parecido", () => {
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

  it("é duplicata quando data e valor batem, mesmo com nome sem nenhuma relação (ex: lançado na mão com um nome e depois reconhecido por foto com outro)", () => {
    expect(
      isPossibleDuplicate(
        { date: "2026-08-15", amount: 45.9, description: "Farmácia" },
        existing,
      ),
    ).toBe(true);
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
