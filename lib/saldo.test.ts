import { describe, expect, it } from "vitest";
import { calculateSaldo } from "./saldo";

describe("calculateSaldo", () => {
  it("soma saldo inicial + receitas - despesas", () => {
    const saldo = calculateSaldo(
      [
        { type: "receita", amount: 5000 },
        { type: "despesa", amount: 1200 },
        { type: "despesa", amount: 300 },
      ],
      { initialBalance: 1000, salaryOnly: false },
    );
    expect(saldo).toBe(4500);
  });

  it("pode ficar negativo quando as despesas passam do que entrou", () => {
    const saldo = calculateSaldo(
      [{ type: "receita", amount: 100 }, { type: "despesa", amount: 500 }],
      { initialBalance: 0, salaryOnly: false },
    );
    expect(saldo).toBe(-400);
  });

  it("sem nenhum lançamento, saldo é só o saldo inicial", () => {
    const saldo = calculateSaldo([], { initialBalance: 250, salaryOnly: false });
    expect(saldo).toBe(250);
  });

  it("com salaryOnly, ignora receitas que não são salário", () => {
    const entries: Parameters<typeof calculateSaldo>[0] = [
      { type: "receita", amount: 5000, income_type: "salario" },
      { type: "receita", amount: 800, income_type: "outra" },
      { type: "despesa", amount: 1000 },
    ];
    const comTodasReceitas = calculateSaldo(entries, { initialBalance: 0, salaryOnly: false });
    const soSalario = calculateSaldo(entries, { initialBalance: 0, salaryOnly: true });
    expect(comTodasReceitas).toBe(4800);
    expect(soSalario).toBe(4000);
  });

  it("investimento marcado como 'feito' vira despesa e reduz o saldo (Ponto 1)", () => {
    // A confirmação de meta de investimento cria uma despesa real — não deve
    // existir nenhum desconto de saldo fora dessa despesa explícita.
    const saldo = calculateSaldo(
      [
        { type: "receita", amount: 5000, income_type: "salario" },
        { type: "despesa", amount: 500 }, // Investimento — Longo prazo
      ],
      { initialBalance: 0, salaryOnly: false },
    );
    expect(saldo).toBe(4500);
  });
});
