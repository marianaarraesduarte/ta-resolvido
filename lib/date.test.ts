import { describe, expect, it } from "vitest";
import { monthKey, parseMonthKey } from "./date";

describe("monthKey", () => {
  it("formata ano e mês com dois dígitos", () => {
    expect(monthKey(new Date(2026, 0, 15))).toBe("2026-01");
    expect(monthKey(new Date(2026, 8, 1))).toBe("2026-09");
    expect(monthKey(new Date(2026, 11, 31))).toBe("2026-12");
  });
});

describe("parseMonthKey", () => {
  it("volta pro dia 1 do mês indicado", () => {
    const date = parseMonthKey("2026-09");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(1);
  });

  it("faz o caminho de ida e volta sem perder o mês", () => {
    const original = new Date(2026, 11, 20);
    expect(monthKey(parseMonthKey(monthKey(original)))).toBe(monthKey(original));
  });
});
