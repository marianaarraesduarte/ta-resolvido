import { describe, expect, it } from "vitest";
import { computeFrequentExpenses } from "./frequent-expenses";

describe("computeFrequentExpenses", () => {
  it("agrupa por descrição igual (sem acento/maiúsculas) e exige repetição mínima", () => {
    const entries = [
      { description: "Uber", amount: 18, category_id: "c1", entry_date: "2026-08-01" },
      { description: "uber", amount: 22, category_id: "c1", entry_date: "2026-08-10" },
      { description: "UBER", amount: 25, category_id: "c1", entry_date: "2026-08-20" },
      { description: "Cinema", amount: 40, category_id: "c2", entry_date: "2026-08-05" },
    ];

    const result = computeFrequentExpenses(entries, []);

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("UBER");
    expect(result[0].amount).toBe(25);
    expect(result[0].count).toBe(3);
  });

  it("exclui o que já é reconhecido como gasto fixo", () => {
    const entries = [
      { description: "Aluguel", amount: 1200, category_id: null, entry_date: "2026-06-05" },
      { description: "Aluguel", amount: 1200, category_id: null, entry_date: "2026-07-05" },
      { description: "Aluguel", amount: 1200, category_id: null, entry_date: "2026-08-05" },
    ];
    const fixedExpenses = [{ name: "Aluguel", expected_amount: 1200 }];

    expect(computeFrequentExpenses(entries, fixedExpenses)).toEqual([]);
  });

  it("ordena pelas mais frequentes e limita a 3 resultados", () => {
    const makeEntries = (description: string, times: number) =>
      Array.from({ length: times }, (_, i) => ({
        description,
        amount: 10,
        category_id: null,
        entry_date: `2026-08-${String(i + 1).padStart(2, "0")}`,
      }));

    const entries = [
      ...makeEntries("A", 3),
      ...makeEntries("B", 6),
      ...makeEntries("C", 4),
      ...makeEntries("D", 5),
    ];

    const result = computeFrequentExpenses(entries, []);

    expect(result).toHaveLength(3);
    expect(result.map((r) => r.description)).toEqual(["B", "D", "C"]);
  });
});
