"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Pencil, PiggyBank, Plus, X } from "lucide-react";
import { completeCents, currency, parseCurrencyInput, TOKENS } from "@/lib/tokens";
import { useConfirm } from "../confirm-dialog";
import {
  confirmGoalInvestment,
  createInvestmentGoal,
  createReserve,
  deleteInvestmentGoal,
  deleteReserve,
  renameInvestmentGoal,
  setGoalPercent,
  setIncomeBasis,
  unconfirmGoalInvestment,
  updateReserveProgress,
} from "./actions";

type Goal = { id: string; name: string; percent: number };
type Reserve = { id: string; name: string; target_amount: number; saved_amount: number };

const GOAL_COLORS = [TOKENS.sage, TOKENS.amber, TOKENS.coral];

function GoalRow({
  goal,
  color,
  receita,
  onChangePercent,
  onRename,
  onDelete,
  confirmed,
  confirming,
  onToggleConfirm,
}: {
  goal: Goal;
  color: string;
  receita: number;
  onChangePercent: (percent: number) => void;
  onRename: (name: string) => Promise<void>;
  onDelete: () => void;
  confirmed: boolean;
  confirming: boolean;
  onToggleConfirm: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(goal.name);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const amount = (receita * goal.percent) / 100;

  async function handleSaveName() {
    if (!name.trim()) {
      setNameError("Digite um nome.");
      return;
    }
    setSavingName(true);
    setNameError("");
    try {
      await onRename(name);
      setRenaming(false);
    } catch {
      setNameError("Não deu pra salvar agora.");
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        {renaming ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveName();
                }
              }}
              className="min-w-0 flex-1 rounded-lg border border-brand-line bg-white px-2 py-1 text-sm text-brand-ink outline-none focus:border-brand-ink"
            />
            <button
              type="button"
              disabled={savingName}
              onClick={handleSaveName}
              className="flex-shrink-0 text-brand-sage"
              aria-label="Salvar nome"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-medium text-brand-ink">{goal.name}</span>
            <button
              type="button"
              onClick={() => setRenaming(true)}
              aria-label={`Renomear ${goal.name}`}
              className="flex-shrink-0 text-brand-ink-soft"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Excluir ${goal.name}`}
              className="flex-shrink-0 text-brand-ink-soft"
            >
              <X size={13} />
            </button>
          </div>
        )}
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onChangePercent(goal.percent - 1)}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-brand-line bg-white text-brand-ink"
          >
            <Minus size={12} />
          </button>
          <div className="flex w-14 items-baseline justify-center rounded-lg border border-brand-line bg-white px-1.5 py-1">
            <input
              type="text"
              inputMode="numeric"
              value={goal.percent}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, "");
                onChangePercent(digits === "" ? 0 : Number(digits));
              }}
              onFocus={(e) => e.target.select()}
              aria-label={`${goal.name} — porcentagem`}
              className="w-7 bg-transparent text-right font-display text-[15px] font-bold text-brand-ink outline-none"
            />
            <span className="font-display text-[15px] font-bold text-brand-ink">%</span>
          </div>
          <button
            type="button"
            onClick={() => onChangePercent(goal.percent + 1)}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-brand-line bg-white text-brand-ink"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
      {nameError && <p className="mb-1 text-xs text-brand-coral">{nameError}</p>}
      <div className="mb-1 h-2 overflow-hidden rounded-full bg-brand-bg">
        <div className="h-full rounded-full" style={{ width: `${goal.percent}%`, background: color }} />
      </div>
      <div className="mb-2 text-right text-xs text-brand-ink-soft">= {currency(amount)} / mês</div>
      <button
        type="button"
        disabled={confirming || amount <= 0}
        onClick={onToggleConfirm}
        className="flex w-full items-center gap-2 rounded-xl bg-brand-bg px-3 py-2.5 text-left disabled:opacity-60"
      >
        <span
          className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-md border-[1.5px]"
          style={{
            background: confirmed ? TOKENS.sage : "transparent",
            borderColor: confirmed ? TOKENS.sage : "#D9D3C4",
          }}
        >
          {confirmed && <Check size={12} className="text-white" />}
        </span>
        <span className="text-[12.5px] font-medium text-brand-ink-soft">
          {confirmed
            ? `Investido esse mês — descontado do saldo`
            : `Já investi esse valor esse mês`}
        </span>
      </button>
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
  confirmedGoalIds: initialConfirmedGoalIds,
  reserves: initialReserves,
  saldo,
}: {
  incomeBasis: "all" | "salary_only";
  receitaAll: number;
  receitaSalaryOnly: number;
  goals: Goal[];
  confirmedGoalIds: string[];
  reserves: Reserve[];
  saldo: number;
}) {
  const router = useRouter();
  const [incomeBasis, setIncomeBasisState] = useState(initialIncomeBasis);
  const [goals, setGoals] = useState(initialGoals);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const id of initialConfirmedGoalIds) map[id] = true;
    return map;
  });
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState("");
  const [reserves, setReserves] = useState(initialReserves);
  const [reserveActionError, setReserveActionError] = useState("");
  const [goalActionError, setGoalActionError] = useState("");
  const confirm = useConfirm();

  const [addingGoal, setAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [creatingGoal, setCreatingGoal] = useState(false);

  const [addingReserve, setAddingReserve] = useState(false);
  const [newReserveName, setNewReserveName] = useState("");
  const [newReserveTarget, setNewReserveTarget] = useState("");
  const [creatingReserve, setCreatingReserve] = useState(false);
  const [reserveError, setReserveError] = useState("");

  const receita = incomeBasis === "all" ? receitaAll : receitaSalaryOnly;
  const totalPct = goals.reduce((sum, g) => sum + g.percent, 0);
  const unconfirmedTotal = goals
    .filter((g) => !confirmed[g.id])
    .reduce((sum, g) => sum + (receita * g.percent) / 100, 0);
  const simulatedSaldo = saldo - unconfirmedTotal;

  function handleBasisChange(basis: "all" | "salary_only") {
    setIncomeBasisState(basis);
    setIncomeBasis(basis).catch(() => {});
  }

  function handleGoalPercentChange(id: string, percent: number) {
    const clamped = Math.max(0, Math.min(100, percent));
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, percent: clamped } : g)));
    setGoalPercent(id, clamped).catch(() => {});
  }

  async function handleRenameGoal(id: string, name: string) {
    await renameInvestmentGoal(id, name);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, name: name.trim() } : g)));
  }

  async function handleDeleteGoal(goal: Goal) {
    const message = confirmed[goal.id]
      ? `Excluir a meta "${goal.name}"? Você já confirmou um investimento nela esse mês (${currency(
          (receita * goal.percent) / 100,
        )}) — esse valor continua contando no seu saldo, mas vira um gasto avulso, sem ligação com nenhuma meta.`
      : `Excluir a meta "${goal.name}"?`;
    const ok = await confirm(message);
    if (!ok) return;
    setGoalActionError("");
    try {
      await deleteInvestmentGoal(goal.id);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
      router.refresh();
    } catch {
      setGoalActionError("Não deu pra excluir agora.");
    }
  }

  async function handleCreateGoal() {
    if (!newGoalName.trim()) {
      setGoalActionError("Digite um nome pra meta.");
      return;
    }
    setCreatingGoal(true);
    setGoalActionError("");
    try {
      const created = await createInvestmentGoal(newGoalName);
      setGoals((prev) => [...prev, created]);
      setNewGoalName("");
      setAddingGoal(false);
    } catch (e) {
      setGoalActionError(e instanceof Error ? e.message : "Não deu pra criar agora.");
    } finally {
      setCreatingGoal(false);
    }
  }

  async function handleToggleConfirm(goal: Goal) {
    setConfirmError("");
    setConfirmingId(goal.id);
    try {
      if (confirmed[goal.id]) {
        await unconfirmGoalInvestment(goal.id);
        setConfirmed((prev) => ({ ...prev, [goal.id]: false }));
      } else {
        const amount = (receita * goal.percent) / 100;
        await confirmGoalInvestment(goal.id, goal.name, amount);
        setConfirmed((prev) => ({ ...prev, [goal.id]: true }));
      }
      router.refresh();
    } catch (e) {
      setConfirmError(e instanceof Error ? e.message : "Não deu pra atualizar agora.");
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleUpdateReserve(id: string, saved: number, target: number) {
    await updateReserveProgress(id, saved, target);
    setReserves((prev) =>
      prev.map((r) => (r.id === id ? { ...r, saved_amount: saved, target_amount: target } : r)),
    );
  }

  async function handleDeleteReserve(id: string, name: string) {
    const ok = await confirm(`Excluir a reserva "${name}"?`);
    if (!ok) return;
    setReserveActionError("");
    try {
      await deleteReserve(id);
      setReserves((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setReserveActionError("Não deu pra excluir agora.");
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
      {goals.length > 0 && (
        <div className="mb-2 rounded-2xl bg-brand-card p-[18px]">
          {goals.map((g, i) => (
            <GoalRow
              key={g.id}
              goal={g}
              color={GOAL_COLORS[i % GOAL_COLORS.length]}
              receita={receita}
              onChangePercent={(percent) => handleGoalPercentChange(g.id, percent)}
              onRename={(name) => handleRenameGoal(g.id, name)}
              onDelete={() => handleDeleteGoal(g)}
              confirmed={confirmed[g.id] ?? false}
              confirming={confirmingId === g.id}
              onToggleConfirm={() => handleToggleConfirm(g)}
            />
          ))}
        </div>
      )}
      {goalActionError && <p className="mb-3 text-center text-xs text-brand-coral">{goalActionError}</p>}
      {confirmError && (
        <p className="mb-3 text-center text-xs text-brand-coral">{confirmError}</p>
      )}

      {addingGoal ? (
        <div className="mb-3 rounded-2xl bg-brand-card p-[18px]">
          <div className="flex gap-2">
            <input
              autoFocus
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              placeholder="Nome da meta (ex: Aposentadoria)"
              className="min-w-0 flex-1 rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-ink"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateGoal();
                }
              }}
            />
            <button
              type="button"
              disabled={creatingGoal}
              onClick={handleCreateGoal}
              className="flex-shrink-0 rounded-xl bg-brand-ink px-3.5 text-sm font-semibold text-brand-card disabled:opacity-60"
            >
              {creatingGoal ? "..." : "Criar"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingGoal(true)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-brand-line py-3 font-display text-sm font-semibold text-brand-ink-soft"
        >
          <Plus size={15} />
          Nova meta de investimento
        </button>
      )}

      <div
        className={
          totalPct > 100
            ? "mb-1 text-center text-[11.5px] font-medium text-brand-coral"
            : "mb-2 text-center text-[11.5px] text-brand-ink-soft"
        }
      >
        No total, você está investindo{" "}
        <strong className={totalPct > 100 ? "text-brand-coral" : "text-brand-ink"}>
          {totalPct}%
        </strong>{" "}
        da sua receita ({currency((receita * totalPct) / 100)}/mês)
      </div>
      {totalPct > 100 && (
        <div className="mb-6 text-center text-[11.5px] leading-snug text-brand-coral">
          Isso é mais do que 100% da sua receita — confere as porcentagens, deve ter alguma
          conta sobrando.
        </div>
      )}

      {goals.some((g) => g.percent > 0) && (
        <div className="mb-6 rounded-2xl border border-brand-line bg-brand-card px-[18px] py-3.5 text-center">
          <div className="text-[11.5px] text-brand-ink-soft">
            Se você guardar tudo isso esse mês, seu saldo fica em
          </div>
          <div
            className="font-display text-lg font-bold"
            style={{ color: simulatedSaldo >= 0 ? TOKENS.sage : TOKENS.coral }}
          >
            {currency(simulatedSaldo)}
          </div>
        </div>
      )}

      <div className="mb-2 text-[13px] font-semibold text-brand-ink">Reservas planejadas</div>
      <p className="mb-3 text-xs leading-snug text-brand-ink-soft">
        Dinheiro guardado aos poucos pra um gasto grande que já sabe que vai ter — tipo IPVA,
        seguro ou uma viagem.
      </p>

      {reserveActionError && (
        <p className="mb-3 text-xs text-brand-coral">{reserveActionError}</p>
      )}

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
