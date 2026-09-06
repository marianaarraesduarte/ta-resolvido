"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  Sparkles,
  Trophy,
} from "lucide-react";
import { currency, TOKENS } from "@/lib/tokens";
import { monthLabel } from "@/lib/date";
import type { FullMonthInsight } from "@/lib/full-month-insight";
import { InsightThread } from "../insights/insight-thread";
import { fetchFullMonthInsight } from "./actions";

const CHART_COLORS = [TOKENS.coral, TOKENS.amber, TOKENS.sage, TOKENS.plum, "#3E6E8E"];

function Block({
  icon,
  color,
  title,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-2xl bg-brand-card p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ color }}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function DailyLineChart({ data }: { data: { day: number; acumulado: number }[] }) {
  if (data.length < 2) return null;
  const w = 280;
  const h = 90;
  const pad = 4;
  const values = data.map((d) => d.acumulado);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const coords = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((d.acumulado - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(" ");
  const areaPath = `${path} L${coords[coords.length - 1][0].toFixed(1)},${h} L${coords[0][0].toFixed(1)},${h} Z`;
  const last = coords[coords.length - 1];
  const lineColor = values[values.length - 1] >= 0 ? TOKENS.sage : TOKENS.coral;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 90 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="fullInsightLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#fullInsightLine)" />
      <path d={path} fill="none" stroke={lineColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={lineColor} />
    </svg>
  );
}

export function AnaliseCompletaBody() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FullMonthInsight | null>(null);

  async function handlePull() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFullMonthInsight();
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

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-card px-5 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-plum/15 text-brand-plum">
          <Sparkles size={20} />
        </div>
        <div className="font-display text-base font-bold text-brand-ink">
          Análise completa de {monthLabel(new Date())}
        </div>
        <p className="max-w-[240px] text-[13px] leading-snug text-brand-ink-soft">
          Resumo com os maiores gastos nomeados (incluindo os de dentro de uma fatura), categorias, saldo dia a
          dia e um alerta se algo fugiu do padrão. Leva uns segundos pra gerar.
        </p>
        <button
          type="button"
          onClick={handlePull}
          disabled={loading}
          className="mt-1 flex items-center gap-2 rounded-2xl bg-brand-plum px-5 py-3 font-display text-[14px] font-semibold text-white disabled:opacity-60"
        >
          <Sparkles size={15} />
          {loading ? "Analisando..." : "Puxar análise completa"}
        </button>
        {error && <p className="text-xs text-brand-coral">{error}</p>}
      </div>
    );
  }

  const catMax = Math.max(...result.categoriasChart.map((c) => c.valor), 1);

  return (
    <div>
      <div className="mb-3 text-[13px] font-bold text-brand-ink-soft">
        {monthLabel(new Date())}, até dia {new Date().getDate()}
      </div>

      {result.alerta && (
        <div className="mb-3 rounded-2xl border border-brand-coral/40 bg-brand-coral/10 p-3.5">
          <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-brand-coral">
            <AlertTriangle size={12} />
            Fugiu do padrão
          </div>
          <p className="text-[13.5px] leading-relaxed text-brand-ink">{result.alerta.text}</p>
        </div>
      )}

      <InsightThread sections={result} saldoAtMonthEnd={result.resumo.entrou - result.resumo.saiu} />

      <Block icon={<Trophy size={12} />} color={TOKENS.amber} title="Os 5 maiores gastos">
        <div className="flex flex-col">
          {result.topLancamentos.map((item, i) => (
            <div
              key={`${item.description}-${i}`}
              className="flex items-center gap-2.5 border-b border-brand-line py-2 last:border-none"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-brand-line text-[10.5px] font-bold text-brand-ink-soft">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-brand-ink">{item.description}</div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-brand-ink-soft">
                  {item.categoryName ?? "Sem categoria"}
                  {item.cardName && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-plum/15 px-1.5 py-0.5 font-semibold text-brand-plum">
                      <CreditCard size={9} />
                      {item.cardName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 font-display text-[13px] font-bold text-brand-ink">
                {currency(item.amount)}
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block icon={<Sparkles size={12} />} color={TOKENS.sage} title="Por categoria">
        <div className="flex flex-col gap-2">
          {result.categoriasChart.map((c, i) => (
            <div key={c.nome} className="flex items-center gap-2">
              <span className="w-[68px] flex-shrink-0 truncate text-[11.5px] font-semibold text-brand-ink">
                {c.nome}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-bg">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(4, (c.valor / catMax) * 100)}%`,
                    background: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
              </div>
              <span className="w-[56px] flex-shrink-0 text-right text-[11.5px] font-bold text-brand-ink-soft">
                {currency(c.valor)}
              </span>
            </div>
          ))}
        </div>
      </Block>

      <Block icon={<Sparkles size={12} />} color={TOKENS.plum} title="Saldo dia a dia">
        <DailyLineChart data={result.dailySaldo} />
      </Block>
    </div>
  );
}
