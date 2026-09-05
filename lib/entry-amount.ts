/**
 * A regra de valor de um lançamento, num lugar só.
 *
 * Ela existia espalhada: a edição manual checava negativo, o lançamento novo
 * exigia positivo, e o salvamento vindo de foto/chat/áudio não checava nada —
 * então a mesma regra valia ou não dependendo de por onde o lançamento entrou.
 *
 * Negativo só faz sentido como estorno/devolução dentro de uma fatura de
 * cartão: é a única situação em que um "gasto" reduz o total em vez de
 * aumentar. Fora da fatura, um gasto negativo não significa nada. Zero nunca
 * significa nada — e o banco recusa (constraint amount <> 0), mas com uma
 * mensagem que não ajuda ninguém.
 *
 * Devolve a mensagem pra mostrar na tela, ou null quando o valor está bom.
 */
export function entryAmountError(amount: number, insideInvoice: boolean): string | null {
  if (!Number.isFinite(amount) || amount === 0) {
    return "Confere o valor antes de salvar.";
  }
  if (amount < 0 && !insideInvoice) {
    return "Valor negativo só é permitido em lançamentos dentro de uma fatura (estorno).";
  }
  return null;
}
