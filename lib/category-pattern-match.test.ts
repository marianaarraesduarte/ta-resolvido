import { describe, expect, it } from "vitest";
import { matchCategoryPattern } from "./category-pattern-match";

describe("matchCategoryPattern", () => {
  const patterns = [
    { description_pattern: "IFD*IFOOD", category_id: "cat-lazer" },
    { description_pattern: "Netflix.com", category_id: "cat-lazer" },
  ];

  it("acha a categoria já ensinada quando a descrição bate (mesmo que não idêntica)", () => {
    expect(matchCategoryPattern("IFD*IFOOD SP0398", patterns)).toBe("cat-lazer");
  });

  it("bate mesmo com caixa e acento diferentes", () => {
    expect(matchCategoryPattern("netflix.com", patterns)).toBe("cat-lazer");
  });

  it("retorna null quando nenhum padrão ensinado bate", () => {
    expect(matchCategoryPattern("Posto Ipiranga", patterns)).toBeNull();
  });

  it("retorna null quando não há nenhum padrão ensinado ainda", () => {
    expect(matchCategoryPattern("IFD*IFOOD", [])).toBeNull();
  });
});
