"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Pencil, Plus, Settings } from "lucide-react";
import { brDateLabel } from "@/lib/date";
import { resolveInvoiceDueDate } from "@/lib/invoice-resolve";
import { CARD_COLORS, TOKENS } from "@/lib/tokens";
import { type CardWithInvoices } from "./actions";
import { createCard, updateCard } from "../config/cartoes/actions";
import type { InvoiceValue } from "./invoice-picker";

/**
 * Substitui o antigo "escolher fatura na mão": aqui só se escolhe o cartão —
 * o app calcula sozinho em qual fatura a compra cai (vencimento do cartão,
 * ou vencimento + fechamento quando os dois estão cadastrados) e mostra pra
 * confirmar. Continua devolvendo um InvoiceValue "new", então o resto do
 * fluxo (resolveInvoiceId reaproveitando fatura existente pro mesmo
 * cartão+data) não precisa mudar nada.
 */
export function CardCreditPicker({
  cards,
  purchaseDate,
  value,
  onChange,
}: {
  cards: CardWithInvoices[];
  purchaseDate: string;
  value: InvoiceValue | null;
  onChange: (value: InvoiceValue) => void;
}) {
  const router = useRouter();
  const [pendingDueDayCardId, setPendingDueDayCardId] = useState<string | null>(null);
  const [pendingDueDay, setPendingDueDay] = useState("");
  const [pendingClosingDay, setPendingClosingDay] = useState("");
  const [savingDay, setSavingDay] = useState(false);
  const [dayError, setDayError] = useState("");
  const [overriding, setOverriding] = useState(false);
  const [overrideDraft, setOverrideDraft] = useState("");
  const [addingCard, setAddingCard] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState<string>(CARD_COLORS[0].hex);
  const [creatingCard, setCreatingCard] = useState(false);
  const [cardError, setCardError] = useState("");

  const selectedCardId = value?.kind === "new" ? value.cardId : null;

  function pickCard(card: CardWithInvoices) {
    setOverriding(false);
    if (!card.dueDay) {
      setPendingDueDayCardId(card.id);
      setPendingDueDay("");
      setPendingClosingDay("");
      setDayError("");
      return;
    }
    setPendingDueDayCardId(null);
    const dueDate = resolveInvoiceDueDate(purchaseDate, {
      dueDay: card.dueDay,
      closingDay: card.closingDay,
    });
    onChange({ kind: "new", cardId: card.id, dueDate });
  }

  async function confirmDueDay() {
    const card = cards.find((c) => c.id === pendingDueDayCardId);
    if (!card || !pendingDueDay) return;
    setSavingDay(true);
    setDayError("");
    try {
      const dueDay = Number(pendingDueDay);
      const closingDay = pendingClosingDay ? Number(pendingClosingDay) : null;
      await updateCard(card.id, card.name, card.color, dueDay, closingDay);
      const dueDate = resolveInvoiceDueDate(purchaseDate, { dueDay, closingDay });
      onChange({ kind: "new", cardId: card.id, dueDate });
      setPendingDueDayCardId(null);
      router.refresh();
    } catch {
      setDayError("Não deu pra salvar o vencimento agora.");
    } finally {
      setSavingDay(false);
    }
  }

  function confirmOverride() {
    if (!selectedCardId || !overrideDraft) return;
    onChange({ kind: "new", cardId: selectedCardId, dueDate: overrideDraft });
    setOverriding(false);
  }

  async function handleCreateCard() {
    if (!newCardName.trim()) return;
    setCreatingCard(true);
    setCardError("");
    try {
      await createCard(newCardName, newCardColor);
      setNewCardName("");
      setNewCardColor(CARD_COLORS[0].hex);
      setAddingCard(false);
      router.refresh();
    } catch {
      setCardError("Não deu pra criar esse cartão agora.");
    } finally {
      setCreatingCard(false);
    }
  }

  const addCardBlock = addingCard ? (
    <div className="rounded-2xl bg-brand-bg px-3.5 py-3">
      <input
        autoFocus
        value={newCardName}
        onChange={(e) => setNewCardName(e.target.value)}
        placeholder="Nome do cartão (ex: Nubank)"
        className="mb-2.5 w-full rounded-xl border border-brand-line bg-brand-card px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCreateCard();
          }
        }}
      />
      <div className="flex flex-wrap gap-2">
        {CARD_COLORS.map((c) => {
          const isSelected = newCardColor === c.hex;
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => setNewCardColor(c.hex)}
              aria-label={c.label}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                background: c.hex,
                border: isSelected ? `2px solid ${TOKENS.ink}` : "2px solid transparent",
              }}
            >
              {isSelected && <Check size={12} className="text-white" />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-brand-ink-soft">
        Dá pra completar o vencimento assim que escolher esse cartão.
      </p>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          disabled={creatingCard}
          onClick={handleCreateCard}
          className="flex-1 rounded-xl bg-brand-ink-solid py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {creatingCard ? "..." : "Adicionar cartão"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAddingCard(false);
            setCardError("");
          }}
          className="rounded-xl border border-brand-line px-3.5 text-sm font-medium text-brand-ink-soft"
        >
          Cancelar
        </button>
      </div>
      {cardError && <p className="mt-1.5 text-xs text-brand-coral">{cardError}</p>}
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setAddingCard(true)}
      className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-plum"
    >
      <Plus size={13} />
      Novo cartão
    </button>
  );

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl bg-brand-plum/10 px-3.5 py-3 text-[13px] leading-snug text-brand-plum">
        <p className="mb-2.5">Você ainda não tem nenhum cartão cadastrado.</p>
        {addCardBlock}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-2">
        {cards.map((card) => {
          const isSelected = selectedCardId === card.id || pendingDueDayCardId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => pickCard(card)}
              className={
                isSelected
                  ? "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium text-white"
                  : "flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-card px-3 py-2 text-[13px] font-medium text-brand-ink"
              }
              style={isSelected ? { background: card.color, borderColor: card.color } : undefined}
            >
              <CreditCard size={12} />
              {card.name}
            </button>
          );
        })}
      </div>

      {addCardBlock}

      {pendingDueDayCardId && (
        <div className="rounded-2xl bg-brand-bg px-3.5 py-3">
          <p className="mb-2 text-[12.5px] leading-snug text-brand-ink">
            Esse cartão ainda não tem dia de vencimento cadastrado. Qual é?
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={31}
              autoFocus
              value={pendingDueDay}
              onChange={(e) => setPendingDueDay(e.target.value)}
              placeholder="Vencimento"
              className="min-w-0 flex-1 rounded-xl border border-brand-line bg-brand-card px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
            />
            <input
              type="number"
              min={1}
              max={31}
              value={pendingClosingDay}
              onChange={(e) => setPendingClosingDay(e.target.value)}
              placeholder="Fechamento (opcional)"
              className="min-w-0 flex-1 rounded-xl border border-brand-line bg-brand-card px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
            />
            <button
              type="button"
              disabled={savingDay || !pendingDueDay}
              onClick={confirmDueDay}
              className="flex-shrink-0 rounded-xl bg-brand-ink-solid px-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              OK
            </button>
          </div>
          {dayError && <p className="mt-1.5 text-xs text-brand-coral">{dayError}</p>}
        </div>
      )}

      {value?.kind === "new" && selectedCardId && !pendingDueDayCardId && (
        <div className="rounded-2xl bg-brand-bg px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-sage">
                <Check size={11} />
                fatura encontrada
              </div>
              <div className="font-display text-lg font-bold text-brand-ink">
                {brDateLabel(value.dueDate)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOverriding((v) => !v);
                setOverrideDraft(value.dueDate);
              }}
              className="flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-brand-plum"
            >
              <Pencil size={11} />
              mudar
            </button>
          </div>
          {overriding && (
            <div className="mt-2.5 flex gap-2 border-t border-dashed border-brand-line pt-2.5">
              <input
                type="date"
                value={overrideDraft}
                onChange={(e) => setOverrideDraft(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-brand-line bg-brand-card px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
              />
              <button
                type="button"
                onClick={confirmOverride}
                className="flex-shrink-0 rounded-xl bg-brand-ink-solid px-3.5 text-sm font-semibold text-white"
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}

      <Link
        href="/app/config/cartoes"
        className="flex items-center gap-1.5 text-[12px] font-medium text-brand-ink-soft underline underline-offset-2"
      >
        <Settings size={12} />
        Editar cartões existentes
      </Link>
    </div>
  );
}
