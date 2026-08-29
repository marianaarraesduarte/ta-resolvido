"use client";

import { useState } from "react";
import { CategoryList, type CategoryTotal } from "../categorias/category-list";
import { EntriesList, type CardInvoiceRow } from "./entries-list";
import { EntrySearch } from "./entry-search";

type Category = { id: string; name: string };
type EntryRow = Parameters<typeof EntriesList>[0]["entries"][number];

type View = "data" | "categoria";

export function GastosView({
  entries,
  categories,
  cardInvoices,
  categoryTotals,
  initialView,
}: {
  entries: EntryRow[];
  categories: Category[];
  cardInvoices: CardInvoiceRow[];
  categoryTotals: CategoryTotal[];
  initialView: View;
}) {
  const [view, setView] = useState<View>(initialView);
  const categoryTotal = categoryTotals.reduce((sum, c) => sum + c.total, 0);

  return (
    <div>
      <EntrySearch />

      <div className="mb-3.5 flex gap-1.5 rounded-2xl bg-brand-bg p-1.5">
        <button
          type="button"
          onClick={() => setView("data")}
          className={
            view === "data"
              ? "flex-1 rounded-xl bg-brand-card py-2 text-[12.5px] font-semibold text-brand-ink shadow-sm"
              : "flex-1 rounded-xl py-2 text-[12.5px] font-semibold text-brand-ink-soft"
          }
        >
          Por data
        </button>
        <button
          type="button"
          onClick={() => setView("categoria")}
          className={
            view === "categoria"
              ? "flex-1 rounded-xl bg-brand-card py-2 text-[12.5px] font-semibold text-brand-ink shadow-sm"
              : "flex-1 rounded-xl py-2 text-[12.5px] font-semibold text-brand-ink-soft"
          }
        >
          Por categoria
        </button>
      </div>

      {view === "data" ? (
        <EntriesList entries={entries} categories={categories} cardInvoices={cardInvoices} />
      ) : categoryTotals.length === 0 ? (
        <div className="rounded-2xl border border-brand-line bg-brand-card p-5">
          <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
            Nada marcado ainda esse mês.
          </div>
          <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
            Assim que você marcar um gasto, ele aparece aqui por categoria.
          </div>
        </div>
      ) : (
        <CategoryList categories={categoryTotals} total={categoryTotal} />
      )}
    </div>
  );
}
