import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isScheduledCancellation, planForHotmartEvent } from "@/lib/hotmart-webhook";
import { accessUntilAfterCancel } from "@/lib/subscription-access";
import { sendEmail } from "@/lib/resend-email";
import { ADMIN_EMAIL } from "@/lib/admin";

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

/**
 * Avisa a administradora que alguém pagou e não recebeu o acesso, porque o
 * e-mail da compra não bate com nenhuma conta.
 *
 * É best-effort de propósito: se o envio falhar, o webhook ainda precisa
 * devolver 200, senão a Hotmart fica reenviando o mesmo evento pra sempre.
 */
async function notifyOrphanPurchase(buyerEmail: string, event: string): Promise<void> {
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Compra sem conta no app: ${buyerEmail}`,
      html: `
<div style="max-width:460px;font-family:Arial,sans-serif;color:#1F3A3D;line-height:1.5;">
  <p style="font-size:15px;">
    Uma compra foi aprovada na Hotmart, mas <b>nenhuma conta do app usa esse e-mail</b>,
    então o Plano Completo não foi liberado.
  </p>
  <p style="font-size:15px;">
    E-mail da compra: <b>${buyerEmail}</b><br>
    Evento: ${event}
  </p>
  <p style="font-size:14px;color:#5B6E6C;">
    Provavelmente a pessoa comprou com um e-mail e criou a conta com outro. Vale escrever
    pra ela perguntando com qual e-mail entrou no app, e liberar o plano na mão.
  </p>
</div>`,
    });
  } catch (err) {
    console.error("hotmart webhook: falha ao avisar sobre compra órfã", err);
  }
}

export async function POST(request: Request) {
  const hottok = request.headers.get("x-hotmart-hottok");
  if (!hottok || hottok !== process.env.HOTMART_HOTTOK) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const payload = (await request.json()) as HotmartPayload;
  const targetPlan = planForHotmartEvent(payload.event, payload.data?.subscription?.status);
  const scheduledCancellation = isScheduledCancellation(payload.event);
  const email = payload.data?.buyer?.email ?? payload.data?.subscriber?.email;

  if ((!targetPlan && !scheduledCancellation) || !email) {
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
    //
    // Antes isso morria aqui em silêncio: a pessoa pagava, não recebia, e a
    // primeira notícia vinha de uma mensagem irritada dias depois. Agora o
    // aviso chega na hora, com o e-mail da compra, e dá pra liberar na mão em
    // minutos. Acontece bastante: comprar com um e-mail e ter conta com outro
    // é rotina.
    if (targetPlan === "completo") {
      await notifyOrphanPurchase(email, payload.event);
    }
    return NextResponse.json({ ignored: true, reason: "usuária não encontrada" });
  }

  // Cancelamento feito pelo painel da Hotmart: o acesso não cai agora, só no
  // fim do período já pago. Agendamos uma data de segurança pro caso de o
  // PURCHASE_EXPIRED nunca chegar — sem ela, a pessoa ficaria com o Completo
  // pra sempre. Não sobrescreve um agendamento que já exista (ex: quem
  // cancelou pelo app, onde a data vem da própria Hotmart e é mais exata).
  if (scheduledCancellation) {
    const { data: current } = await supabase
      .from("profiles")
      .select("access_until")
      .eq("id", userId)
      .single();

    if (!current?.access_until) {
      await supabase
        .from("profiles")
        .update({ access_until: accessUntilAfterCancel(null).toISOString() })
        .eq("id", userId);
    }

    return NextResponse.json({ ok: true, scheduled: true });
  }

  // Sobra só o caminho que muda o plano de fato. (A guarda lá em cima já
  // barrou evento sem plano nem agendamento; esta existe pro TypeScript.)
  if (!targetPlan) {
    return NextResponse.json({ ignored: true });
  }

  // Assinar de novo apaga qualquer fim de acesso que estivesse agendado.
  await supabase
    .from("profiles")
    .update(targetPlan === "completo" ? { plan: targetPlan, access_until: null } : { plan: targetPlan })
    .eq("id", userId);

  return NextResponse.json({ ok: true, plan: targetPlan });
}
