"use client";

import { useState } from "react";
import { CreditCard, Receipt } from "lucide-react";
import { BankStatementReview } from "./bank-statement-review";
import { CardInvoiceReview } from "./card-invoice-review";

export function PhotoTab({
  salaryPatterns,
  fixedExpenseNames,
}: {
  salaryPatterns: string[];
  fixedExpenseNames: string[];
}) {
  const [source, setSource] = useState<"extrato" | "fatura">("extrato");

  return (
    <div className="rounded-[20px] bg-brand-card p-[18px]">
      <div className="mb-4 flex gap-1.5 rounded-2xl bg-brand-bg p-1.5">
        <button
          type="button"
          onClick={() => setSource("extrato")}
          className={
            source === "extrato"
              ? "flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-brand-ink px-0 py-3 font-display text-sm font-semibold text-brand-card"
              : "flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-transparent px-0 py-3 font-display text-sm font-semibold text-brand-ink-soft"
          }
        >
          <Receipt size={15} />
          Extrato bancário
        </button>
        <button
          type="button"
          onClick={() => setSource("fatura")}
          className={
            source === "fatura"
              ? "flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-brand-ink px-0 py-3 font-display text-sm font-semibold text-brand-card"
              : "flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-transparent px-0 py-3 font-display text-sm font-semibold text-brand-ink-soft"
          }
        >
          <CreditCard size={15} />
          Fatura do cartão
        </button>
      </div>

      {source === "extrato" ? (
        <BankStatementReview salaryPatterns={salaryPatterns} fixedExpenseNames={fixedExpenseNames} />
      ) : (
        <CardInvoiceReview fixedExpenseNames={fixedExpenseNames} />
      )}
    </div>
  );
}
