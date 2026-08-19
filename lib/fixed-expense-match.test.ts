import { describe, expect, it } from "vitest";
import { matchFixedExpense } from "./fixed-expense-match";

describe("matchFixedExpense", () => {
  const fixedExpenses = [
    { name: "Aluguel", expected_amount: 1800 },
    { name: "Internet", expected_amount: 99.9 },
  ];

  it("bate por valor exato, mesmo com descrição bem diferente do nome cadastrado", () => {
    expect(matchFixedExpense("Transferência recebida", 1800, fixedExpenses)).toBe("Aluguel");
  });

  it("bate por nome parecido quando o valor não bate exato", () => {
    expect(matchFixedExpense("Aluguel apto agosto", 1850, fixedExpenses)).toBe("Aluguel");
  });

  it("prioriza valor sobre nome quando os dois sinalizam gastos fixos diferentes", () => {
    // Valor bate com Internet, mas o nome parece com Aluguel — valor manda.
    expect(matchFixedExpense("Aluguel", 99.9, fixedExpenses)).toBe("Internet");
  });

  it("retorna null quando nem valor nem nome batem com nada", () => {
    expect(matchFixedExpense("Uber", 38, fixedExpenses)).toBeNull();
  });

  it("retorna null quando não há gastos fixos cadastrados", () => {
    expect(matchFixedExpense("Aluguel", 1800, [])).toBeNull();
  });
});
