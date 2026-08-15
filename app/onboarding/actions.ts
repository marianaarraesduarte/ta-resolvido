"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(initialBalance: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      initial_balance: initialBalance,
      initial_balance_date: new Date().toISOString().slice(0, 10),
    })
    .eq("id", user.id);

  redirect("/app");
}
