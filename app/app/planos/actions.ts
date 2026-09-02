"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelHotmartSubscription, findCancelableSubscription } from "@/lib/hotmart-api";
import { accessUntilAfterCancel } from "@/lib/subscription-access";

export type CancelResult = {
  /** Até quando o Completo continua valendo, em ISO. */
  accessUntil: string;
};

/**
 * Cancela a assinatura na Hotmart e agenda o rebaixamento do plano pro fim do
 * período que a pessoa já pagou — em vez de tirar o acesso na hora.
 *
 * O comportamento antigo rebaixava na mesma hora: quem cancelasse dia 3
 * perdia no dia 3 o mês inteiro já pago. O plano continua "completo" no banco
 * até a data guardada em access_until, e o cron diário faz a virada — assim
 * nenhuma tela precisou aprender uma regra nova de acesso.
 */
export async function cancelSubscription(): Promise<CancelResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }

  // Só cancela na Hotmart se achar uma assinatura de verdade nesse e-mail —
  // quem ganhou o Completo manualmente (ex: testers do beta) não tem uma, e
  // só precisa ser desativado aqui no app mesmo.
  const subscription = await findCancelableSubscription(user.email);
  if (subscription) {
    await cancelHotmartSubscription(subscription.subscriberCode);
  }

  const accessUntil = accessUntilAfterCancel(subscription?.paidUntil ?? null);
  if (!subscription?.paidUntil) {
    console.warn(
      "cancelSubscription: Hotmart não informou a próxima cobrança; usando o prazo de segurança.",
    );
  }

  // A coluna `plan` (e `access_until`) não é gravável pela própria usuária
  // desde a migration 0023 — quem escreve é a service role, igual ao webhook.
  // O filtro por id continua sendo o do usuário da sessão.
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ access_until: accessUntil.toISOString() })
    .eq("id", user.id);

  if (error) {
    console.error("cancelSubscription: falha ao agendar o fim do acesso", error);
    throw new Error("Não deu pra cancelar agora.");
  }

  return { accessUntil: accessUntil.toISOString() };
}
