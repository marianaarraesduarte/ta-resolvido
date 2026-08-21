"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { currency } from "@/lib/tokens";

function ToastInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = searchParams.get("saved");
    if (!saved) return;

    let text: string;
    if (saved === "lote") {
      const count = Number(searchParams.get("count") ?? "0");
      text =
        count === 1
          ? "1 lançamento salvo e categorizado."
          : `${count} lançamentos salvos e categorizados.`;
    } else {
      const amount = Number(searchParams.get("amount") ?? "0");
      const category = searchParams.get("category") ?? "";
      text = category
        ? `${saved}, ${currency(amount)} — categorizado como ${category}.`
        : `${saved}, ${currency(amount)}.`;
    }
    setMessage(text);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("saved");
    params.delete("amount");
    params.delete("category");
    params.delete("count");
    router.replace(params.toString() ? `${pathname}?${params}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Separado do efeito acima de propósito: o router.replace() ali muda
  // searchParams de novo (removendo "saved"), o que re-dispararia esse
  // efeito e cancelaria o timer antes dos 3s se estivesse junto.
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-2xl bg-brand-ink px-4 py-3 text-[13px] font-medium text-brand-card shadow-lg">
        <Check size={15} className="flex-shrink-0 text-brand-sage" />
        {message}
      </div>
    </div>
  );
}

export function Toast() {
  return (
    <Suspense fallback={null}>
      <ToastInner />
    </Suspense>
  );
}
