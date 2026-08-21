"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmOptions = { confirmLabel?: string; cancelLabel?: string };
type ConfirmFn = (message: string, options?: ConfirmOptions) => Promise<boolean>;
type ConfirmState = { message: string; options: ConfirmOptions; resolve: (ok: boolean) => void } | null;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>(null);

  const confirm = useCallback<ConfirmFn>((message, options = {}) => {
    return new Promise<boolean>((resolve) => {
      setState({ message, options, resolve });
    });
  }, []);

  function handle(ok: boolean) {
    state?.resolve(ok);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/40 px-4 pb-6 sm:items-center">
          <div className="w-full max-w-sm rounded-[22px] bg-brand-card p-6 shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-coral/15">
              <AlertTriangle size={18} className="text-brand-coral" />
            </div>
            <p className="mb-5 text-[14.5px] leading-snug text-brand-ink">{state.message}</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handle(false)}
                className="flex-1 rounded-xl border border-brand-line bg-white py-2.5 text-sm font-semibold text-brand-ink-soft"
              >
                {state.options.cancelLabel ?? "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => handle(true)}
                className="flex-1 rounded-xl bg-brand-coral py-2.5 text-sm font-semibold text-white"
              >
                {state.options.confirmLabel ?? "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm precisa estar dentro de <ConfirmDialogProvider>.");
  }
  return ctx;
}
