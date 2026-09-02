import { describe, expect, it } from "vitest";
import { isScheduledCancellation, planForHotmartEvent } from "./hotmart-webhook";

describe("planForHotmartEvent", () => {
  it("libera o Completo numa compra aprovada", () => {
    expect(planForHotmartEvent("PURCHASE_APPROVED")).toBe("completo");
    expect(planForHotmartEvent("PURCHASE_COMPLETE")).toBe("completo");
  });

  it("libera o Completo numa compra aprovada com assinatura ativa", () => {
    expect(planForHotmartEvent("PURCHASE_APPROVED", "ACTIVE")).toBe("completo");
    expect(planForHotmartEvent("PURCHASE_APPROVED", "STARTED")).toBe("completo");
  });

  it("não libera se a compra foi aprovada mas a assinatura já não tá mais ativa", () => {
    expect(planForHotmartEvent("PURCHASE_APPROVED", "CANCELLED_BY_CUSTOMER")).toBe("free");
    expect(planForHotmartEvent("PURCHASE_APPROVED", "INACTIVE")).toBe("free");
  });

  it("tira o Completo em cancelamento, reembolso, chargeback ou expiração", () => {
    expect(planForHotmartEvent("PURCHASE_CANCELED")).toBe("free");
    expect(planForHotmartEvent("PURCHASE_REFUNDED")).toBe("free");
    expect(planForHotmartEvent("PURCHASE_CHARGEBACK")).toBe("free");
    expect(planForHotmartEvent("PURCHASE_EXPIRED")).toBe("free");
  });

  it("cancelamento de assinatura não tira o acesso na hora — o mês já pago continua valendo", () => {
    expect(planForHotmartEvent("SUBSCRIPTION_CANCELLATION")).toBeNull();
    expect(isScheduledCancellation("SUBSCRIPTION_CANCELLATION")).toBe(true);
  });

  it("só o fim do período (PURCHASE_EXPIRED) derruba o acesso de quem cancelou", () => {
    expect(planForHotmartEvent("PURCHASE_EXPIRED")).toBe("free");
    expect(isScheduledCancellation("PURCHASE_EXPIRED")).toBe(false);
  });

  it("ignora eventos que não decidem nada sozinhos (boleto impresso, atraso, contestação)", () => {
    expect(planForHotmartEvent("PURCHASE_BILLET_PRINTED")).toBeNull();
    expect(planForHotmartEvent("PURCHASE_DELAYED")).toBeNull();
    expect(planForHotmartEvent("PURCHASE_PROTEST")).toBeNull();
  });

  it("ignora evento desconhecido", () => {
    expect(planForHotmartEvent("ALGO_QUE_NAO_EXISTE")).toBeNull();
  });
});
