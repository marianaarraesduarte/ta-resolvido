import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Moldura das páginas de Termos e Privacidade. As duas são texto corrido
 * longo, então aqui o texto fica alinhado à esquerda e com largura de leitura
 * confortável — diferente da página de vendas, que é centralizada.
 */
export function LegalShell({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink-soft"
        >
          <ChevronLeft size={16} />
          Voltar
        </Link>

        <h1 className="text-balance font-display text-[30px] font-bold leading-tight text-brand-ink sm:text-[36px]">
          {title}
        </h1>
        <p className="mt-2.5 text-[13.5px] text-brand-ink-soft">Última atualização: {updatedAt}</p>

        <div className="mt-9 flex flex-col gap-7">{children}</div>

        <footer className="mt-14 border-t border-brand-line pt-6 text-[12.5px] text-brand-ink-soft">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <Link href="/termos" className="underline underline-offset-2">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="underline underline-offset-2">
              Política de Privacidade
            </Link>
            <a href="mailto:contato@taresolvido.app" className="underline underline-offset-2">
              contato@taresolvido.app
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

/** Um bloco com título e texto — a unidade que os dois documentos repetem. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-[19px] font-bold leading-snug text-brand-ink">{heading}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-brand-ink-soft">
        {children}
      </div>
    </section>
  );
}

/** Lista com marcador, usada pras enumerações dos dois documentos. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand-line">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
