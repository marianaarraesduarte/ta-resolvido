import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/tokens";
import { ConfigBody } from "./config-body";

export default async function ConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "separate_by_account, accent_color, hide_goals_screen, monthly_insights_enabled, initial_balance",
    )
    .eq("id", user.id)
    .single();

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Link
            href="/app"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="font-display text-xl font-bold text-brand-ink">Configurações</div>
        </div>

        <ConfigBody
          initialSeparateByAccount={profile?.separate_by_account ?? false}
          initialAccentColor={profile?.accent_color ?? "#D9A441"}
          initialHideGoalsScreen={profile?.hide_goals_screen ?? false}
          initialMonthlyInsightsEnabled={profile?.monthly_insights_enabled ?? true}
        />

        <Link
          href="/app/config/saldo-inicial"
          className="mt-2 flex items-center justify-between rounded-2xl bg-brand-card px-[18px] py-4"
        >
          <div>
            <div className="text-[14.5px] font-medium text-brand-ink">Saldo inicial</div>
            <div className="mt-0.5 text-xs text-brand-ink-soft">
              {currency(profile?.initial_balance ?? 0)}
            </div>
          </div>
          <ChevronRight size={18} className="text-brand-ink-soft" />
        </Link>

        <Link
          href="/app/config/categorias"
          className="mt-2.5 flex items-center justify-between rounded-2xl bg-brand-card px-[18px] py-4"
        >
          <div>
            <div className="text-[14.5px] font-medium text-brand-ink">Categorias</div>
            <div className="mt-0.5 text-xs text-brand-ink-soft">
              Renomeie, crie ou apague categorias
            </div>
          </div>
          <ChevronRight size={18} className="text-brand-ink-soft" />
        </Link>

        <Link
          href="/app/config/instalar"
          className="mt-2.5 flex items-center justify-between rounded-2xl bg-brand-card px-[18px] py-4"
        >
          <div>
            <div className="text-[14.5px] font-medium text-brand-ink">Instalar o app</div>
            <div className="mt-0.5 text-xs text-brand-ink-soft">
              Coloque na tela inicial do seu celular
            </div>
          </div>
          <ChevronRight size={18} className="text-brand-ink-soft" />
        </Link>
      </div>
    </div>
  );
}
