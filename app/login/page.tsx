"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(
        error.status === 429
          ? "Muitos pedidos de link em pouco tempo. Espera alguns minutos e tenta de novo."
          : "Não deu pra enviar o link agora. Tenta de novo em instantes.",
      );
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm rounded-2xl bg-brand-card p-8 shadow-sm">
        <h1 className="mb-1 font-display text-2xl font-bold text-brand-ink">Tá Resolvido</h1>
        <p className="mb-6 text-sm text-brand-ink-soft">Seu mês sob controle. Sem planilha.</p>

        {status === "sent" ? (
          <p className="text-sm text-brand-ink">
            Enviamos um link de acesso pra <strong>{email}</strong>. Abre seu e-mail e clica nele
            pra entrar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-brand-ink" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="rounded-xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none focus:border-brand-ink"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 rounded-xl bg-brand-ink px-4 py-3 font-display font-semibold text-brand-card disabled:opacity-60"
            >
              {status === "sending" ? "Enviando..." : "Entrar com seu e-mail"}
            </button>
            {status === "error" && <p className="text-sm text-brand-coral">{errorMessage}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
