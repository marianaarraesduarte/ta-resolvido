"use server";

import { createClient } from "@/lib/supabase/server";
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

  const { error } = await supabase.from("profiles").update({ plan: "free" }).eq("id", user.id);
  if (error) {
    throw new Error("Não deu pra cancelar agora.");
  }
}
