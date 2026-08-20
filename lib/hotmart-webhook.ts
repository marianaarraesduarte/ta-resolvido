// Tá Resolvido — lógica pura do webhook do Hotmart (sem I/O), pra dar pra
// testar sem precisar simular uma requisição HTTP de verdade.

const UPGRADE_EVENTS = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);
const DOWNGRADE_EVENTS = new Set([
  "PURCHASE_CANCELED",
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_EXPIRED",
  // Evento próprio de assinatura — dispara quando a pessoa cancela pelo
  // painel dela, mesmo sem nenhuma cobrança ter falhado.
  "SUBSCRIPTION_CANCELLATION",
]);

/**
 * A partir do nome do evento (e, se for compra aprovada, do status da
 * assinatura), decide se a compra deve liberar ou tirar o Plano Completo.
 * Retorna null pra eventos que não devem mexer no plano (boleto impresso,
 * atraso, contestação) — esses ficam pra Hotmart resolver sozinha depois
 * (vira PURCHASE_APPROVED se pagar, ou PURCHASE_CANCELED/EXPIRED se não).
 */
export function planForHotmartEvent(
  event: string,
  subscriptionStatus?: string | null,
): "completo" | "free" | null {
  if (UPGRADE_EVENTS.has(event)) {
    // Se veio o status da assinatura e ele diz que não tá mais ativa,
    // confia nele em vez do nome do evento.
    if (subscriptionStatus && !["ACTIVE", "STARTED"].includes(subscriptionStatus)) {
      return "free";
    }
    return "completo";
  }

  if (DOWNGRADE_EVENTS.has(event)) {
    return "free";
  }

  return null;
}
