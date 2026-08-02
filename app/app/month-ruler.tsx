"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { currency, levelFor, LEVEL_COLOR, TOKENS } from "@/lib/tokens";
import { dayOfMonth } from "@/lib/date";

export type Entry = {
  id: string;
  type: "despesa" | "receita";
  amount: number;
  description: string;
  entry_date: string;
  category_id: string | null;
  income_type: string | null;
};

const DAY_WIDTH = 22;

type DayBucket = { despesas: Entry[]; receitas: Entry[] };

function tooltipLabel(items: Entry[], total: number): string {
  if (items.length === 1) return `${items[0].description} — ${currency(items[0].amount)}`;
  return `${items.length} lançamentos — ${currency(total)}`;
}

export function MonthRuler({
  monthName,
  today,
  daysInMonth,
  entries,
}: {
  monthName: string;
  today: number;
  daysInMonth: number;
  entries: Entry[];
}) {
  const [selected, setSelected] = useState<{ day: number; type: "despesa" | "receita" } | null>(
    null,
  );

  const hasEntries = entries.length > 0;
  const despesas = entries.filter((e) => e.type === "despesa");
  const receitas = entries.filter((e) => e.type === "receita");
  const despesaAvg =
    despesas.length > 0 ? despesas.reduce((sum, e) => sum + e.amount, 0) / despesas.length : 0;

  const byDay = new Map<number, DayBucket>();
  for (const entry of entries) {
    const day = dayOfMonth(entry.entry_date);
    const bucket = byDay.get(day) ?? { despesas: [], receitas: [] };
    if (entry.type === "despesa") bucket.despesas.push(entry);
    else bucket.receitas.push(entry);
    byDay.set(day, bucket);
  }

  const receitaSoFar = receitas
    .filter((e) => dayOfMonth(e.entry_date) <= today)
    .reduce((sum, e) => sum + e.amount, 0);
  const despesaSoFar = despesas
    .filter((e) => dayOfMonth(e.entry_date) <= today)
    .reduce((sum, e) => sum + e.amount, 0);

  const selectedItems = selected
    ? (byDay.get(selected.day)?.[selected.type === "despesa" ? "despesas" : "receitas"] ?? [])
    : [];

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-5">
          <div className="font-display text-xs font-bold uppercase tracking-wide text-brand-ink opacity-55">
            Tá Resolvido
          </div>
          <div className="mt-0.5 font-display text-3xl font-bold text-brand-ink">{monthName}</div>
        </div>

        {hasEntries ? (
          <div className="mb-5 flex gap-2.5">
            <div className="flex-1 rounded-2xl bg-brand-card px-4 py-3.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <ArrowUpCircle size={13} className="text-brand-sage" />
                <span className="text-[11.5px] text-brand-ink-soft">Entrou</span>
              </div>
              <div className="font-display text-xl font-bold text-brand-ink">
                {currency(receitaSoFar)}
              </div>
            </div>
            <div className="flex-1 rounded-2xl bg-brand-card px-4 py-3.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <ArrowDownCircle size={13} className="text-brand-coral" />
                <span className="text-[11.5px] text-brand-ink-soft">Saiu</span>
              </div>
              <div className="font-display text-xl font-bold text-brand-ink">
                {currency(despesaSoFar)}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl bg-brand-card p-5">
            <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
              Mês novinho em folha.
            </div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
              Marque o primeiro gasto quando aparecer.
            </div>
          </div>
        )}

        <div className="mb-1.5 text-[13px] font-semibold text-brand-ink">Régua do mês</div>
        <div className="mb-4 overflow-x-auto rounded-[20px] bg-brand-card p-3.5">
          {hasEntries && (
            <div className="mb-0.5 text-[10px] font-semibold text-brand-sage">↑ entrou</div>
          )}
          <div
            className="relative"
            style={{ minWidth: daysInMonth * DAY_WIDTH, height: hasEntries ? 130 : 76 }}
          >
            <div
              className="absolute left-0 right-0 bg-brand-line"
              style={{ top: hasEntries ? 65 : 26, height: 2 }}
            />
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isToday = day === today;
              const bucket = byDay.get(day);
              const despesaTotal = bucket?.despesas.reduce((sum, e) => sum + e.amount, 0) ?? 0;
              const receitaTotal = bucket?.receitas.reduce((sum, e) => sum + e.amount, 0) ?? 0;
              const level = bucket?.despesas.length ? levelFor(despesaTotal, despesaAvg) : null;
              const isSelectedDespesa = selected?.day === day && selected.type === "despesa";
              const isSelectedReceita = selected?.day === day && selected.type === "receita";

              return (
                <div
                  key={day}
                  className="absolute top-0 flex h-full flex-col items-center"
                  style={{ left: (day - 1) * DAY_WIDTH, width: DAY_WIDTH }}
                >
                  {hasEntries && (
                    <div className="flex flex-1 items-end justify-center">
                      {bucket?.receitas.length ? (
                        <div className="group relative mb-1.5">
                          <button
                            type="button"
                            onClick={() => setSelected({ day, type: "receita" })}
                            aria-label={`Entradas do dia ${day}`}
                            className={
                              isSelectedReceita
                                ? "h-3.5 w-3.5 rounded-full bg-brand-sage ring-2 ring-brand-ink"
                                : "h-2.5 w-2.5 rounded-full bg-brand-sage"
                            }
                          />
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-ink px-2 py-1 text-[11px] font-medium text-brand-card opacity-0 transition-opacity group-hover:opacity-100">
                            {tooltipLabel(bucket.receitas, receitaTotal)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div
                    className={isToday ? "w-px bg-[var(--accent)]" : "w-px bg-brand-line"}
                    style={{ height: isToday ? 14 : 8 }}
                  />
                  <div
                    className={
                      isToday
                        ? "mt-0.5 text-[10px] font-bold text-brand-ink"
                        : "mt-0.5 text-[10px] text-brand-ink-soft"
                    }
                  >
                    {day}
                  </div>
                  {!hasEntries && isToday && (
                    <div className="mt-0.5 whitespace-nowrap text-[8.5px] font-bold text-[var(--accent)]">
                      HOJE
                    </div>
                  )}

                  {hasEntries && (
                    <div className="mt-1 flex flex-1 items-start justify-center">
                      {level ? (
                        <div className="group relative">
                          <button
                            type="button"
                            onClick={() => setSelected({ day, type: "despesa" })}
                            aria-label={`Gastos do dia ${day}`}
                            className={
                              isSelectedDespesa
                                ? "h-3.5 w-3.5 rounded-full ring-2 ring-brand-ink"
                                : "h-2.5 w-2.5 rounded-full"
                            }
                            style={{ background: LEVEL_COLOR[level] }}
                          />
                          <div className="pointer-events-none absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-ink px-2 py-1 text-[11px] font-medium text-brand-card opacity-0 transition-opacity group-hover:opacity-100">
                            {tooltipLabel(bucket!.despesas, despesaTotal)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {hasEntries && (
            <div className="mt-0.5 text-[10px] font-semibold text-brand-coral">↓ saiu</div>
          )}
        </div>

        {selected && selectedItems.length > 0 && (
          <div className="mb-4 rounded-2xl bg-brand-card px-4 py-3.5">
            <div className="mb-2 text-xs text-brand-ink-soft">
              Dia {selected.day} · {selected.type === "receita" ? "entrada" : "saída"}
              {selectedItems.length > 1 ? ` · ${selectedItems.length} lançamentos` : ""}
            </div>
            <div className="flex flex-col gap-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-medium text-brand-ink">
                    {item.description}
                  </span>
                  <span
                    className="whitespace-nowrap font-display text-[15px] font-bold"
                    style={{
                      color:
                        selected.type === "receita"
                          ? TOKENS.sage
                          : LEVEL_COLOR[levelFor(item.amount, despesaAvg)],
                    }}
                  >
                    {selected.type === "receita" ? "+" : "-"}
                    {currency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasEntries && (
          <div className="mb-7 flex flex-wrap gap-3.5">
            {(
              [
                [TOKENS.sage, "entrada / gasto leve"],
                [TOKENS.amber, "gasto médio"],
                [TOKENS.coral, "gasto alto"],
              ] as const
            ).map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-[11.5px] text-brand-ink-soft">{label}</span>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/app/novo"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] py-3.5 font-display text-[15px] font-semibold text-brand-card"
        >
          <Plus size={16} />
          Marcar lançamento
        </Link>
      </div>
    </div>
  );
}
