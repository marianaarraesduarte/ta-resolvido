"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { currency } from "@/lib/tokens";
import { iconForCategory } from "@/lib/category-icons";

type DoneInstallment = {
  id: string;
  description: string;
  totalInstallments: number;
  monthlyAmount: number;
  categoryIcon: string | null;
  cardName: string | null;
  cardColor: string | null;
};

export function QuitadasSection({ items }: { items: DoneInstallment[] }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-2 flex w-full items-center gap-2.5 rounded-2xl bg-brand-card px-4 py-3.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-brand-ink">Parcelamentos quitados</div>
          <div className="mt-0.5 truncate text-[12px] font-medium text-brand-sage">
            {items.length} {items.length === 1 ? "parcelamento" : "parcelamentos"} totalmente pagos
          </div>
        </div>
        <ChevronDown
          size={15}
          className="flex-shrink-0 text-brand-ink-soft transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "none" }}
        />
      </button>

      {expanded && (
        <div className="divide-y divide-brand-bg overflow-hidden rounded-2xl bg-brand-card">
          {items.map((item) => {
            const Icon = iconForCategory(item.categoryIcon);
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-bg">
                  <Icon size={16} className="text-brand-ink" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-brand-ink">
                    {item.description}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-brand-ink-soft">
                    {item.cardName && (
                      <>
                        <span
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ background: item.cardColor ?? "var(--accent)" }}
                        />
                        {item.cardName} ·{" "}
                      </>
                    )}
                    {item.totalInstallments}x de {currency(item.monthlyAmount)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
