"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { monthLabel } from "@/lib/date";
import type { MonthlyInsightSections } from "@/lib/monthly-insight";
import { InsightThread } from "./insight-thread";
import { fetchPartialInsight } from "./actions";

export function PartialInsightButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    sections: MonthlyInsightSections;
    saldoAtMonthEnd: number;
  } | null>(null);

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPartialInsight();
      if (!data) {
        setError("Ainda não tem gasto ou receita marcado esse mês pra analisar.");
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu pra analisar agora.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mb-6">
        <div className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-brand-ink-soft">
          {monthLabel(new Date())} até agora
        </div>
        <InsightThread sections={result.sections} saldoAtMonthEnd={result.saldoAtMonthEnd} />
        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-3 text-[12.5px] font-medium text-brand-ink-soft underline underline-offset-2"
        >
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-brand-line py-3.5 font-display text-sm font-semibold text-brand-ink-soft disabled:opacity-60"
      >
        <Sparkles size={15} />
        {loading ? "Analisando..." : "Ver como tá indo esse mês"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-brand-coral">{error}</p>}
    </div>
  );
}
