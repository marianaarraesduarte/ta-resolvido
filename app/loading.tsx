// Aparece automaticamente enquanto uma troca de tela espera dados do
// servidor (login, entrar no app, trocar de tela) — sem isso, esse tempo de
// espera é uma tela branca vazia, parecendo travado.
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-512.png"
        alt=""
        width={64}
        height={64}
        className="rounded-2xl motion-safe:animate-pulse"
      />
    </div>
  );
}
