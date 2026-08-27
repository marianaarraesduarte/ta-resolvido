"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { currency } from "@/lib/tokens";
import { iconForCategory } from "@/lib/category-icons";

export type CategoryTotal = {
  key: string;
  name: string;
  icon: string | null;
  total: number;
  items: { id: string; description: string; amount: number }[];
};

export function CategoryList({
  categories,
  total,
}: {
  categories: CategoryTotal[];
  total: number;
}) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const maior = categories[0]?.total ?? 0;

  function toggleExpanded(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-card">
      {categories.map((c, i) => {
        const Icon = iconForCategory(c.icon);
        const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
        const barPct = maior > 0 ? Math.round((c.total / maior) * 100) : 0;
        const expanded = expandedKeys.has(c.key);
        return (
          <div key={c.key} className={i === 0 ? "" : "border-t border-brand-bg"}>
            <button
              type="button"
              onClick={() => toggleExpanded(c.key)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[11px] bg-brand-bg">
                <Icon size={15} className="text-brand-ink" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-medium text-brand-ink">{c.name}</div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-bg">
                  <div
                    className="h-full rounded-full bg-brand-ink-solid opacity-75"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="font-display text-[15px] font-bold text-brand-ink">
                  {currency(c.total)}
                </div>
                <div className="text-[11px] text-brand-ink-soft">{pct}% do mês</div>
              </div>
              <ChevronDown
                size={14}
                className={
                  expanded
                    ? "flex-shrink-0 rotate-180 text-brand-ink-soft transition-transform"
                    : "flex-shrink-0 text-brand-ink-soft transition-transform"
                }
              />
            </button>
            {expanded && (
              <div className="bg-brand-bg/60 px-4 pb-2">
                {c.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/app/lancamento/${item.id}`}
                    className="flex items-center justify-between gap-3 py-2 pl-11"
                  >
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-brand-ink">
                      {item.description}
                    </span>
                    <span className="flex-shrink-0 whitespace-nowrap text-[13.5px] font-semibold text-brand-ink">
                      {currency(item.amount)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
