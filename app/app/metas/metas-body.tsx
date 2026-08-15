"use client";

import { useState } from "react";
import { Minus, Pencil, PiggyBank, Plus, X } from "lucide-react";
import { completeCents, currency, parseCurrencyInput, TOKENS } from "@/lib/tokens";
import { useSaldo } from "@/lib/saldo-context";
import {
  createReserve,
  deleteReserve,
  setGoalPercent,
  setIncomeBasis,
  updateReserveProgress,
} from "./actions";

type GoalKind = "liberdade_financeira" | "longo_prazo" | "curto_prazo";
type Reserve = { id: string; name: string; target_amount: number; saved_amount: number };

const GOAL_META: { kind: GoalKind; label: string; color: string }[] = [
  { kind: "liberdade_financeira", label: "Liberdade financeira", color: TOKENS.sage },
  { kind: "longo_prazo", label: "Longo prazo", color: TOKENS.amber },
  { kind: "curto_prazo", label: "Curto prazo", color: TOKENS.coral },
];

function GoalRow({
  label,
  color,
  percent,
  receita,
  onChange,
}: {
  label: string;
  color: string;
  percent: number;
  receita: number;
  onChange: (percent: number) => void;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-brand-ink">{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(percent - 1)}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-brand-line bg-white text-brand-ink"
          >
            <Minus size={12} />
          </button>
          <span className="w-9 text-center font-display text-[15px] font-bold text-brand-ink">
            {percent}%
          </span>
          <button
            type="button"
            onClick={() => onChange(percent + 1)}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-brand-line bg-white text-brand-ink"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
      <div className="mb-1 h-2 overflow-hidden rounded-full bg-brand-bg">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <div className="text-right text-xs text-brand-ink-soft">
        = {currency((receita * percent) / 100)} / mês
      </div>
    </div>
  );
}

