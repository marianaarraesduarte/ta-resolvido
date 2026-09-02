"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelHotmartSubscription, findCancelableSubscriberCode } from "@/lib/hotmart-api";

export async function cancelSubscription(): Promise<void> {
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
  const subscriberCode = await findCancelableSubscriberCode(user.email);
  if (subscriberCode) {
    await cancelHotmartSubscription(subscriberCode);
  }

  // A coluna `plan` não é mais gravável pela própria usuária (migration 0023,
  // que fechava a brecha de virar "completo" pelo navegador sem pagar) — quem
  // rebaixa o plano é a service role, igual ao webhook da Hotmart. O filtro
  // por id continua sendo o do usuário da sessão, então o alcance é o mesmo
  // de antes: só a própria conta.
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ plan: "free" }).eq("id", user.id);
  if (error) {
    console.error("cancelSubscription: falha ao rebaixar o plano", error);
    throw new Error("Não deu pra cancelar agora.");
  }
}
