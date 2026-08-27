// Bloco genérico de "esqueleto" de carregamento — usado nos loading.tsx de
// cada tela pra dar feedback visual imediato na navegação, antes dos dados
// de verdade chegarem do servidor.
export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-brand-line/60 ${className ?? ""}`} />;
}
