import { monthKey, parseMonthKey } from "./date";

export type ViewedMonth = {
  firstDay: Date;
  lastDay: Date;
  isCurrentMonth: boolean;
  isFutureMonth: boolean;
  prevMonthKey: string;
  nextMonthKey: string;
};

/**
 * Resolve qual mês a pessoa está vendo: o parâmetro `?mes=` da URL manda,
 * senão usa o mês guardado no cookie, senão o mês real de hoje. Usado por
 * toda tela que lista lançamentos por mês — centralizado aqui pra régua,
 * Resumo, Categorias e o saldo do topo nunca ficarem calculando isso cada
 * um do seu jeito (e um dia saírem dessincronizados).
 */
export function resolveViewedMonth(
  mesParam: string | undefined,
  cookieMonthKey: string | null,
  today: Date = new Date(),
): ViewedMonth {
  const effectiveMes = mesParam ?? cookieMonthKey ?? undefined;
  const firstDay = effectiveMes
    ? parseMonthKey(effectiveMes)
    : new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0);

  const isCurrentMonth =
    firstDay.getFullYear() === today.getFullYear() && firstDay.getMonth() === today.getMonth();
  const isFutureMonth =
    firstDay.getFullYear() > today.getFullYear() ||
    (firstDay.getFullYear() === today.getFullYear() && firstDay.getMonth() > today.getMonth());

  const prevMonthKey = monthKey(new Date(firstDay.getFullYear(), firstDay.getMonth() - 1, 1));
  const nextMonthKey = monthKey(new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 1));

  return { firstDay, lastDay, isCurrentMonth, isFutureMonth, prevMonthKey, nextMonthKey };
}

/**
 * Até que data contar no saldo. No mês atual, só até hoje — pra não descontar
 * algo que ainda não aconteceu de verdade. Em outro mês (passado ou futuro),
 * até o fim daquele mês, porque o saldo mostrado ali já é o resultado
 * daquele período inteiro.
 */
export function saldoEndDate(viewed: ViewedMonth, today: Date = new Date()): Date {
  return viewed.isCurrentMonth ? today : viewed.lastDay;
}
