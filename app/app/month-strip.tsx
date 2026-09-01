"use client";

import { useEffect, useRef } from "react";
import { monthKey } from "@/lib/date";
import { TOKENS } from "@/lib/tokens";
import { goToMonth } from "./month-actions";
import { MonthPicker, MONTH_ABBRS } from "./month-picker";

/**
 * Fita horizontal com os 12 meses do ano em exibição, só — nunca passa pra
 * outro ano dentro da fita, porque aí a abreviação repetiria (janeiro de
 * 2026 e de 2027 apareceriam iguais, sem nada dizendo qual é qual). Trocar
 * de ano é sempre pelo seletor completo, tocando no chip do mês atual.
 * Ele vira um chip destacado que abre esse seletor; os outros pulam direto
 * pro mês tocado. Desfoque sutil nas bordas avisa sem escrever nada que dá
 * pra rolar mais — sempre abre já centralizada no mês atual.
 */
export function MonthStrip({
  path,
  monthName,
  viewedYear,
  viewedMonth,
}: {
  path: string;
  monthName: string;
  viewedYear: number;
  /** 0-indexado, igual Date.getMonth() */
  viewedMonth: number;
}) {
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [viewedYear, viewedMonth]);

  const items = Array.from({ length: 12 }, (_, monthIndex) => ({
    monthIndex,
    key: monthKey(new Date(viewedYear, monthIndex, 1)),
    label: MONTH_ABBRS[monthIndex],
  }));

  return (
    <div className="relative">
      <div className="flex gap-1.5 overflow-x-auto px-0.5 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) =>
          item.monthIndex === viewedMonth ? (
            <div key={item.key} ref={currentRef} className="flex-shrink-0">
              <MonthPicker
                path={path}
                monthName={monthName}
                shortLabel={item.label}
                viewedYear={viewedYear}
                viewedMonth={viewedMonth}
              />
            </div>
          ) : (
            <form key={item.key} action={goToMonth.bind(null, path, item.key)}>
              <button
                type="submit"
                className="flex-shrink-0 rounded-full bg-brand-card px-3.5 py-2 font-display text-[13px] font-semibold text-brand-ink-soft"
              >
                {item.label}
              </button>
            </form>
          ),
        )}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-6"
        style={{ background: `linear-gradient(90deg, ${TOKENS.bg}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-6"
        style={{ background: `linear-gradient(270deg, ${TOKENS.bg}, transparent)` }}
      />
    </div>
  );
}
