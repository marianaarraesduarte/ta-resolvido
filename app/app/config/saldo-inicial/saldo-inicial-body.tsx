"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { amountToInputValue, formatCentsInput, parseCentsInput } from "@/lib/tokens";
import { setInitialBalance } from "../actions";

const inputClass =
  "w-full rounded-2xl border border-brand-line bg-white px-3.5 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-ink";

export function SaldoInicialBody({
  initialAmount,
  initialDate,
}: {
  initialAmount: number;
  initialDate: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(amountToInputValue(initialAmount));
  const [date, setDate] = useState(initialDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await setInitialBalance(parseCentsInput(amount), date);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Não deu pra salvar agora.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[20px] bg-brand-card p-[18px]">
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
            onChange={(e) => setAmount(formatCentsInput(e.target.value))}
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <div className="mb-1">
        <label className="mb-1.5 block text-xs font-medium text-brand-ink-soft" htmlFor="date">
          A partir de quando
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`${inputClass} min-w-0`}
        />
      </div>

      {error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}
      {saved && !error && <p className="mt-3 text-sm text-brand-sage">Salvo!</p>}

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-sage py-3.5 font-display text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
