"use client";

import { useState } from "react";
import { Check, CreditCard, Pencil, Plus, Trash2, X } from "lucide-react";
import { CARD_COLORS, TOKENS } from "@/lib/tokens";
import { useConfirm } from "../../confirm-dialog";
import { createCard, deleteCard, updateCard, type Card } from "./actions";

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {CARD_COLORS.map((c) => {
        const isSelected = value === c.hex;
        return (
          <button
            key={c.hex}
            type="button"
            onClick={() => onChange(c.hex)}
            aria-label={c.label}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: c.hex,
              border: isSelected ? `2px solid ${TOKENS.ink}` : "2px solid transparent",
            }}
          >
            {isSelected && <Check size={14} className="text-white" />}
          </button>
        );
      })}
    </div>
  );
}

function CardRow({
  card,
  onSaved,
  onDeleted,
}: {
  card: Card;
  onSaved: (id: string, name: string, color: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(card.name);
  const [color, setColor] = useState(card.color);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const confirm = useConfirm();

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateCard(card.id, name, color);
      onSaved(card.id, updated.name, updated.color);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu pra salvar agora.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = await confirm(
      `Excluir o cartão "${card.name}"? As faturas dele continuam existindo, só ficam sem cartão associado.`,
    );
    if (!confirmed) return;
    try {
      await deleteCard(card.id);
      onDeleted(card.id);
    } catch {
      setError("Não deu pra excluir agora.");
    }
  }

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[11px]"
          style={{ background: editing ? color : card.color }}
        >
          <CreditCard size={15} className="text-white" />
        </div>

        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            className="flex-1 rounded-xl border border-brand-line bg-brand-card px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
          />
        ) : (
          <div className="flex-1 truncate text-[14.5px] font-medium text-brand-ink">
            {card.name}
          </div>
        )}

        {editing ? (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              aria-label="Salvar"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-ink-solid text-white disabled:opacity-60"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(card.name);
                setColor(card.color);
                setError("");
              }}
              aria-label="Cancelar"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-brand-ink-soft"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Editar ${card.name}`}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-brand-ink-soft"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label={`Excluir ${card.name}`}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-brand-ink-soft"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
      {editing && (
        <div className="mt-3 pl-[46px]">
          <ColorPicker value={color} onChange={setColor} />
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
    </div>
  );
}

export function CartoesBody({ cards: initial }: { cards: Card[] }) {
  const [cards, setCards] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(CARD_COLORS[0].hex);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  function handleSaved(id: string, name: string, color: string) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, name, color } : c)));
  }

  function handleDeleted(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const created = await createCard(newName, newColor);
      setCards((prev) => (prev.some((c) => c.id === created.id) ? prev : [...prev, created]));
      setNewName("");
      setNewColor(CARD_COLORS[0].hex);
      setAdding(false);
    } catch {
      setError("Não deu pra criar esse cartão agora.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      {cards.length === 0 ? (
        <div className="mb-3.5 rounded-2xl bg-brand-card p-5">
          <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
            Nenhum cartão ainda.
          </div>
          <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
            Crie o primeiro cartão aqui embaixo pra poder escolher onde entra cada compra no
            crédito.
          </div>
        </div>
      ) : (
        <div className="mb-3.5 divide-y divide-brand-bg overflow-hidden rounded-2xl bg-brand-card">
          {cards.map((c) => (
            <CardRow key={c.id} card={c} onSaved={handleSaved} onDeleted={handleDeleted} />
          ))}
        </div>
      )}

      {adding ? (
        <div className="rounded-2xl bg-brand-card p-[18px]">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do cartão (ex: Nubank)"
            className="mb-3 w-full rounded-xl border border-brand-line bg-brand-card px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-ink"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <ColorPicker value={newColor} onChange={setNewColor} />
          <button
            type="button"
            disabled={creating}
            onClick={handleCreate}
            className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-ink-solid py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Check size={14} />
            {creating ? "..." : "Adicionar"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-line py-3.5 text-[14px] font-medium text-brand-ink-soft"
        >
          <Plus size={16} />
          Novo cartão
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
    </div>
  );
}
