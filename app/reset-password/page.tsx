"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "rounded-xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none focus:border-brand-ink";

export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // O link do e-mail de redefinição de senha pode chegar de duas formas
  // diferentes dependendo de onde é aberto (comum trocar de app no celular):
  // com um "?code=" na URL, ou com os tokens depois de "#" (o cliente do
  // Supabase não processa esse segundo formato sozinho — só o servidor não
  // consegue ler nenhum dos dois, por isso isso é tratado aqui, não em
  // /auth/callback).
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function establishSession() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        window.history.replaceState(null, "", window.location.pathname);
        return !error;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState(null, "", window.location.pathname);
        return !error;
      }

      const { data } = await supabase.auth.getUser();
      return !!data.user;
    }

    establishSession().then((ok) => {
      if (cancelled) return;
      if (ok) {
        setChecking(false);
      } else {
        setLinkInvalid(true);
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("A senha precisa ter pelo menos 6 caracteres.");
      setStatus("error");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não são iguais.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage("Não deu pra salvar a senha agora. Tenta de novo.");
      setStatus("error");
    } else {
      setStatus("done");
    }
  }

  if (checking) return null;

  if (linkInvalid) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
        <div className="w-full max-w-sm rounded-2xl bg-brand-card p-8 shadow-sm">
          <h1 className="mb-1 font-display text-2xl font-bold text-brand-ink">
            Link expirado ou já usado
          </h1>
          <p className="mb-6 text-sm text-brand-ink-soft">
            Esse link de redefinição de senha não é mais válido — cada link só funciona uma vez.
            Pede um novo na tela de login.
          </p>
          <a
            href="/login"
            className="block rounded-xl bg-brand-ink px-4 py-3 text-center font-display font-semibold text-brand-card"
          >
            Voltar pro login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm rounded-2xl bg-brand-card p-8 shadow-sm">
        <h1 className="mb-1 font-display text-2xl font-bold text-brand-ink">Nova senha</h1>
        <p className="mb-6 text-sm text-brand-ink-soft">Escolhe uma senha nova pra sua conta.</p>

        {status === "done" ? (
          <div>
            <p className="mb-4 text-sm text-brand-ink">Senha alterada! Já pode entrar com ela.</p>
            <a
              href="/app"
              className="block rounded-xl bg-brand-ink px-4 py-3 text-center font-display font-semibold text-brand-card"
            >
              Ir pro app
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-brand-ink" htmlFor="password">
              Senha nova
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Pelo menos 6 caracteres"
              className={inputClass}
            />
            <label className="text-sm font-medium text-brand-ink" htmlFor="confirm">
              Confirma a senha
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={status === "saving"}
              className="mt-2 rounded-xl bg-brand-ink px-4 py-3 font-display font-semibold text-brand-card disabled:opacity-60"
            >
              {status === "saving" ? "Salvando..." : "Salvar senha"}
            </button>
            {status === "error" && <p className="text-sm text-brand-coral">{errorMessage}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
