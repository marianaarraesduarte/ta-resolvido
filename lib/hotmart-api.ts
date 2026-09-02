// Tá Resolvido — cliente da API da Hotmart pra cancelar assinatura direto do
// app (sem a usuária precisar ir até a Hotmart depois). Usa client_credentials
// (OAuth2) com as credenciais geradas em Ferramentas > Hotmart API.

const TOKEN_URL = "https://api-sec-vlc.hotmart.com/security/oauth/token";
const API_BASE = "https://developers.hotmart.com/payments/api/v1";

// Estados em que uma assinatura ainda pode estar sendo cobrada — é isso que
// procuramos pra cancelar (não só "ACTIVE" puro).
const CANCELABLE_STATUSES = ["ACTIVE", "STARTED", "DELAYED", "OVERDUE"];

async function getAccessToken(): Promise<string> {
  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  const basicToken = process.env.HOTMART_BASIC_TOKEN;

  const url = `${TOKEN_URL}?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: basicToken as string,
    },
  });

  if (!res.ok) {
    throw new Error("Não deu pra autenticar com a Hotmart agora.");
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export type CancelableSubscription = {
  subscriberCode: string;
  /**
   * Data da próxima cobrança — é até quando o período já pago vai. Nula
   * quando a Hotmart não devolve o campo.
   */
  paidUntil: Date | null;
};

/**
 * Busca a assinatura ativa (ou atrasada) desse e-mail. Retorna null se não
 * achar nenhuma — ex: quem ganhou o Completo manualmente, sem ter comprado de
 * verdade na Hotmart.
 */
export async function findCancelableSubscription(
  email: string,
): Promise<CancelableSubscription | null> {
  const token = await getAccessToken();
  const statusParams = CANCELABLE_STATUSES.map((s) => `status=${s}`).join("&");
  const url = `${API_BASE}/subscriptions?subscriber_email=${encodeURIComponent(email)}&${statusParams}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Não deu pra consultar a assinatura na Hotmart agora.");
  }

  const data = (await res.json()) as {
    items?: { subscriber_code: string; date_next_charge?: number }[];
  };
  const subscription = data.items?.[0];
  if (!subscription) return null;

  const nextCharge = subscription.date_next_charge;
  const paidUntil =
    typeof nextCharge === "number" && Number.isFinite(nextCharge) ? new Date(nextCharge) : null;

  return { subscriberCode: subscription.subscriber_code, paidUntil };
}

export async function cancelHotmartSubscription(subscriberCode: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/subscriptions/${subscriberCode}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ send_mail: true }),
  });

  if (!res.ok) {
    throw new Error("Não deu pra cancelar a assinatura na Hotmart agora.");
  }
}
