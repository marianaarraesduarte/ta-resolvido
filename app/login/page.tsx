"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "magic" | "password";
type PasswordMode = "signin" | "signup" | "forgot";
type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "rounded-xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none focus:border-brand-ink";

function rateLimitAwareMessage(status: number | undefined, fallback: string): string {
  return status === 429
    ? "Muitos pedidos em pouco tempo. Espera alguns minutos e tenta de novo."
    : fallback;
}

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("magic");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function switchAuthMode(mode: AuthMode) {
    setAuthMode(mode);
    setPasswordMode("signin");
    setStatus("idle");
    setErrorMessage("");
  }

  function switchPasswordMode(mode: PasswordMode) {
    setPasswordMode(mode);
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErrorMessage(
        rateLimitAwareMessage(error.status, "Não deu pra enviar o link agora. Tenta de novo em instantes."),
      );
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(
        rateLimitAwareMessage(error.status, "E-mail ou senha incorretos."),
      );
      setStatus("error");
    } else {
      window.location.href = "/app";
    }
  }

  async function handleSignUp(e: FormEvent) {
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

    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErrorMessage(rateLimitAwareMessage(error.status, "Não deu pra criar a conta agora."));
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setErrorMessage(rateLimitAwareMessage(error.status, "Não deu pra enviar o e-mail agora."));
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

        <div className="mb-5 flex gap-1.5 rounded-2xl bg-brand-bg p-1.5">
          <button
            type="button"
            onClick={() => switchAuthMode("magic")}
            className={
              authMode === "magic"
                ? "flex-1 rounded-[14px] bg-brand-ink py-2.5 font-display text-sm font-semibold text-brand-card"
                : "flex-1 rounded-[14px] py-2.5 font-display text-sm font-semibold text-brand-ink-soft"
            }
          >
            Link mágico
          </button>
          <button
            type="button"
            onClick={() => switchAuthMode("password")}
            className={
              authMode === "password"
                ? "flex-1 rounded-[14px] bg-brand-ink py-2.5 font-display text-sm font-semibold text-brand-card"
                : "flex-1 rounded-[14px] py-2.5 font-display text-sm font-semibold text-brand-ink-soft"
            }
          >
            Senha
          </button>
        </div>

        {authMode === "magic" &&
          (status === "sent" ? (
            <p className="text-sm text-brand-ink">
              Enviamos um link de acesso pra <strong>{email}</strong>. Abre seu e-mail e clica nele
              pra entrar.
            </p>
          ) : (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
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
                className={inputClass}
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
          ))}

        {authMode === "password" && (
          <>
            {passwordMode !== "forgot" && (
              <div className="mb-4 flex gap-4 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => switchPasswordMode("signin")}
                  className={
                    passwordMode === "signin"
                      ? "text-brand-ink underline underline-offset-4"
                      : "text-brand-ink-soft"
                  }
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => switchPasswordMode("signup")}
                  className={
                    passwordMode === "signup"
                      ? "text-brand-ink underline underline-offset-4"
                      : "text-brand-ink-soft"
                  }
                >
                  Criar conta
                </button>
              </div>
            )}

            {status === "sent" ? (
              <p className="text-sm text-brand-ink">
                {passwordMode === "forgot"
                  ? `Mandamos um link pra redefinir sua senha em `
                  : `Mandamos um link de confirmação pra `}
                <strong>{email}</strong>. Abre seu e-mail e clica nele pra continuar.
              </p>
            ) : passwordMode === "signin" ? (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                <label className="text-sm font-medium text-brand-ink" htmlFor="email-signin">
                  E-mail
                </label>
                <input
                  id="email-signin"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className={inputClass}
                />
                <label className="text-sm font-medium text-brand-ink" htmlFor="password-signin">
                  Senha
                </label>
                <input
                  id="password-signin"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => switchPasswordMode("forgot")}
                  className="self-start text-xs text-brand-ink-soft underline underline-offset-2"
                >
                  Esqueci minha senha
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 rounded-xl bg-brand-ink px-4 py-3 font-display font-semibold text-brand-card disabled:opacity-60"
                >
                  {status === "sending" ? "Entrando..." : "Entrar"}
                </button>
                {status === "error" && <p className="text-sm text-brand-coral">{errorMessage}</p>}
              </form>
            ) : passwordMode === "signup" ? (
              <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                <p className="text-xs leading-snug text-brand-ink-soft">
                  Já entrou antes com link mágico nesse e-mail? Sua conta já existe — usa{" "}
                  <button
                    type="button"
                    onClick={() => switchPasswordMode("forgot")}
                    className="underline underline-offset-2"
                  >
                    Esqueci minha senha
                  </button>{" "}
                  pra criar uma senha pra ela, em vez de &quot;Criar conta&quot;.
                </p>
                <label className="text-sm font-medium text-brand-ink" htmlFor="email-signup">
                  E-mail
                </label>
                <input
                  id="email-signup"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className={inputClass}
                />
                <label className="text-sm font-medium text-brand-ink" htmlFor="password-signup">
                  Senha
                </label>
                <input
                  id="password-signup"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Pelo menos 6 caracteres"
                  className={inputClass}
                />
                <label className="text-sm font-medium text-brand-ink" htmlFor="password-confirm">
                  Confirma a senha
                </label>
                <input
                  id="password-confirm"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 rounded-xl bg-brand-ink px-4 py-3 font-display font-semibold text-brand-card disabled:opacity-60"
                >
                  {status === "sending" ? "Criando..." : "Criar conta"}
                </button>
                {status === "error" && <p className="text-sm text-brand-coral">{errorMessage}</p>}
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                <p className="text-sm text-brand-ink-soft">
                  Digita seu e-mail que a gente manda um link pra você criar uma senha nova.
                </p>
                <label className="text-sm font-medium text-brand-ink" htmlFor="email-forgot">
                  E-mail
                </label>
                <input
                  id="email-forgot"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => switchPasswordMode("signin")}
                  className="self-start text-xs text-brand-ink-soft underline underline-offset-2"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 rounded-xl bg-brand-ink px-4 py-3 font-display font-semibold text-brand-card disabled:opacity-60"
                >
                  {status === "sending" ? "Enviando..." : "Enviar link de redefinição"}
                </button>
                {status === "error" && <p className="text-sm text-brand-coral">{errorMessage}</p>}
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
