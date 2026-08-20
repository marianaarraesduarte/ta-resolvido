import { createBrowserClient } from "@supabase/ssr";

// flowType "implicit" em vez do padrão "pkce": os links de e-mail (confirmar
// conta, redefinir senha) costumam ser abertos num app ou navegador diferente
// de onde foram pedidos — muito comum no celular. O fluxo PKCE exige que o
// mesmo navegador que pediu o link seja o que completa ele, o que quebra
// nesse caso comum. O fluxo implícito manda a sessão inteira dentro do
// próprio link, então funciona não importa onde ele é aberto. Esse app não
// usa login OAuth (só e-mail/senha), então não perde a proteção que o PKCE
// dá pra esse outro tipo de fluxo.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: "implicit" } },
  );
}
