import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureMonthlyInsight } from "@/lib/monthly-insight";
import { calculateSaldo } from "@/lib/saldo";
import { toDateKey } from "@/lib/date";
import { getSelectedMonthKey } from "@/lib/month-cookie";
import { resolveViewedMonth, saldoEndDate as computeSaldoEndDate } from "@/lib/viewed-month";
import { SaldoBadge } from "./saldo-badge";
import { NavLinks } from "./nav-links";
import { Toast } from "./toast";
import { ConfirmDialogProvider } from "./confirm-dialog";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "onboarding_completed, accent_color, monthly_insights_enabled, income_basis, initial_balance, initial_balance_date, plan",
    )
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  // Análise mensal é recurso do plano Completo — não gera (nem gasta chamada
  // de IA) pra quem está no grátis. Roda depois da resposta ser enviada (via
  // after()) pra não travar o carregamento da tela esperando o Gemini.
  if (profile?.plan === "completo") {
    after(() =>
      ensureMonthlyInsight(
        supabase,
        user.id,
        profile?.monthly_insights_enabled ?? true,
        profile?.income_basis === "salary_only",
      ),
    );
  }

  // O saldo acompanha o mês selecionado: navegando pra um mês passado ou
  // futuro, ele mostra quanto ficaria de saldo até o fim daquele mês (usando
  // o que já foi lançado). No mês atual, o limite é hoje — não o mês inteiro
  // — pra não contar como já gasto/recebido algo que ainda não aconteceu.
  const selectedMonthKey = await getSelectedMonthKey();
  const viewed = resolveViewedMonth(undefined, selectedMonthKey);
  const saldoEndDate = computeSaldoEndDate(viewed);

  const [{ count: unreadInsights }, { data: entriesData }] = await Promise.all([
    supabase
      .from("monthly_insights")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
    supabase
      .from("entries")
      .select("type, amount, income_type")
      .eq("user_id", user.id)
      .gte("entry_date", profile?.initial_balance_date ?? "1900-01-01")
      .lte("entry_date", toDateKey(saldoEndDate)),
  ]);

  const saldo = calculateSaldo(entriesData ?? [], {
    initialBalance: profile?.initial_balance ?? 0,
    salaryOnly: profile?.income_basis === "salary_only",
  });

  return (
    <ConfirmDialogProvider>
      <div
        className="min-h-screen bg-brand-bg pb-24"
        style={{ "--accent": profile?.accent_color ?? "#7A5C7E" } as React.CSSProperties}
      >
        <header className="flex items-start justify-between gap-3.5 px-4 py-4">
          <SaldoBadge saldo={saldo} previsto={viewed.isFutureMonth} />
          <div className="flex flex-shrink-0 items-center gap-3 pt-1">
            <Link href="/app/insights" aria-label="Análises" className="relative text-brand-ink-soft">
              <Bell size={18} />
              {!!unreadInsights && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: "var(--accent)" }}
                  />
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                </span>
              )}
            </Link>
            <Link href="/app/config" aria-label="Configurações" className="text-brand-ink-soft">
              <Settings size={19} />
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-xs font-medium text-brand-ink-soft underline underline-offset-2"
              >
                Sair
              </button>
            </form>
          </div>
        </header>
        <Toast />
        <main>{children}</main>
        <NavLinks />
      </div>
    </ConfirmDialogProvider>
  );
}
