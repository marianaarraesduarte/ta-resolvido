import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/date";
import { currency } from "@/lib/tokens";
import { CategoryLimitRow } from "./limit-row";
import { Upsell } from "../upsell";

type CategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  monthly_limit: number | null;
};

type DespesaRow = { amount: number; category_id: string | null };

export default async function LimitesPage() {
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
      <div className="font-display text-xl font-bold text-brand-ink">Quanto posso gastar</div>
    </div>
  );

  if (profile?.plan !== "completo") {
    return (
      <div className="flex justify-center px-3 py-7">
        <div className="w-full max-w-sm">
          {header}
          <Upsell feature="Quanto posso gastar" />
        </div>
      </div>
    );
  }

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [{ data: categoriesData }, { data: despesasData }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, icon, monthly_limit")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("entries")
      .select("amount, category_id")
      .eq("user_id", user.id)
      .eq("type", "despesa")
      .gte("entry_date", toDateKey(firstDay))
      .lte("entry_date", toDateKey(lastDay)),
  ]);

  const spentByCategory = new Map<string, number>();
  for (const d of (despesasData as DespesaRow[] | null) ?? []) {
    if (!d.category_id) continue;
    spentByCategory.set(d.category_id, (spentByCategory.get(d.category_id) ?? 0) + d.amount);
  }

  const rows = ((categoriesData as CategoryRow[] | null) ?? []).map((c) => ({
    ...c,
    spent: spentByCategory.get(c.id) ?? 0,
  }));

  const overLimit = rows.filter((r) => r.monthly_limit != null && r.spent > r.monthly_limit);

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        {header}

        <p className="mb-5 text-[13.5px] leading-snug text-brand-ink-soft">
          Defina quanto você não quer passar em cada categoria. A gente avisa quando chegar perto
          ou ultrapassar.
        </p>

        {overLimit.map((r) => (
          <div key={r.id} className="mb-3 flex gap-3 rounded-2xl bg-brand-coral px-4 py-3.5">
            <Bell size={18} className="mt-0.5 flex-shrink-0 text-white" />
            <div className="text-[13px] leading-snug text-white">
              Você passou do limite de <strong>{r.name}</strong>. Já foi {currency(r.spent)} de{" "}
              {currency(r.monthly_limit as number)} combinados.
            </div>
          </div>
        ))}

        {rows.length === 0 ? (
          <div className="rounded-2xl bg-brand-card p-5">
            <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
              Nenhuma categoria ainda.
            </div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
              Crie categorias na tela de novo lançamento pra poder definir limites.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-brand-bg overflow-hidden rounded-2xl bg-brand-card">
            {rows.map((r) => (
              <CategoryLimitRow
                key={r.id}
                id={r.id}
                name={r.name}
                icon={r.icon}
                spent={r.spent}
                limit={r.monthly_limit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
