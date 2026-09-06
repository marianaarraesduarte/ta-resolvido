import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AnaliseCompletaBody } from "./analise-completa-body";
import { Upsell } from "../upsell";

// Passa pelo Gemini (duas chamadas no pior caso) — mesmo motivo do
// maxDuration em app/app/insights/page.tsx.
export const maxDuration = 60;

export default async function AnaliseCompletaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();

  const header = (
    <div className="mb-5 flex items-center gap-2.5">
      <Link
        href="/app"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
      >
        <ChevronLeft size={18} />
      </Link>
      <div className="font-display text-xl font-bold text-brand-ink">Análise completa do mês</div>
    </div>
  );

  if (profile?.plan !== "completo") {
    return (
      <div className="flex justify-center px-3 py-7">
        <div className="w-full max-w-sm">
          {header}
          <Upsell feature="Análise completa do mês" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        {header}
        <AnaliseCompletaBody />
      </div>
    </div>
  );
}
