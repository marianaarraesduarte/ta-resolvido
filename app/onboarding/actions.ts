"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ExperienceLevel = "iniciante" | "intermediario" | "avancado";

export async function completeOnboarding(
  initialBalance: number,
  experienceLevel: ExperienceLevel | null,
  guided: boolean,
): Promise<void> {
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
      experience_level: experienceLevel,
      guide_active: guided,
    })
    .eq("id", user.id);

  redirect("/app");
}
