import { daysInMonth } from "./date";

export type CardCycle = { dueDay: number; closingDay: number | null };

/** Sem fechamento cadastrado, assume que fecha uns 7 dias antes do
 * vencimento — a média mais comum entre os cartões. */
function estimateClosingDay(dueDay: number): number {
  const raw = dueDay - 7;
  return raw >= 1 ? raw : raw + 28;
}

function clampDayToMonth(year: number, month1: number, day: number): number {
  return Math.min(day, daysInMonth(new Date(year, month1 - 1, 1)));
}

function addMonths(year: number, month1: number, delta: number): { year: number; month1: number } {
  const total = month1 - 1 + delta;
  return { year: year + Math.floor(total / 12), month1: ((total % 12) + 12) % 12 + 1 };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Em qual fatura uma compra cai, dado o cartão (dia de vencimento sempre,
 * fechamento se souber): compra até o fechamento entra nessa fatura, depois
 * do fechamento vai pra seguinte — a mesma regra, real ou estimada.
 */
export function resolveInvoiceDueDate(purchaseDateKey: string, cycle: CardCycle): string {
  const [py, pm, pd] = purchaseDateKey.split("-").map(Number);
  const closingDay = cycle.closingDay ?? estimateClosingDay(cycle.dueDay);

  let { year: cy, month1: cm } = { year: py, month1: pm };
  if (pd > closingDay) {
    ({ year: cy, month1: cm } = addMonths(py, pm, 1));
  }

  let { year: dueYear, month1: dueMonth } = { year: cy, month1: cm };
  if (cycle.dueDay <= closingDay) {
    ({ year: dueYear, month1: dueMonth } = addMonths(cy, cm, 1));
  }

  const day = clampDayToMonth(dueYear, dueMonth, cycle.dueDay);
  return `${dueYear}-${pad(dueMonth)}-${pad(day)}`;
}
