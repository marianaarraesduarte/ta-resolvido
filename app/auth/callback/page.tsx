"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Confirma o cadastro por e-mail. Isso precisa rodar no navegador (não no
// servidor) porque o link de confirmação manda a sessão inteira dentro do
// próprio link (depois de "#"), formato que só o JavaScript do navegador
// consegue ler — comum quando o e-mail é aberto num app diferente de onde a
// pessoa se cadastrou, muito comum no celular. Ver também /reset-password,
// que resolve o mesmo problema pro link de redefinir senha.
export default function AuthCallbackPage() {
  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/app";

    async function run() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = params.get("code");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        return !error;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        return !error;
      }

      const { data } = await supabase.auth.getUser();
      return !!data.user;
    }

    run().then((ok) => {
      window.location.href = ok ? next : "/login?error=auth";
    });
  }, []);

  return null;
}
