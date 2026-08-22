"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setCategoryLimit(categoryId: string, amount: number | null): Promise<void> {
  if (amount != null && amount < 0) {
    throw new Error("Digite um valor válido.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado.");
  }

  const { error } = await supabase
    .from("categories")
    .update({ monthly_limit: amount && amount > 0 ? amount : null })
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra salvar o limite agora.");
  }

  revalidatePath("/app/limites");
}
