"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Camera,
  CreditCard,
  Lock,
  MessageCircle,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { checkExistingInvoiceDate, createEntry, createCategory, deleteCategory } from "./actions";
import { suggestCategoryName } from "@/lib/category-keywords";
import { formatCentsInput } from "@/lib/tokens";
import { useConfirm } from "../confirm-dialog";
import { PhotoTab } from "./photo-tab";
import { ChatTab } from "./chat-tab";

type Category = { id: string; name: string };

function TypeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-brand-ink-solid px-0 py-3 font-display text-sm font-semibold text-white"
          : "flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-transparent px-0 py-3 font-display text-sm font-semibold text-brand-ink-soft"
      }
    >
      {icon}
      {label}
    </button>
  );
}

function ChipButton({
  active,
  onClick,
  label,
  icon,
  onDelete,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  onDelete?: () => void;
}) {
  if (!onDelete) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          active
            ? "flex items-center gap-1.5 rounded-full border border-brand-ink bg-brand-ink-solid px-3.5 py-2 text-sm font-medium text-white"
            : "flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-card px-3.5 py-2 text-sm font-medium text-brand-ink-soft"
        }
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <span
      className={
        active
          ? "flex items-center gap-1 rounded-full border border-brand-ink bg-brand-ink-solid py-2 pl-3.5 pr-1.5 text-sm font-medium text-white"
          : "flex items-center gap-1 rounded-full border border-brand-line bg-brand-card py-2 pl-3.5 pr-1.5 text-sm font-medium text-brand-ink-soft"
      }
    >
      <button type="button" onClick={onClick} className="flex items-center gap-1.5">
        {icon}
        {label}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Excluir categoria ${label}`}
        className="flex h-4 w-4 items-center justify-center rounded-full opacity-60 hover:opacity-100"
      >
        <X size={11} />
      </button>
    </span>
  );
}

const inputClass =
  "w-full rounded-2xl border border-brand-line bg-brand-card px-3.5 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-ink";

export function EntryForm({
  categories: initialCategories,
  defaultDate,
  hasError,
  separateByAccount,
  salaryPatterns,
  fixedExpenses,
  recognitionsRemaining,
  isCompleto,
  sharedPhoto,
  sharedText,
}: {
  categories: Category[];
  defaultDate: string;
  hasError: boolean;
  separateByAccount: boolean;
  salaryPatterns: string[];
  fixedExpenses: { name: string; expected_amount: number }[];
  recognitionsRemaining: number | null;
  isCompleto: boolean;
  sharedPhoto?: { dataUrl: string; isPdf: boolean } | null;
  sharedText?: string | null;
}) {
  const [mode, setMode] = useState<"manual" | "foto" | "chat">(
    sharedPhoto ? "foto" : sharedText ? "chat" : "manual",
  );
  const [type, setType] = useState<"despesa" | "receita">("despesa");
  const [categories, setCategories] = useState(initialCategories);
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id ?? "");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [incomeType, setIncomeType] = useState<"salario" | "outra">("salario");
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [dueDate, setDueDate] = useState(defaultDate);
  const [duplicateDueDate, setDuplicateDueDate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isCreditCard || !isCompleto) {
      setDuplicateDueDate(false);
      return;
    }
    let cancelled = false;
    checkExistingInvoiceDate(dueDate).then((dup) => {
      if (!cancelled) setDuplicateDueDate(dup);
    });
    return () => {
      cancelled = true;
    };
  }, [isCreditCard, isCompleto, dueDate]);

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const confirm = useConfirm();

  function selectCategory(id: string) {
    setCategoryId(id);
    setCategoryTouched(true);
  }

  function handleDescriptionBlur(description: string) {
    if (type !== "despesa" || categoryTouched) return;
    const suggested = suggestCategoryName(description);
    if (!suggested) return;
    const match = categories.find((c) => c.name === suggested);
    if (match) setCategoryId(match.id);
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    setCategoryError("");
    try {
      const created = await createCategory(newCategoryName);
      setCategories((prev) =>
        prev.some((c) => c.id === created.id) ? prev : [...prev, created],
      );
      setCategoryId(created.id);
      setCategoryTouched(true);
      setNewCategoryName("");
      setAddingCategory(false);
    } catch {
      setCategoryError("Não deu pra criar essa categoria agora.");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    const confirmed = await confirm(
      `Excluir a categoria "${name}"? Gastos já marcados com ela ficam sem categoria.`,
    );
    if (!confirmed) return;

    setCategoryError("");
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (categoryId === id) {
        setCategoryId("");
        setCategoryTouched(false);
      }
    } catch {
      setCategoryError("Não deu pra excluir essa categoria agora.");
    }
  }

  return (
    <>
      <div className="mb-4 flex gap-1.5 rounded-2xl bg-brand-card p-1.5">
        <TypeTab
          active={mode === "manual"}
          onClick={() => setMode("manual")}
          icon={<Pencil size={15} />}
          label="Manual"
        />
        <TypeTab
          active={mode === "foto"}
          onClick={() => setMode("foto")}
          icon={<Camera size={15} />}
          label="Foto"
        />
        <TypeTab
          active={mode === "chat"}
          onClick={() => setMode("chat")}
          icon={<MessageCircle size={15} />}
          label="Chat"
        />
      </div>

      {mode === "foto" ? (
        <PhotoTab
          salaryPatterns={salaryPatterns}
          fixedExpenses={fixedExpenses}
          categories={categories}
          recognitionsRemaining={recognitionsRemaining}
          sharedPhoto={sharedPhoto}
        />
      ) : mode === "chat" ? (
        <ChatTab
          fixedExpenses={fixedExpenses}
          categories={categories}
          salaryPatterns={salaryPatterns}
          recognitionsRemaining={recognitionsRemaining}
          isCompleto={isCompleto}
          initialText={sharedText}
        />
      ) : (
        <form
          action={createEntry}
          onSubmit={() => setSubmitting(true)}
          className="rounded-[20px] bg-brand-card p-[18px]"
        >
          <div className="mb-5 flex gap-1.5 rounded-2xl bg-brand-bg p-1.5">
            <TypeTab
              active={type === "despesa"}
              onClick={() => setType("despesa")}
              icon={<ArrowDownCircle size={15} />}
              label="Saiu (despesa)"
            />
            <TypeTab
              active={type === "receita"}
              onClick={() => {
                setType("receita");
                setIsCreditCard(false);
              }}
              icon={<ArrowUpCircle size={15} />}
              label="Entrou (receita)"
            />
          </div>
      <input type="hidden" name="type" value={type} />

      {hasError && (
        <p className="mb-3 text-sm text-brand-coral">
          Confere os campos — não deu pra salvar esse lançamento.
        </p>
      )}

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
            name="amount"
            required
            inputMode="decimal"
            placeholder="0,00"
            className={`${inputClass} pl-9`}
            onChange={(e) => {
              e.target.value = formatCentsInput(e.target.value);
            }}
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
          name="description"
          required
          placeholder={type === "receita" ? "Ex.: Salário de julho" : "Ex.: Mercado do mês"}
          className={inputClass}
          onBlur={(e) => handleDescriptionBlur(e.target.value)}
        />
      </div>

      {type === "despesa" ? (
        <div className="mb-4">
          <div className="mb-1.5 text-xs font-medium text-brand-ink-soft">Categoria</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <ChipButton
                key={c.id}
                active={categoryId === c.id}
                onClick={() => selectCategory(c.id)}
                label={c.name}
                onDelete={() => handleDeleteCategory(c.id, c.name)}
              />
            ))}
            {!addingCategory && (
              <ChipButton
                active={false}
                onClick={() => setAddingCategory(true)}
                label="Nova"
                icon={<Plus size={13} />}
              />
            )}
          </div>

          {addingCategory && (
            <div className="mt-2.5 flex gap-2">
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                className={`${inputClass} flex-1 px-3 py-2 text-sm`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
              <button
                type="button"
                disabled={creatingCategory}
                onClick={handleCreateCategory}
                className="rounded-xl bg-brand-ink-solid px-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {creatingCategory ? "..." : "Adicionar"}
              </button>
            </div>
          )}
          {categoryError && (
            <p className="mt-1.5 text-xs text-brand-coral">{categoryError}</p>
          )}

          <input type="hidden" name="category_id" value={categoryId} />
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
                    ? "flex-1 rounded-full border border-brand-ink bg-brand-ink-solid px-0 py-2.5 text-sm font-medium text-white"
                    : "flex-1 rounded-full border border-brand-line bg-brand-card px-0 py-2.5 text-sm font-medium text-brand-ink-soft"
                }
              >
                {label}
              </button>
            ))}
          </div>
          <input type="hidden" name="income_type" value={incomeType} />
        </div>
      )}

      {type === "despesa" && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setIsCreditCard((v) => !v)}
            className={
              isCreditCard
                ? "flex items-center gap-1.5 rounded-full border border-brand-plum bg-brand-plum px-3.5 py-2 text-sm font-medium text-white"
                : "flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-card px-3.5 py-2 text-sm font-medium text-brand-ink-soft"
            }
          >
            <CreditCard size={13} />
            Foi no crédito?
          </button>
        </div>
      )}

      <div className="mb-1">
        {isCreditCard && isCompleto ? (
          <>
            <label
              className="mb-1.5 block text-xs font-medium text-brand-ink-soft"
              htmlFor="due_date"
            >
              Vencimento da fatura
            </label>
            <input
              id="due_date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${inputClass} min-w-0`}
            />
            {duplicateDueDate && (
              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-brand-coral">
                <AlertTriangle size={11} className="flex-shrink-0" />
                Você já tem uma fatura salva com essa data de vencimento
              </div>
            )}
            <input type="hidden" name="due_date" value={dueDate} />
            <input type="hidden" name="is_credit_card" value="true" />
          </>
        ) : (
          <>
            <label
              className="mb-1.5 block text-xs font-medium text-brand-ink-soft"
              htmlFor="entry_date"
            >
              Data
            </label>
            <input
              id="entry_date"
              name="entry_date"
              type="date"
              required
              defaultValue={defaultDate}
              className={`${inputClass} min-w-0`}
            />
            <input type="hidden" name="is_credit_card" value="false" />
          </>
        )}
        {isCreditCard && !isCompleto && (
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-brand-plum/10 px-2.5 py-2 text-[11px] leading-snug text-brand-plum">
            <Lock size={11} className="mt-0.5 flex-shrink-0" />
            <span>
              Rastrear isso certinho na fatura (com data de vencimento) é um recurso do{" "}
              <Link href="/app/planos" className="font-semibold underline underline-offset-2">
                Completo
              </Link>
              . Por enquanto, vai entrar como um gasto normal, na data acima.
            </span>
          </div>
        )}
      </div>

      {separateByAccount && (
        <div className="mb-1 mt-4">
          <label
            className="mb-1.5 block text-xs font-medium text-brand-ink-soft"
            htmlFor="account_name"
          >
            Conta/banco
          </label>
          <input
            id="account_name"
            name="account_name"
            required
            placeholder="Ex.: Nubank"
            className={inputClass}
          />
        </div>
      )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-sage py-3.5 font-display text-[15px] font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "..." : "Salvar"}
          </button>
        </form>
      )}
    </>
  );
}