function ReserveRow({
  reserve,
  onUpdate,
  onDelete,
}: {
  reserve: Reserve;
  onUpdate: (id: string, saved: number, target: number) => Promise<void>;
  onDelete: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(String(reserve.saved_amount).replace(".", ","));
  const [target, setTarget] = useState(String(reserve.target_amount).replace(".", ","));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pct =
    reserve.target_amount > 0
      ? Math.min(100, Math.round((reserve.saved_amount / reserve.target_amount) * 100))
      : 0;

  async function handleSave() {
    const savedNum = parseCurrencyInput(saved);
    const targetNum = parseCurrencyInput(target);
    if (!targetNum || targetNum <= 0 || savedNum < 0) {
      setError("Confere os valores.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onUpdate(reserve.id, savedNum, targetNum);
      setEditing(false);
    } catch {
      setError("Não deu pra salvar agora.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-3.5">
      <div className="mb-2 flex items-center gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-brand-bg">
          <PiggyBank size={14} className="text-brand-ink" />
        </div>
        <div className="min-w-0 flex-1 truncate text-sm font-medium text-brand-ink">
          {reserve.name}
        </div>
        {!editing && (
          <div className="whitespace-nowrap text-right text-[13px] font-semibold text-brand-ink">
            {currency(reserve.saved_amount)}{" "}
            <span className="font-normal text-brand-ink-soft">
              de {currency(reserve.target_amount)}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label={editing ? "Fechar edição" : `Editar ${reserve.name}`}
          className="flex-shrink-0 text-brand-ink-soft"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(reserve.id, reserve.name)}
          aria-label={`Excluir ${reserve.name}`}
          className="flex-shrink-0 text-brand-ink-soft"
        >
          <X size={14} />
        </button>
      </div>

      {editing ? (
        <div className="flex flex-wrap gap-2">
          <input
            value={saved}
            onChange={(e) => setSaved(e.target.value)}
            onBlur={(e) => setSaved(completeCents(e.target.value))}
            placeholder="Guardado"
            inputMode="decimal"
            className="w-24 flex-1 rounded-xl border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
          />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onBlur={(e) => setTarget(completeCents(e.target.value))}
            placeholder="Meta"
            inputMode="decimal"
            className="w-24 flex-1 rounded-xl border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
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
        <div className="h-1.5 overflow-hidden rounded-full bg-brand-bg">
          <div
            className="h-full rounded-full bg-brand-sage"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
    </div>
  );
}

export function MetasBody({
  incomeBasis: initialIncomeBasis,
  receitaAll,
  receitaSalaryOnly,
  goals: initialGoals,
  reserves: initialReserves,
}: {
  incomeBasis: "all" | "salary_only";
  receitaAll: number;
  receitaSalaryOnly: number;
  goals: { kind: GoalKind; percent: number }[];
  reserves: Reserve[];
}) {
  const { setGoalPercent: setSaldoGoalPercent } = useSaldo();
  const [incomeBasis, setIncomeBasisState] = useState(initialIncomeBasis);
  const [goalPercents, setGoalPercents] = useState<Record<GoalKind, number>>(() => {
    const map = {} as Record<GoalKind, number>;
    for (const g of initialGoals) map[g.kind] = g.percent;
    return map;
  });
  const [reserves, setReserves] = useState(initialReserves);

  const [addingReserve, setAddingReserve] = useState(false);
  const [newReserveName, setNewReserveName] = useState("");
  const [newReserveTarget, setNewReserveTarget] = useState("");
  const [creatingReserve, setCreatingReserve] = useState(false);
  const [reserveError, setReserveError] = useState("");

  const receita = incomeBasis === "all" ? receitaAll : receitaSalaryOnly;
  const totalPct = Object.values(goalPercents).reduce((sum, p) => sum + p, 0);

  function handleBasisChange(basis: "all" | "salary_only") {
    setIncomeBasisState(basis);
    setIncomeBasis(basis).catch(() => {});
  }

  function handleGoalChange(kind: GoalKind, percent: number) {
    const clamped = Math.max(0, Math.min(100, percent));
    setGoalPercents((prev) => ({ ...prev, [kind]: clamped }));
    setSaldoGoalPercent(kind, clamped);
    setGoalPercent(kind, clamped).catch(() => {});
  }

  async function handleUpdateReserve(id: string, saved: number, target: number) {
    await updateReserveProgress(id, saved, target);
    setReserves((prev) =>
      prev.map((r) => (r.id === id ? { ...r, saved_amount: saved, target_amount: target } : r)),
    );
  }

  async function handleDeleteReserve(id: string, name: string) {
    if (!window.confirm(`Excluir a reserva "${name}"?`)) return;
    try {
      await deleteReserve(id);
      setReserves((prev) => prev.filter((r) => r.id !== id));
    } catch {
      window.alert("Não deu pra excluir agora.");
    }
  }

  async function handleCreateReserve() {
    const targetNum = parseCurrencyInput(newReserveTarget);
    if (!newReserveName.trim() || !targetNum || targetNum <= 0) {
      setReserveError("Preenche nome e valor alvo.");
      return;
    }
    setCreatingReserve(true);
    setReserveError("");
    try {
      const created = await createReserve(newReserveName, targetNum);
      setReserves((prev) => [...prev, created]);
      setNewReserveName("");
      setNewReserveTarget("");
      setAddingReserve(false);
    } catch {
      setReserveError("Não deu pra criar essa reserva agora.");
    } finally {
      setCreatingReserve(false);
    }
  }

  return (
    <>
      <div className="mb-2.5 flex items-center justify-between rounded-[18px] bg-brand-card px-[18px] py-3.5">
        <div className="text-[13px] text-brand-ink-soft">
          Receita do mês
          <div className="text-[11px] text-brand-ink-soft opacity-80">
            {incomeBasis === "all" ? "toda renda lançada" : "só salário"}
          </div>
        </div>
        <div className="font-display text-lg font-bold text-brand-ink">{currency(receita)}</div>
      </div>
      <div className="mb-5 flex gap-2">
        {(
          [
            ["all", "Toda renda"],
            ["salary_only", "Só salário"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleBasisChange(key)}
            className={
              incomeBasis === key
                ? "flex-1 rounded-full border border-brand-ink bg-brand-ink py-2 text-[12.5px] font-medium text-brand-card"
                : "flex-1 rounded-full border border-brand-line bg-brand-card py-2 text-[12.5px] font-medium text-brand-ink-soft"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-2 text-[13px] font-semibold text-brand-ink">Metas de investimento</div>
      <div className="mb-2 rounded-2xl bg-brand-card p-[18px]">
        {GOAL_META.map((g) => (
          <GoalRow
            key={g.kind}
            label={g.label}
            color={g.color}
            percent={goalPercents[g.kind] ?? 0}
            receita={receita}
            onChange={(percent) => handleGoalChange(g.kind, percent)}
          />
        ))}
      </div>
      <div className="mb-6 text-center text-[11.5px] text-brand-ink-soft">
        No total, você está investindo{" "}
        <strong className="text-brand-ink">{totalPct}%</strong> da sua receita (
        {currency((receita * totalPct) / 100)}/mês)
      </div>

      <div className="mb-2 text-[13px] font-semibold text-brand-ink">Reservas planejadas</div>
      <p className="mb-3 text-xs leading-snug text-brand-ink-soft">
        Dinheiro guardado aos poucos pra um gasto grande que já sabe que vai ter — tipo IPVA,
        seguro ou uma viagem.
      </p>

      {reserves.length > 0 && (
        <div className="mb-3.5 divide-y divide-brand-bg overflow-hidden rounded-2xl bg-brand-card">
          {reserves.map((r) => (
            <ReserveRow
              key={r.id}
              reserve={r}
              onUpdate={handleUpdateReserve}
              onDelete={handleDeleteReserve}
            />
          ))}
        </div>
      )}

      {addingReserve ? (
        <div className="mb-3.5 rounded-2xl bg-brand-card p-[18px]">
          <div className="mb-2.5">
            <input
              autoFocus
              value={newReserveName}
              onChange={(e) => setNewReserveName(e.target.value)}
              placeholder="Nome da reserva (ex: IPVA 2027)"
              className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-ink"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={newReserveTarget}
              onChange={(e) => setNewReserveTarget(e.target.value)}
              onBlur={(e) => setNewReserveTarget(completeCents(e.target.value))}
              placeholder="Valor alvo (0,00)"
              inputMode="decimal"
              className="flex-1 rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-ink"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateReserve();
                }
              }}
            />
            <button
              type="button"
              disabled={creatingReserve}
              onClick={handleCreateReserve}
              className="rounded-xl bg-brand-ink px-3.5 text-sm font-semibold text-brand-card disabled:opacity-60"
            >
              {creatingReserve ? "..." : "Criar"}
            </button>
          </div>
          {reserveError && <p className="mt-1.5 text-xs text-brand-coral">{reserveError}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingReserve(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-brand-line py-3.5 font-display text-sm font-semibold text-brand-ink-soft"
        >
          <Plus size={15} />
          Nova reserva
        </button>
      )}
    </>
  );
}
