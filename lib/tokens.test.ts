import { describe, expect, it } from "vitest";
import { amountToInputValue, formatCentsInput, parseCentsInput } from "./tokens";

describe("formatCentsInput", () => {
  it("formata dígito por dígito, tipo caixa eletrônico", () => {
    expect(formatCentsInput("1")).toBe("0,01");
    expect(formatCentsInput("12")).toBe("0,12");
    expect(formatCentsInput("123")).toBe("1,23");
    expect(formatCentsInput("1234")).toBe("12,34");
  });

  it("adiciona ponto de milhar", () => {
    expect(formatCentsInput("123456")).toBe("1.234,56");
    expect(formatCentsInput("1234567")).toBe("12.345,67");
  });

  it("ignora tudo que não é dígito, não importa onde apareça", () => {
    expect(formatCentsInput("R$ 12,34")).toBe("12,34");
    expect(formatCentsInput("1.234,56")).toBe("1.234,56");
  });

  it("string vazia vira zero", () => {
    expect(formatCentsInput("")).toBe("0,00");
  });
});

describe("parseCentsInput", () => {
  it("é o inverso de formatCentsInput", () => {
    expect(parseCentsInput("1.234,56")).toBe(1234.56);
    expect(parseCentsInput("0,01")).toBe(0.01);
    expect(parseCentsInput("")).toBe(0);
  });

  it("continua correto pra valores grandes (bug antigo cortava no milhar)", () => {
    expect(parseCentsInput("12.345,67")).toBe(12345.67);
  });
});

describe("amountToInputValue", () => {
  it("formata um valor existente pro mesmo formato do campo", () => {
    expect(amountToInputValue(1800)).toBe("1.800,00");
    expect(amountToInputValue(12.5)).toBe("12,50");
  });

  it("roda-viagem com parseCentsInput", () => {
    const original = 1234.56;
    expect(parseCentsInput(amountToInputValue(original))).toBe(original);
  });
});
