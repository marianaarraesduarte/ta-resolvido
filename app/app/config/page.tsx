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
    .select("separate_by_account, accent_color, monthly_insights_enabled, initial_balance, guide_active")
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
          initialAccentColor={profile?.accent_color ?? "#7A5C7E"}
          initialMonthlyInsightsEnabled={profile?.monthly_insights_enabled ?? true}
          initialGuideActive={profile?.guide_active ?? false}
        />

        <div className="mt-2 overflow-hidden rounded-2xl bg-brand-card">
          <Link
            href="/app/config/cartoes"
            className="flex items-center justify-between px-[18px] py-4"
          >
            <div>
              <div className="text-[14.5px] font-medium text-brand-ink">Meus cartões</div>
              <div className="mt-0.5 text-xs text-brand-ink-soft">
                Nomeie e escolha uma cor pra cada cartão de crédito
              </div>
            </div>
            <ChevronRight size={18} className="text-brand-ink-soft" />
          </Link>

          <Link
            href="/app/config/saldo-inicial"
            className="flex items-center justify-between border-t border-brand-bg px-[18px] py-4"
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
            href="/app/config/instalar"
            className="flex items-center justify-between border-t border-brand-bg px-[18px] py-4"
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
    </div>
  );
}
