/**
 * Prazo usado quando a Hotmart não informa a data da próxima cobrança.
 *
 * A escolha é deliberadamente a favor da usuária: entre dar alguns dias de
 * acesso a mais ou tirar um acesso que ela pagou, o primeiro custa centavos
 * (cada reconhecimento por IA sai por volta de R$0,04) e o segundo vira
 * reclamação e pedido de reembolso.
 */
const FALLBACK_DAYS = 31;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Até quando o Completo continua valendo depois de um cancelamento.
 *
 * Recebe a data da próxima cobrança que não vai mais acontecer — que é
 * exatamente o fim do período já pago. Sem ela, ou com uma data já vencida
 * (assinatura atrasada, por exemplo), cai no prazo de segurança.
 */
export function accessUntilAfterCancel(
  paidUntil: Date | null | undefined,
  now: Date = new Date(),
): Date {
  const fallback = new Date(now.getTime() + FALLBACK_DAYS * DAY_MS);

  if (!paidUntil || Number.isNaN(paidUntil.getTime())) return fallback;
  if (paidUntil.getTime() <= now.getTime()) return fallback;

  return paidUntil;
}

/** Verdadeiro quando o acesso agendado já venceu e o plano deve cair. */
export function hasAccessExpired(
  accessUntil: string | Date | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!accessUntil) return false;
  const until = new Date(accessUntil);
  if (Number.isNaN(until.getTime())) return false;
  return until.getTime() <= now.getTime();
}
