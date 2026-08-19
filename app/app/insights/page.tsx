import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { monthLabel } from "@/lib/date";
import { Upsell } from "../upsell";

type InsightRow = { id: string; month_start: string; content: string; read_at: string | null };

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const header = (
    <div className="mb-5 flex items-center gap-2.5">
      <Link
        href="/app"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
      >
        <ChevronLeft size={18} />
      </Link>
      <div className="font-display text-xl font-bold text-brand-ink">Comentário do mês</div>
    </div>
  );

  const { data: planRow } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (planRow?.plan !== "completo") {
    return (
      <div className="flex justify-center px-3 py-7">
        <div className="w-full max-w-sm">
          {header}
          <Upsell feature="Comentário do mês" />
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from("monthly_insights")
    .select("id, month_start, content, read_at")
    .eq("user_id", user.id)
    .order("month_start", { ascending: false });

  const insights = (data as InsightRow[] | null) ?? [];

  const unreadIds = insights.filter((i) => !i.read_at).map((i) => i.id);
  if (unreadIds.length > 0) {
    await supabase
      .from("monthly_insights")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        {header}

        {insights.length === 0 ? (
          <div className="rounded-2xl bg-brand-card p-5">
            <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
              Nada por aqui ainda.
            </div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
              Assim que fechar um mês com gastos marcados, a gente escreve um comentário rápido
              sobre como foi.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {insights.map((insight) => {
              const date = new Date(`${insight.month_start}T00:00:00`);
              return (
                <div key={insight.id} className="rounded-2xl bg-brand-card p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={14} style={{ color: "var(--accent)" }} />
                    <span className="text-[13px] font-semibold text-brand-ink">
                      {monthLabel(date)}
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-brand-ink">{insight.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
