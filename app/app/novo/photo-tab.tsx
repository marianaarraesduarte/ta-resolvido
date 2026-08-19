"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Receipt } from "lucide-react";
import { BankStatementReview } from "./bank-statement-review";
import { CardInvoiceReview } from "./card-invoice-review";

type Category = { id: string; name: string };
type FixedExpense = { name: string; expected_amount: number };

export function PhotoTab({
  salaryPatterns,
  fixedExpenses,
  categories,
  photosRemaining,
}: {
  salaryPatterns: string[];
  fixedExpenses: FixedExpense[];
  categories: Category[];
  photosRemaining: number | null;
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

      {photosRemaining !== null &&
        (photosRemaining > 0 ? (
          <p className="mb-3.5 text-[12.5px] text-brand-ink-soft">
            Você ainda tem {photosRemaining} {photosRemaining === 1 ? "foto grátis" : "fotos grátis"}{" "}
            esse mês.
          </p>
        ) : (
          <p className="mb-3.5 text-[12.5px] font-medium text-brand-coral">
            Você já usou suas fotos grátis desse mês.{" "}
            <Link href="/app/planos" className="underline underline-offset-2">
              Assine o Completo
            </Link>{" "}
            pra reconhecer sem limite.
          </p>
        ))}

      {source === "extrato" ? (
        <BankStatementReview
          salaryPatterns={salaryPatterns}
          fixedExpenses={fixedExpenses}
          categories={categories}
        />
      ) : (
        <CardInvoiceReview fixedExpenses={fixedExpenses} categories={categories} />
      )}
    </div>
  );
}
