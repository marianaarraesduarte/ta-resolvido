import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planForHotmartEvent } from "@/lib/hotmart-webhook";

type HotmartPayload = {
  event: string;
  data?: {
    // Eventos de compra (PURCHASE_*) trazem o e-mail em "buyer"; o evento
    // de assinatura (SUBSCRIPTION_CANCELLATION) traz em "subscriber".
    buyer?: { email?: string };
    subscriber?: { email?: string };
    subscription?: { status?: string };
  };
};

export async function POST(request: Request) {
  const hottok = request.headers.get("x-hotmart-hottok");
  if (!hottok || hottok !== process.env.HOTMART_HOTTOK) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const payload = (await request.json()) as HotmartPayload;
  const targetPlan = planForHotmartEvent(payload.event, payload.data?.subscription?.status);
  const email = payload.data?.buyer?.email ?? payload.data?.subscriber?.email;

  if (!targetPlan || !email) {
    return NextResponse.json({ ignored: true });
  }

  const supabase = createAdminClient();

  const { data: userId, error: lookupError } = await supabase.rpc("get_user_id_by_email", {
    p_email: email,
  });

  if (lookupError || !userId) {
    if (lookupError) {
      console.error("hotmart webhook: falha ao buscar usuária por e-mail", lookupError);
    }
    // Comprou mas ainda não tem conta no app (ou o e-mail não bate) — não é
    // erro do lado da Hotmart, então devolve 200 pra ela não ficar reenviando.
    return NextResponse.json({ ignored: true, reason: "usuária não encontrada" });
  }

  await supabase.from("profiles").update({ plan: targetPlan }).eq("id", userId);

  return NextResponse.json({ ok: true, plan: targetPlan });
}
