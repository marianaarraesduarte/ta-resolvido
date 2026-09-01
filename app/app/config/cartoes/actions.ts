"use server";

import { createClient } from "@/lib/supabase/server";

export type Card = { id: string; name: string; color: string };

// Reaproveita um cartão já existente com o mesmo nome (sem diferenciar
// maiúscula/minúscula) em vez de criar duplicado — mesma lógica que
// resolveInvoiceId já usa pra fatura, pra não repetir o problema com
// cartão (ex: "Nubank" cadastrado de novo sem perceber que já existia).
export async function createCard(name: string, color: string): Promise<Card> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Digite um nome pro cartão.");

  const { data: existing } = await supabase
    .from("cards")
    .select("id, name, color")
    .eq("user_id", user.id)
    .ilike("name", trimmed)
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("cards")
    .insert({ user_id: user.id, name: trimmed, color })
    .select("id, name, color")
    .single();

  if (error) throw new Error("Não deu pra criar esse cartão agora.");

  return data;
}

export async function updateCard(id: string, name: string, color: string): Promise<Card> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Digite um nome pro cartão.");

  const { data, error } = await supabase
    .from("cards")
    .update({ name: trimmed, color })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, color")
    .single();

  if (error) throw new Error("Não deu pra salvar esse cartão agora.");

  return data;
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase.from("cards").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw new Error("Não deu pra excluir esse cartão agora.");
}
