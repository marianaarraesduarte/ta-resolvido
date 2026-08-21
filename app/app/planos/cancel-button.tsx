"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "../confirm-dialog";
import { cancelSubscription } from "./actions";

export function CancelButton() {
  const router = useRouter();
  const confirm = useConfirm();
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    const ok = await confirm(
      "Isso cancela sua assinatura na Hotmart e desativa o Completo aqui no app agora mesmo. Você não vai ser cobrada de novo. Quer continuar?",
      { confirmLabel: "Cancelar assinatura", cancelLabel: "Voltar" },
    );
    if (!ok) return;

    setCanceling(true);
    setError("");
    try {
      await cancelSubscription();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu pra cancelar agora.");
      setCanceling(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={canceling}
        onClick={handleCancel}
        className="w-full text-center text-[12.5px] font-medium text-brand-card/70 underline underline-offset-2 disabled:opacity-60"
      >
        {canceling ? "Cancelando..." : "Cancelar assinatura"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-brand-coral">{error}</p>}
    </div>
  );
}
