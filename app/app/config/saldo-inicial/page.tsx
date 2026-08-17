import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/date";
import { SaldoInicialBody } from "./saldo-inicial-body";

export default async function SaldoInicialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("initial_balance, initial_balance_date")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <Link
            href="/app/config"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="font-display text-xl font-bold text-brand-ink">Saldo inicial</div>
        </div>

        <p className="mb-5 text-[13.5px] leading-snug text-brand-ink-soft">
          É o ponto de partida do seu saldo no app: a partir da data escolhida, tudo que você
          lançar soma ou desconta daqui.
        </p>

        <div className="mb-5 rounded-xl bg-brand-amber/10 px-3.5 py-2.5">
          <p className="text-[12px] font-medium leading-snug text-brand-amber">
            Usa sempre a data de <strong>hoje</strong> e o saldo que você vê no banco{" "}
            <strong>agora</strong> — mesmo se for lançar gastos de dias anteriores do mês. Gastos
            antigos não mexem nesse saldo, só aparecem no resumo do mês.
          </p>
        </div>

        <SaldoInicialBody
          initialAmount={profile?.initial_balance ?? 0}
          initialDate={profile?.initial_balance_date ?? toDateKey(new Date())}
        />
      </div>
    </div>
  );
}
