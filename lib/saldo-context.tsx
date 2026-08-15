"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type GoalKind = "liberdade_financeira" | "longo_prazo" | "curto_prazo";

type SaldoContextValue = {
  saldo: number;
  setGoalPercent: (kind: GoalKind, percent: number) => void;
};

const SaldoContext = createContext<SaldoContextValue | null>(null);

export function SaldoProvider({
  receitaDoMes,
  despesaDoMes,
  initialGoalPercents,
  children,
}: {
  receitaDoMes: number;
  despesaDoMes: number;
  initialGoalPercents: Record<GoalKind, number>;
  children: React.ReactNode;
}) {
  const [goalPercents, setGoalPercents] = useState(initialGoalPercents);

  const value = useMemo<SaldoContextValue>(() => {
    const totalPct = Object.values(goalPercents).reduce((sum, p) => sum + p, 0);
    const investido = (receitaDoMes * totalPct) / 100;
    return {
      saldo: receitaDoMes - despesaDoMes - investido,
      setGoalPercent: (kind, percent) =>
        setGoalPercents((prev) => ({ ...prev, [kind]: percent })),
    };
  }, [goalPercents, receitaDoMes, despesaDoMes]);

  return <SaldoContext.Provider value={value}>{children}</SaldoContext.Provider>;
}

export function useSaldo(): SaldoContextValue {
  const ctx = useContext(SaldoContext);
  if (!ctx) throw new Error("useSaldo precisa estar dentro de um SaldoProvider.");
  return ctx;
}
