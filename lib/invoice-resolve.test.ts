import { describe, expect, it } from "vitest";
import { resolveInvoiceDueDate } from "./invoice-resolve";

describe("resolveInvoiceDueDate", () => {
  it("com fechamento no mês seguinte ao vencimento, agrupa pelo ciclo real", () => {
    // fecha dia 25, vence dia 5 do mês seguinte
    const cycle = { dueDay: 5, closingDay: 25 };
    expect(resolveInvoiceDueDate("2026-09-20", cycle)).toBe("2026-10-05");
    expect(resolveInvoiceDueDate("2026-09-25", cycle)).toBe("2026-10-05");
    expect(resolveInvoiceDueDate("2026-09-26", cycle)).toBe("2026-11-05");
  });

  it("com fechamento no mesmo mês do vencimento", () => {
    // fecha dia 3, vence dia 10 do mesmo mês
    const cycle = { dueDay: 10, closingDay: 3 };
    expect(resolveInvoiceDueDate("2026-09-03", cycle)).toBe("2026-09-10");
    expect(resolveInvoiceDueDate("2026-09-04", cycle)).toBe("2026-10-10");
  });

  it("sem fechamento cadastrado, estima 7 dias antes do vencimento", () => {
    const cycle = { dueDay: 10, closingDay: null };
    // fechamento estimado: dia 3
    expect(resolveInvoiceDueDate("2026-09-03", cycle)).toBe("2026-09-10");
    expect(resolveInvoiceDueDate("2026-09-04", cycle)).toBe("2026-10-10");
  });

  it("estimativa com dueDay baixo (fechamento estimado volta pro fim do mês anterior)", () => {
    const cycle = { dueDay: 3, closingDay: null };
    // fechamento estimado: dia 24 (3 - 7 + 28); vencimento sempre no mês seguinte ao fechamento
    expect(resolveInvoiceDueDate("2026-09-24", cycle)).toBe("2026-10-03");
    expect(resolveInvoiceDueDate("2026-09-25", cycle)).toBe("2026-11-03");
  });

  it("vira o ano quando o ciclo cai em dezembro/janeiro", () => {
    const cycle = { dueDay: 5, closingDay: 25 };
    expect(resolveInvoiceDueDate("2026-12-26", cycle)).toBe("2027-02-05");
  });

  it("ajusta pro último dia do mês quando o vencimento não existe nesse mês", () => {
    const cycle = { dueDay: 31, closingDay: 20 };
    expect(resolveInvoiceDueDate("2026-02-10", cycle)).toBe("2026-02-28");
  });
});
