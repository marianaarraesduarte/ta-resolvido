import { cookies } from "next/headers";

// Guarda qual mês a usuária escolheu ver por último, pra toda tela do app
// (régua, resumo, etc) abrir nesse mesmo mês em vez de sempre voltar pro
// atual — só some quando ela aperta "voltar pro mês atual" de propósito.
export const MONTH_COOKIE_NAME = "mes_selecionado";
// Sempre o mesmo valor usado tanto pra gravar quanto pra apagar esse cookie —
// um path diferente entre os dois faz o navegador tratar como cookies
// diferentes, e "apagar" vira um no-op silencioso (bug real que já aconteceu).
export const MONTH_COOKIE_PATH = "/app";

export async function getSelectedMonthKey(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(MONTH_COOKIE_NAME)?.value ?? null;
}
