import { describe, expect, it } from "vitest";
import { effectiveDateOf } from "./saldo-entries";

describe("effectiveDateOf", () => {
  it("usa a data de vencimento quando não tem fatura vinculada", () => {
    const entry = { entry_date: "2026-10-05", card_invoice_id: null };
    expect(effectiveDateOf(entry, new Map())).toBe("2026-10-05");
  });

  it("usa a data de vencimento quando a fatura ainda não foi paga", () => {
    const entry = { entry_date: "2026-10-05", card_invoice_id: "inv-1" };
    expect(effectiveDateOf(entry, new Map())).toBe("2026-10-05");
  });

  it("usa a data do pagamento antecipado, não a de vencimento", () => {
    const entry = { entry_date: "2026-10-05", card_invoice_id: "inv-1" };
    const paidDates = new Map([["inv-1", "2026-09-20"]]);
    expect(effectiveDateOf(entry, paidDates)).toBe("2026-09-20");
  });
});
