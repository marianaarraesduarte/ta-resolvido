"use server";

import { createClient } from "@/lib/supabase/server";

export async function setReminderFrequency(freq: 0 | 1 | 2 | 4): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase
    .from("profiles")
    .update({ reminder_frequency: freq })
    .eq("id", user.id);

  if (error) throw new Error("Não deu pra salvar agora.");
}
