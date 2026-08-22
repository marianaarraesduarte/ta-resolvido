import { describe, expect, it } from "vitest";
import { resolveViewedMonth, saldoEndDate } from "./viewed-month";

const TODAY = new Date(2026, 7, 22); // 22 de agosto de 2026

describe("resolveViewedMonth", () => {
  it("usa o mês atual quando não há parâmetro nem cookie", () => {
    const viewed = resolveViewedMonth(undefined, null, TODAY);
    expect(viewed.firstDay).toEqual(new Date(2026, 7, 1));
    expect(viewed.lastDay).toEqual(new Date(2026, 7, 31));
    expect(viewed.isCurrentMonth).toBe(true);
    expect(viewed.isFutureMonth).toBe(false);
  });

  it("prioriza o parâmetro da URL sobre o cookie", () => {
    const viewed = resolveViewedMonth("2026-12", "2026-09", TODAY);
    expect(viewed.firstDay).toEqual(new Date(2026, 11, 1));
  });

  it("cai pro cookie quando não há parâmetro na URL", () => {
    const viewed = resolveViewedMonth(undefined, "2026-09", TODAY);
    expect(viewed.firstDay).toEqual(new Date(2026, 8, 1));
  });

  it("marca mês passado como não-atual e não-futuro", () => {
    const viewed = resolveViewedMonth("2026-06", null, TODAY);
    expect(viewed.isCurrentMonth).toBe(false);
    expect(viewed.isFutureMonth).toBe(false);
  });

  it("marca mês futuro corretamente", () => {
    const viewed = resolveViewedMonth("2026-09", null, TODAY);
    expect(viewed.isCurrentMonth).toBe(false);
    expect(viewed.isFutureMonth).toBe(true);
  });

  it("calcula prevMonthKey/nextMonthKey virando o ano corretamente", () => {
    const viewed = resolveViewedMonth("2026-12", null, TODAY);
    expect(viewed.prevMonthKey).toBe("2026-11");
    expect(viewed.nextMonthKey).toBe("2027-01");
  });
});

describe("saldoEndDate", () => {
  it("no mês atual, o limite é hoje — não o mês inteiro", () => {
    const viewed = resolveViewedMonth(undefined, null, TODAY);
    expect(saldoEndDate(viewed, TODAY)).toEqual(TODAY);
  });

  it("num mês futuro, o limite é o fim daquele mês", () => {
    const viewed = resolveViewedMonth("2026-09", null, TODAY);
    expect(saldoEndDate(viewed, TODAY)).toEqual(new Date(2026, 8, 30));
  });

  it("num mês passado, o limite é o fim daquele mês", () => {
    const viewed = resolveViewedMonth("2026-06", null, TODAY);
    expect(saldoEndDate(viewed, TODAY)).toEqual(new Date(2026, 5, 30));
  });
});
