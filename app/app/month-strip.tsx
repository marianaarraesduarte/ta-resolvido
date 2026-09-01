import { monthKey } from "@/lib/date";
import { TOKENS } from "@/lib/tokens";
import { goToMonth } from "./month-actions";
import { MonthPicker, MONTH_ABBRS } from "./month-picker";

const WINDOW = 3;

/**
 * Fita horizontal com os meses vizinhos — o atual vira um chip destacado
 * que abre o seletor completo (ano + qualquer mês), os outros pulam direto
 * pro mês tocado. Renderiza mais meses do que cabem na tela (rola pros dois
 * lados) com um desfoque sutil nas bordas, pra ficar óbvio sem escrever
 * nada que tem mais meses ali, não é só aquela lista curta.
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
            <MonthPicker
              key={item.key}
              path={path}
              monthName={monthName}
              shortLabel={item.label}
              viewedYear={viewedYear}
              viewedMonth={viewedMonth}
              size="chip"
            />
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
