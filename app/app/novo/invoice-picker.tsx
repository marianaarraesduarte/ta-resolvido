"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, CreditCard, Plus, Settings } from "lucide-react";
import { brDateLabel } from "@/lib/date";
import { CARD_COLORS, TOKENS } from "@/lib/tokens";
import { checkExistingInvoiceDate, type CardWithInvoices, type CreditSelection } from "./actions";
import { createCard } from "../config/cartoes/actions";

export type InvoiceValue =
  | { kind: "existing"; invoiceId: string }
  | { kind: "new"; cardId: string; dueDate: string };

export function invoiceValueToSelection(value: InvoiceValue | null): CreditSelection | null {
  if (!value) return null;
  return value.kind === "existing"
    ? { kind: "existing", invoiceId: value.invoiceId }
    : { kind: "new", cardId: value.cardId, dueDate: value.dueDate };
}

/**
 * Data que essa fatura vai ter — direto do valor escolhido se for "nova", ou
 * procurada entre as faturas já existentes se for "existing". É o que falta
 * pra checar duplicidade antes de escolher a fatura ter uma data conhecida.
 */
export function invoiceValueToDate(
  value: InvoiceValue | null,
  cards: CardWithInvoices[],
): string | null {
  if (!value) return null;
  if (value.kind === "new") return value.dueDate;
  for (const card of cards) {
    const invoice = card.invoices.find((inv) => inv.id === value.invoiceId);
    if (invoice) return invoice.dueDate;
  }
  return null;
}

/**
 * Escolher em qual fatura uma compra no crédito entra: uma lista das
 * faturas já existentes, agrupadas por cartão, mais um atalho pra criar
 * uma nova sob um cartão específico.
 */
export function InvoicePicker({
  cards,
  value,
  onChange,
  defaultDate,
}: {
  cards: CardWithInvoices[];
  value: InvoiceValue | null;
  onChange: (value: InvoiceValue) => void;
  defaultDate: string;
}) {
  const router = useRouter();
  const [creatingForCard, setCreatingForCard] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState(defaultDate);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState<string>(CARD_COLORS[0].hex);
  const [creatingCard, setCreatingCard] = useState(false);
  const [cardError, setCardError] = useState("");

  function startCreating(cardId: string) {
    setCreatingForCard(cardId);
    setDraftDate(defaultDate);
    setDuplicateWarning(false);
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
      // Só recarrega os dados do servidor (a lista de cartões) — o resto do
      // formulário/análise já em andamento continua exatamente como estava,
      // sem perder nada por causa de uma navegação de página.
      router.refresh();
    } catch {
      setCardError("Não deu pra criar esse cartão agora.");
    } finally {
      setCreatingCard(false);
    }
  }

  async function handleDraftDateChange(cardId: string, date: string) {
    setDraftDate(date);
    const dup = await checkExistingInvoiceDate(cardId, date);
    setDuplicateWarning(dup);
  }

  function confirmNewInvoice(cardId: string) {
    onChange({ kind: "new", cardId, dueDate: draftDate });
    setCreatingForCard(null);
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
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <div key={card.id}>
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: card.color }} />
            <span className="text-[12px] font-semibold text-brand-ink-soft">{card.name}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {card.invoices.map((invoice) => {
              const isSelected = value?.kind === "existing" && value.invoiceId === invoice.id;
              return (
                <button
                  key={invoice.id}
                  type="button"
                  onClick={() => onChange({ kind: "existing", invoiceId: invoice.id })}
                  className={
                    isSelected
                      ? "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium text-white"
                      : "flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-card px-3 py-2 text-[13px] font-medium text-brand-ink"
                  }
                  style={isSelected ? { background: card.color, borderColor: card.color } : undefined}
                >
                  <CreditCard size={12} />
                  {brDateLabel(invoice.dueDate)}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => startCreating(card.id)}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-brand-line px-3 py-2 text-[13px] font-medium text-brand-ink-soft"
            >
              <Plus size={13} />
              Nova fatura
            </button>
          </div>
          {creatingForCard === card.id && (
            <div className="mt-2 rounded-2xl bg-brand-bg px-3.5 py-3">
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-brand-ink-soft"
                htmlFor={`new-invoice-date-${card.id}`}
              >
                Vencimento da nova fatura
              </label>
              <div className="flex gap-2">
                <input
                  id={`new-invoice-date-${card.id}`}
                  type="date"
                  value={draftDate}
                  onChange={(e) => handleDraftDateChange(card.id, e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-brand-line bg-brand-card px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
                />
                <button
                  type="button"
                  onClick={() => confirmNewInvoice(card.id)}
                  className="flex-shrink-0 rounded-xl bg-brand-ink-solid px-3.5 text-sm font-semibold text-white"
                >
                  OK
                </button>
              </div>
              {duplicateWarning && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-brand-coral">
                  <AlertTriangle size={11} className="flex-shrink-0" />
                  Você já tem uma fatura desse cartão com essa data
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {addCardBlock}
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
