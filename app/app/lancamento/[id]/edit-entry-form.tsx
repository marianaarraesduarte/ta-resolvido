"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, CreditCard, Trash2 } from "lucide-react";
import { completeCents, parseCurrencyInput } from "@/lib/tokens";
import { updateEntry, deleteEntry } from "./actions";

type Entry = {
  id: string;
  type: "despesa" | "receita";
  amount: number;
  description: string;
  entry_date: string;
  category_id: string | null;
  income_type: string | null;
  account_name: string | null;
  card_invoice_id: string | null;
};

type Category = { id: string; name: string };

const inputClass =
  "w-full rounded-2xl border border-brand-line bg-white px-3.5 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-ink";

export function EditEntryForm({
  entry,
  categories,
  separateByAccount,
}: {
  entry: Entry;
  categories: Category[];
  separateByAccount: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(entry.amount.toFixed(2).replace(".", ","));
  const [description, setDescription] = useState(entry.description);
  const [entryDate, setEntryDate] = useState(entry.entry_date);
  const [categoryId, setCategoryId] = useState(entry.category_id ?? "");
  const [incomeType, setIncomeType] = useState<"salario" | "outra">(
    entry.income_type === "salario" ? "salario" : "outra",
  );
  const [accountName, setAccountName] = useState(entry.account_name ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await updateEntry(entry.id, {
        amount: parseCurrencyInput(amount),
        description,
        entry_date: entryDate,
        category_id: entry.type === "despesa" ? categoryId || null : null,
        income_type: entry.type === "receita" ? incomeType : null,
        account_name: separateByAccount ? accountName.trim() || null : null,
      });
      router.push("/app");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu pra salvar agora.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir "${entry.description}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      await deleteEntry(entry.id);
      router.push("/app");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu pra excluir agora.");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-5 flex items-center gap-2.5">
        <Link
          href="/app"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="font-display text-xl font-bold text-brand-ink">Editar lançamento</div>
      </div>

      <div className="rounded-[20px] bg-brand-card p-[18px]">
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-brand-bg px-3.5 py-2.5">
          {entry.type === "receita" ? (
            <ArrowUpCircle size={15} className="flex-shrink-0 text-brand-sage" />
          ) : (
            <ArrowDownCircle size={15} className="flex-shrink-0 text-brand-coral" />
          )}
          <span className="text-[13px] font-medium text-brand-ink-soft">
            {entry.type === "receita" ? "Entrada" : "Saída"}
          </span>
          {entry.card_invoice_id && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-brand-ink-soft">
              <CreditCard size={12} />
              fatura do cartão
            </span>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-brand-ink-soft" htmlFor="amount">
            Valor
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-brand-ink-soft">
              R$
            </span>
            <input
              id="amount"
              value={amount}
              inputMode="decimal"
              onChange={(e) => setAmount(e.target.value)}
              onBlur={(e) => setAmount(completeCents(e.target.value))}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            className="mb-1.5 block text-xs font-medium text-brand-ink-soft"
            htmlFor="description"
          >
            Descrição
          </label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        {entry.type === "despesa" ? (
          <div className="mb-4">
            <label
              className="mb-1.5 block text-xs font-medium text-brand-ink-soft"
              htmlFor="category"
            >
              Categoria
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-4">
            <div className="mb-1.5 text-xs font-medium text-brand-ink-soft">Tipo de renda</div>
            <div className="flex gap-2">
              {(
                [
                  ["salario", "Salário"],
                  ["outra", "Outra renda"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIncomeType(key)}
                  className={
                    incomeType === key
                      ? "flex-1 rounded-full border border-brand-ink bg-brand-ink px-0 py-2.5 text-sm font-medium text-brand-card"
                      : "flex-1 rounded-full border border-brand-line bg-white px-0 py-2.5 text-sm font-medium text-brand-ink-soft"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label
            className="mb-1.5 block text-xs font-medium text-brand-ink-soft"
            htmlFor="entry_date"
          >
            Data
          </label>
          <input
            id="entry_date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className={`${inputClass} min-w-0`}
          />
        </div>

        {separateByAccount && (
          <div className="mb-1">
            <label
              className="mb-1.5 block text-xs font-medium text-brand-ink-soft"
              htmlFor="account_name"
            >
              Conta/banco
            </label>
            <input
              id="account_name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Ex.: Nubank"
              className={inputClass}
            />
          </div>
        )}

        {error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}

        <button
          type="button"
          disabled={saving || deleting}
          onClick={handleSave}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-sage py-3.5 font-display text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>

        <button
          type="button"
          disabled={saving || deleting}
          onClick={handleDelete}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-coral py-3.5 font-display text-[15px] font-semibold text-brand-coral disabled:opacity-60"
        >
          <Trash2 size={16} />
          {deleting ? "Excluindo..." : "Excluir lançamento"}
        </button>
      </div>
    </>
  );
}
