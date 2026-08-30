import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { currency, TOKENS } from "@/lib/tokens";
import { iconForCategory } from "@/lib/category-icons";
import { Upsell } from "../upsell";
import { QuitadasSection } from "./quitadas-section";

type InstallmentDbRow = {
  id: string;
  description: string;
  total_installments: number;
  monthly_amount: number;
  categories: { icon: string | null } | null;
  cards: { name: string; color: string } | null;
};

export default async function ParcelasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();

  const header = (
    <div className="mb-5 flex items-center gap-2.5">
      <Link
        href="/app/mais"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
      >
        <ChevronLeft size={18} />
      </Link>
      <div className="font-display text-xl font-bold text-brand-ink">Parcelas</div>
    </div>
  );

  if (profile?.plan !== "completo") {
    return (
      <div className="flex justify-center px-3 py-7">
        <div className="w-full max-w-sm">
          {header}
          <Upsell feature="Parcelas" />
        </div>
      </div>
    );
  }

  const [{ data: installmentsData }, { data: entriesData }] = await Promise.all([
    supabase
      .from("installments")
      .select("id, description, total_installments, monthly_amount, categories(icon), cards(name, color)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("entries")
      .select("installment_id, card_invoices(paid_at)")
      .eq("user_id", user.id)
      .not("installment_id", "is", null),
  ]);

  const paidCountById = new Map<string, number>();
  for (const e of (entriesData as unknown as
    | { installment_id: string; card_invoices: { paid_at: string | null } | null }[]
    | null) ?? []) {
    if (e.card_invoices?.paid_at) {
      paidCountById.set(e.installment_id, (paidCountById.get(e.installment_id) ?? 0) + 1);
    }
  }

  const installments = ((installmentsData as unknown as InstallmentDbRow[] | null) ?? []).map((inst) => {
    const paidCount = Math.min(inst.total_installments, paidCountById.get(inst.id) ?? 0);
    return {
      id: inst.id,
      description: inst.description,
      totalInstallments: inst.total_installments,
      monthlyAmount: inst.monthly_amount,
      categoryIcon: inst.categories?.icon ?? null,
      cardName: inst.cards?.name ?? null,
      cardColor: inst.cards?.color ?? null,
      paidCount,
      remaining: inst.total_installments - paidCount,
    };
  });

  const open = installments.filter((i) => i.remaining > 0);
  const done = installments.filter((i) => i.remaining <= 0);
  const monthlyCommitted = open.reduce((sum, i) => sum + Number(i.monthlyAmount), 0);

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        {header}

        <p className="mb-5 text-[13.5px] leading-snug text-brand-ink-soft">
          Compras parceladas que a gente identificou nas suas faturas (pelo texto tipo
          &quot;3/10&quot;). Quando você marca uma fatura como paga, as parcelas dela avançam
          sozinhas aqui.
        </p>

        {installments.length === 0 ? (
          <div className="rounded-2xl bg-brand-card p-5">
            <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
              Nenhuma parcela identificada ainda.
            </div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
              Quando uma compra de uma fatura tiver algo como &quot;3/10&quot; no nome, ela
              aparece aqui.
            </div>
          </div>
        ) : (
          <>
            {open.length > 0 && (
              <div className="mb-4 flex items-end justify-between rounded-2xl bg-brand-plum/10 px-4 py-3.5">
                <div>
                  <div className="font-display text-xl font-bold text-brand-plum [font-variant-numeric:tabular-nums]">
                    {currency(monthlyCommitted)}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-brand-ink-soft">comprometido por mês</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-brand-ink">{open.length}</div>
                  <div className="mt-0.5 text-[11.5px] text-brand-ink-soft">
                    {open.length === 1 ? "parcelamento em aberto" : "parcelamentos em aberto"}
                  </div>
                </div>
              </div>
            )}

            {open.length === 0 ? (
              <div className="rounded-2xl bg-brand-card p-5">
                <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
                  Nenhum parcelamento em aberto.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {open.map((inst) => {
                  const Icon = iconForCategory(inst.categoryIcon);
                  const pct = Math.round((inst.paidCount / inst.totalInstallments) * 100);
                  return (
                    <div key={inst.id} className="rounded-2xl bg-brand-card px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-bg">
                          <Icon size={16} className="text-brand-ink" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14.5px] font-medium text-brand-ink">
                            {inst.description}
                          </div>
                          {inst.cardName && (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-brand-ink-soft">
                              <span
                                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                style={{ background: inst.cardColor ?? "var(--accent)" }}
                              />
                              {inst.cardName}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="font-display text-[14.5px] font-bold text-brand-ink [font-variant-numeric:tabular-nums]">
                            {currency(inst.monthlyAmount)}
                          </div>
                          <div className="text-[10.5px] text-brand-ink-soft">/ mês</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11.5px] font-semibold text-brand-ink-soft">
                        <span>
                          {inst.paidCount} de {inst.totalInstallments} pagas
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-bg">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: TOKENS.plum }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <QuitadasSection items={done} />
          </>
        )}
      </div>
    </div>
  );
}
