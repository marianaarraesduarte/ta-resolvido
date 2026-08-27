"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { iconForCategory } from "@/lib/category-icons";
import { useConfirm } from "../../confirm-dialog";
import { createCategory, deleteCategory, renameCategory } from "../../novo/actions";

type Category = { id: string; name: string; icon: string | null };

function CategoryRow({
  category,
  onRenamed,
  onDeleted,
}: {
  category: Category;
  onRenamed: (id: string, name: string) => void;
  onDeleted: (id: string) => void;
}) {
  const Icon = iconForCategory(category.icon);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const confirm = useConfirm();

  async function handleSave() {
    if (!value.trim() || value.trim() === category.name) {
      setEditing(false);
      setValue(category.name);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await renameCategory(category.id, value);
      onRenamed(category.id, updated.name);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu pra renomear agora.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = await confirm(
      `Excluir a categoria "${category.name}"? Gastos já marcados com ela ficam sem categoria.`,
    );
    if (!confirmed) return;
    try {
      await deleteCategory(category.id);
      onDeleted(category.id);
    } catch {
      setError("Não deu pra excluir agora.");
    }
  }

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
      <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[11px] bg-brand-bg">
        <Icon size={15} className="text-brand-ink" />
      </div>

      {editing ? (
        <>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            className="flex-1 rounded-xl border border-brand-line bg-brand-card px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
          />
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
              setValue(category.name);
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
          <div className="flex-1 truncate text-[14.5px] font-medium text-brand-ink">
            {category.name}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Renomear ${category.name}`}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-brand-ink-soft"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Excluir ${category.name}`}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-brand-ink-soft"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
      </div>
      {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
    </div>
  );
}

export function CategoriasBody({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  function handleRenamed(id: string, name: string) {
    setCategories((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, name } : c))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    );
  }

  function handleDeleted(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const created = await createCategory(newName);
      setCategories((prev) =>
        prev.some((c) => c.id === created.id)
          ? prev
          : [...prev, { ...created, icon: null }].sort((a, b) =>
              a.name.localeCompare(b.name, "pt-BR"),
            ),
      );
      setNewName("");
      setAdding(false);
    } catch {
      setError("Não deu pra criar essa categoria agora.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      {categories.length === 0 ? (
        <div className="mb-3.5 rounded-2xl bg-brand-card p-5">
          <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
            Nenhuma categoria ainda.
          </div>
          <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
            Crie a primeira categoria aqui embaixo.
          </div>
        </div>
      ) : (
        <div className="mb-3.5 divide-y divide-brand-bg overflow-hidden rounded-2xl bg-brand-card">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              onRenamed={handleRenamed}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {adding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da categoria"
            className="flex-1 rounded-2xl border border-brand-line bg-brand-card px-3.5 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-ink"
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
            className="rounded-2xl bg-brand-ink-solid px-4 font-display text-sm font-semibold text-white disabled:opacity-60"
          >
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
          Nova categoria
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
    </div>
  );
}
