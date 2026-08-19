import { describe, expect, it } from "vitest";
import { namesMatch } from "./text-match";

describe("namesMatch", () => {
  it("bate com nomes idênticos", () => {
    expect(namesMatch("Aluguel", "Aluguel")).toBe(true);
  });

  it("ignora maiúscula/minúscula e acento", () => {
    expect(namesMatch("Água", "AGUA")).toBe(true);
    expect(namesMatch("mercado", "MERCADO")).toBe(true);
  });

  it("bate quando um nome contém o outro, em qualquer direção", () => {
    expect(namesMatch("Aluguel", "Aluguel apto agosto")).toBe(true);
    expect(namesMatch("Aluguel apto agosto", "Aluguel")).toBe(true);
  });

  it("não bate com nomes sem relação", () => {
    expect(namesMatch("Aluguel", "Mercado")).toBe(false);
  });

  it("não bate quando algum dos dois está vazio", () => {
    expect(namesMatch("", "Aluguel")).toBe(false);
    expect(namesMatch("Aluguel", "")).toBe(false);
    expect(namesMatch("   ", "Aluguel")).toBe(false);
  });
});
