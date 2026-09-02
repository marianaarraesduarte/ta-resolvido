/** Quantos reconhecimentos por IA o plano grátis dá em um mês comum. */
export const FREE_RECOGNITION_LIMIT = 3;

/**
 * Quantos o plano grátis dá nos primeiros 30 dias de conta.
 *
 * Existe por um problema concreto de entrada: quem chega com dois ou três
 * meses de extrato atrasado bate no teto antes de ver o app cheio de dados —
 * que é justamente o momento em que ele convence. A cota maior é generosa
 * onde cria o hábito e continua apertada onde força a decisão.
 *
 * Custa quase nada: cada reconhecimento sai por volta de R$0,04 na API do
 * Gemini, então 7 a mais por pessoa é menos de trinta centavos, uma única vez.
 */
export const FIRST_MONTH_RECOGNITION_LIMIT = 10;

const FIRST_MONTH_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isCompleto(plan: string | null | undefined): boolean {
  return plan === "completo";
}

export type RecognitionAllowance = {
  /** Quantos reconhecimentos cabem na janela atual. */
  limit: number;
  /** A partir de quando contar o que já foi usado. */
  countFrom: Date;
  /** Se a pessoa ainda está na cota maior dos primeiros 30 dias. */
  isFirstMonth: boolean;
};

/**
 * Decide qual cota vale pra essa conta agora, e de quando contar o que já foi
 * usado.
 *
 * A janela muda junto com a cota, de propósito. Contar a cota de estreia por
 * mês do calendário puniria quem se cadastrou dia 28: teria 10 por três dias
 * e cairia pra 3 na virada. Nos primeiros 30 dias a contagem é desde a
 * criação da conta; depois disso volta a ser por mês do calendário.
 */
export function recognitionAllowance(
  accountCreatedAt: string | Date | null | undefined,
  now: Date = new Date(),
): RecognitionAllowance {
  const createdAt = accountCreatedAt ? new Date(accountCreatedAt) : null;

  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    const firstMonthEndsAt = new Date(createdAt.getTime() + FIRST_MONTH_DAYS * DAY_MS);
    if (now < firstMonthEndsAt) {
      return {
        limit: FIRST_MONTH_RECOGNITION_LIMIT,
        countFrom: createdAt,
        isFirstMonth: true,
      };
    }
  }

  const firstDayOfMonth = new Date(now);
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  return { limit: FREE_RECOGNITION_LIMIT, countFrom: firstDayOfMonth, isFirstMonth: false };
}

/**
 * Verdadeiro quando a usuária já bateu a cota de reconhecimentos por IA
 * (foto, PDF, áudio ou chat) da janela atual — as quatro formas contam pra
 * mesma cota. Quem é do Completo nunca bate o limite.
 */
export function isRecognitionLimitReached(
  plan: string | null | undefined,
  countInWindow: number,
  limit: number = FREE_RECOGNITION_LIMIT,
): boolean {
  if (isCompleto(plan)) return false;
  return countInWindow >= limit;
}
