// Só o símbolo do checkmark (o mesmo do ícone do app), sem fundo, ocupando a
// maior parte da tela — cores via variável CSS pra acompanhar claro/escuro
// sozinho. Usado por todo loading.tsx da árvore (raiz e dentro de /app),
// já que cada trecho de rota precisa do seu próprio pra cobrir toda troca
// de tela, não só a primeira carga do site inteiro.
export function LoadingLogo() {
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
