"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "../confirm-dialog";
import { cancelSubscription } from "./actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

export function CancelButton() {
  const router = useRouter();
  const confirm = useConfirm();
  const [canceling, setCanceling] = useState(false);
  const [canceledUntil, setCanceledUntil] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCancel() {
    const ok = await confirm(
      "Isso cancela sua assinatura e você não vai ser cobrada de novo. O Completo continua funcionando até o fim do período que você já pagou. Quer continuar?",
      { confirmLabel: "Cancelar assinatura", cancelLabel: "Voltar" },
    );
    if (!ok) return;

    setCanceling(true);
    setError("");
    try {
      const { accessUntil } = await cancelSubscription();
      setCanceledUntil(accessUntil);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu pra cancelar agora.");
    } finally {
      setCanceling(false);
    }
  }

  if (canceledUntil) {
    return (
      <div className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-center">
        <p className="text-[12.5px] leading-relaxed text-white/85">
          Assinatura cancelada. Você não será cobrada de novo, e o Completo continua funcionando
          até <span className="font-semibold text-white">{formatDate(canceledUntil)}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={canceling}
        onClick={handleCancel}
        className="w-full text-center text-[12.5px] font-medium text-white/70 underline underline-offset-2 disabled:opacity-60"
      >
        {canceling ? "Cancelando..." : "Cancelar assinatura"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-brand-coral">{error}</p>}
    </div>
  );
}
