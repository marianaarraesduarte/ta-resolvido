"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { useConfirm } from "./confirm-dialog";

const REVEAL_WIDTH = 76;
const DRAG_THRESHOLD = 8;

/**
 * Arrastar pra esquerda revela um botão de excluir (igual iOS), com
 * confirmação antes de excluir de verdade — pra não apagar sem querer só
 * de arrastar. Um toque simples (sem arrastar) continua chamando onTap
 * normalmente.
 */
export function SwipeToDelete({
  onDelete,
  onTap,
  disabled,
  itemLabel,
  children,
}: {
  onDelete: () => Promise<void>;
  onTap?: () => void;
  disabled?: boolean;
  itemLabel: string;
  children: React.ReactNode;
}) {
  const [translateX, setTranslateX] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const dragging = useRef(false);
  const moved = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const baseX = useRef(0);
  const confirm = useConfirm();

  function handlePointerDown(e: React.PointerEvent) {
    if (disabled) return;
    moved.current = false;
    dragging.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    baseX.current = translateX;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (disabled || !start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!dragging.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      if (Math.abs(dy) > Math.abs(dx)) return;
      dragging.current = true;
    }
    moved.current = true;
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, baseX.current + dx));
    setTranslateX(next);
  }

  function handlePointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    setTranslateX((current) => (current <= -REVEAL_WIDTH / 2 ? -REVEAL_WIDTH : 0));
  }

  function handleRowClick(e: React.MouseEvent) {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (translateX !== 0) {
      e.preventDefault();
      setTranslateX(0);
      return;
    }
    onTap?.();
  }

  async function handleDelete() {
    const confirmed = await confirm(`Excluir "${itemLabel}"? Essa ação não pode ser desfeita.`);
    if (!confirmed) {
      setTranslateX(0);
      return;
    }
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setTranslateX(0);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex" style={{ width: REVEAL_WIDTH }}>
        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          aria-label={`Excluir ${itemLabel}`}
          className="flex h-full w-full items-center justify-center bg-brand-coral text-white disabled:opacity-60"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleRowClick}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: dragging.current ? "none" : "transform 0.2s ease",
          touchAction: disabled ? "auto" : "pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}
