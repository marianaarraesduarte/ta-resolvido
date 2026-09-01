import { describe, expect, it } from "vitest";
import { checkAmountAnomaly } from "./anomaly-check";

describe("checkAmountAnomaly", () => {
  it("não marca anômalo sem histórico suficiente", () => {
    expect(checkAmountAnomaly(10000, [100])).toEqual({ isAnomalous: false, average: 0 });
    expect(checkAmountAnomaly(10000, [])).toEqual({ isAnomalous: false, average: 0 });
  });

  it("marca anômalo quando bem acima da média", () => {
    const result = checkAmountAnomaly(1000, [300, 400, 500]);
    expect(result.isAnomalous).toBe(true);
    expect(result.average).toBeCloseTo(400);
  });

  it("não marca anômalo quando perto da média", () => {
    const result = checkAmountAnomaly(450, [300, 400, 500]);
    expect(result.isAnomalous).toBe(false);
    expect(result.average).toBeCloseTo(400);
  });

  it("não marca anômalo exatamente no limite do threshold", () => {
    // média 400, limite é 400*1.8 = 720 — 720 não é > 720
    const result = checkAmountAnomaly(720, [300, 400, 500]);
    expect(result.isAnomalous).toBe(false);
  });
});
