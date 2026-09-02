import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-5">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-2xl font-bold text-brand-ink">
          Essa página não existe.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-brand-ink-soft">
          Pode ser um link antigo, ou um endereço digitado errado. Seu mês continua onde
          você deixou.
        </p>

        <Link
          href="/app"
          className="mt-7 inline-block w-full rounded-2xl bg-brand-plum py-3.5 font-display text-[14.5px] font-semibold text-white"
        >
          Ir pro meu mês
        </Link>
      </div>
    </div>
  );
}
