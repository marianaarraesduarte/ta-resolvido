// Aparece automaticamente enquanto uma troca de tela espera dados do
// servidor (login, entrar no app, trocar de tela) — sem isso, esse tempo de
// espera é uma tela branca vazia, parecendo travado. Só o símbolo do
// checkmark (o mesmo do ícone do app), sem fundo, ocupando a maior parte da
// tela — cores via variável CSS pra acompanhar claro/escuro sozinho.
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <svg
        viewBox="0 0 512 512"
        role="img"
        aria-label="Tá Resolvido"
        className="w-[64vw] max-w-[320px] motion-safe:animate-pulse"
      >
        <path
          d="M105 262L210 367L407 148"
          stroke="rgb(var(--color-brand-ink))"
          strokeWidth="52"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="407" cy="148" r="37" fill="rgb(var(--color-brand-amber))" />
      </svg>
    </div>
  );
}
