"use client";

import { useEffect, useRef } from "react";
import { monthKey } from "@/lib/date";
import { TOKENS } from "@/lib/tokens";
import { goToMonth } from "./month-actions";
import { MonthPicker, MONTH_ABBRS } from "./month-picker";

// 12 pra cada lado dá mais de 2 anos de fita — dá pra rolar até janeiro (ou
// bem além) sem precisar navegar mês a mês só pra "abrir" mais opções.
const WINDOW = 12;

/**
 * Fita horizontal com os meses ao redor — o atual vira um chip destacado
 * que abre o seletor completo (ano + qualquer mês), os outros pulam direto
 * pro mês tocado. Renderiza bem mais meses do que cabem na tela (rola pros
 * dois lados) com um desfoque sutil nas bordas, pra ficar óbvio sem
 * escrever nada que dá pra ir mais longe — e sempre abre já centralizada no
 * mês atual, senão a pessoa cairia no meio de uma fita de 2 anos sem saber
 * pra onde olhar.
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

  const items = Array.from({ length: WINDOW * 2 + 1 }, (_, i) => {
    const offset = i - WINDOW;
    const date = new Date(viewedYear, viewedMonth + offset, 1);
    return { offset, date, key: monthKey(date), label: MONTH_ABBRS[date.getMonth()] };
  });

  return (
    <div className="relative">
      <div className="flex gap-1.5 overflow-x-auto px-0.5 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) =>
          item.offset === 0 ? (
            <div key={item.key} ref={currentRef} className="flex-shrink-0">
              <MonthPicker
                path={path}
                monthName={monthName}
                shortLabel={item.label}
                viewedYear={viewedYear}
                viewedMonth={viewedMonth}
                size="chip"
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
