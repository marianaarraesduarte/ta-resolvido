import { describe, expect, it } from "vitest";
import { pickTeaser } from "./assistant-data";

describe("pickTeaser", () => {
  const pool = ["a", "b", "c"];

  it("mantém a mesma frase por 3 dias seguidos", () => {
    expect(pickTeaser(pool, 1)).toBe("a");
    expect(pickTeaser(pool, 2)).toBe("a");
    expect(pickTeaser(pool, 3)).toBe("a");
    expect(pickTeaser(pool, 4)).toBe("b");
    expect(pickTeaser(pool, 5)).toBe("b");
    expect(pickTeaser(pool, 6)).toBe("b");
    expect(pickTeaser(pool, 7)).toBe("c");
  });

  it("dá a volta na lista sem estourar o índice", () => {
    expect(pickTeaser(pool, 10)).toBe("a");
    expect(pickTeaser(pool, 31)).toBe(pickTeaser(pool, 31 - 9));
  });
});
