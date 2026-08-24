import { describe, expect, it } from "vitest";
import { daysBetween, monthKey, parseMonthKey, shortDateLabel } from "./date";

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

describe("shortDateLabel", () => {
  it("formata dia e mês abreviado em português", () => {
    expect(shortDateLabel("2026-09-05")).toBe("5 set");
    expect(shortDateLabel("2026-01-31")).toBe("31 jan");
  });
});

describe("daysBetween", () => {
  it("conta dias inteiros entre duas datas", () => {
    expect(daysBetween("2026-08-23", "2026-09-05")).toBe(13);
    expect(daysBetween("2026-08-23", "2026-08-23")).toBe(0);
  });

  it("é negativo quando a data final é antes da inicial", () => {
    expect(daysBetween("2026-09-05", "2026-08-23")).toBe(-13);
  });
});
