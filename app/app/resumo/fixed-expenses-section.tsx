"use client";

import { useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import { completeCents, currency, parseCurrencyInput } from "@/lib/tokens";
import { createFixedExpense, deleteFixedExpense, updateFixedExpense } from "./actions";

const SUGGESTIONS = ["Aluguel", "Conta de luz", "Água", "Internet", "Condomínio", "Plano de saúde"];

type FixedExpense = { id: string; name: string; expected_amount: number };
type Paid = { description: string; amount: number } | null;

function FixedExpenseRow({
  expense,
  paid,
  onUpdate,
  onDelete,
}: {
  expense: FixedExpense;
  paid: Paid;
  onUpdate: (id: string, name: string, amount: number) => Promise<void>;
  onDelete: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(String(expense.expected_amount).replace(".", ","));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const amountNum = parseCurrencyInput(amount);
    if (!name.trim() || !amountNum || amountNum <= 0) {
      setError("Confere o nome e o valor.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onUpdate(expense.id, name, amountNum);
      setEditing(false);
    } catch {
      setError("Não deu pra salvar agora.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-3.5">
      {editing ? (
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={(e) => setAmount(completeCents(e.target.value))}
            inputMode="decimal"
            placeholder="0,00"
            className="w-24 rounded-xl border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
          />
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl bg-brand-ink px-3.5 text-sm font-semibold text-brand-card disabled:opacity-60"
          >
            {saving ? "..." : "Salvar"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14.5px] font-medium text-brand-ink">{expense.name}</div>
            <div className="mt-0.5 text-xs text-brand-ink-soft">
              {paid ? (
                <span className="font-medium text-brand-sage">
                  Pago · {currency(paid.amount)}
                </span>
              ) : (
                <span>Ainda não esse mês · esperado {currency(expense.expected_amount)}</span>
              )}
            </div>
          </div>
          <div
            className={
              paid ? "h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-sage" : "h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-line"
            }
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Editar ${expense.name}`}
            className="flex-shrink-0 text-brand-ink-soft"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(expense.id, expense.name)}
            aria-label={`Excluir ${expense.name}`}
            className="flex-shrink-0 text-brand-ink-soft"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
    </div>
  );
}

export function FixedExpensesSection({
  fixedExpenses: initialExpenses,
  paidById,
  pendingTotal,
  pendingCount,
}: {
  fixedExpenses: FixedExpense[];
  paidById: Record<string, Paid>;
  pendingTotal: number;
  pendingCount: number;
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const availableSuggestions = SUGGESTIONS.filter(
    (s) => !expenses.some((e) => e.name.trim().toLowerCase() === s.toLowerCase()),
  );

  async function handleCreate() {
    const amountNum = parseCurrencyInput(newAmount);
    if (!newName.trim() || !amountNum || amountNum <= 0) {
      setError("Preenche nome e valor esperado.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const created = await createFixedExpense(newName, amountNum);
      setExpenses((prev) => [...prev, created]);
      setNewName("");
      setNewAmount("");
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu pra criar agora.");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id: string, name: string, amount: number) {
    await updateFixedExpense(id, name, amount);
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, name, expected_amount: amount } : e)));
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Excluir "${name}" dos gastos fixos?`)) return;
    try {
      await deleteFixedExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch {
      window.alert("Não deu pra excluir agora.");
    }
  }

  return (
    <div className="mb-6">
      <div className="mb-2 text-[13px] font-semibold text-brand-ink">Gastos fixos do mês</div>

      {expenses.length > 0 &&
        (pendingTotal > 0 ? (
          <p className="mb-2.5 text-[12.5px] leading-snug text-brand-ink-soft">
            Ainda tem {currency(pendingTotal)} em {pendingCount}{" "}
            {pendingCount === 1 ? "conta fixa" : "contas fixas"} pra pagar esse mês.
          </p>
        ) : (
          <p className="mb-2.5 text-[12.5px] font-medium text-brand-sage">
            Todas as contas fixas desse mês já foram pagas.
          </p>
        ))}

      {expenses.length > 0 && (
        <div className="mb-3 divide-y divide-brand-bg overflow-hidden rounded-2xl bg-brand-card">
          {expenses.map((expense) => (
            <FixedExpenseRow
              key={expense.id}
              expense={expense}
              paid={paidById[expense.id] ?? null}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {adding ? (
        <div className="rounded-2xl bg-brand-card p-[18px]">
          {availableSuggestions.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-2">
              {availableSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewName(s)}
                  className="rounded-full border border-brand-line bg-white px-3 py-1.5 text-xs font-medium text-brand-ink-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome (ex: Aluguel)"
              className="min-w-0 flex-1 rounded-xl border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
            />
            <input
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              onBlur={(e) => setNewAmount(completeCents(e.target.value))}
              inputMode="decimal"
              placeholder="Valor esperado (0,00)"
              className="w-32 rounded-xl border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <button
              type="button"
              disabled={creating}
              onClick={handleCreate}
              className="flex items-center gap-1.5 rounded-xl bg-brand-ink px-3.5 text-sm font-semibold text-brand-card disabled:opacity-60"
            >
              <Check size={14} />
              {creating ? "..." : "Adicionar"}
            </button>
          </div>
          {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-brand-line py-3 font-display text-sm font-semibold text-brand-ink-soft"
        >
          <Plus size={15} />
          Novo gasto fixo
        </button>
      )}
    </div>
  );
}
