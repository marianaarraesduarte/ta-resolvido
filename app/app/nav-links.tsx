"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutGrid, Ruler, Tags, type LucideIcon } from "lucide-react";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app", label: "Meu mês", icon: Ruler },
  { href: "/app/resumo", label: "Quanto gastei", icon: ClipboardList },
  { href: "/app/categorias", label: "Onde gastei", icon: Tags },
  { href: "/app/mais", label: "Mais", icon: LayoutGrid },
];

// Telas que, quando abertas, mantêm o ícone "Mais" marcado como ativo.
const MAIS_PATHS = ["/app/mais", "/app/limites", "/app/metas", "/app/insights", "/app/planos"];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-line bg-brand-card pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5">
      <div className="relative mx-auto flex max-w-sm items-start justify-around px-2">
        <div className="pointer-events-none absolute inset-x-3 top-3 h-px bg-brand-line" />
        {LINKS.map((link) => {
          const active =
            link.href === "/app/mais"
              ? MAIS_PATHS.some((p) => pathname === p || pathname.startsWith("/app/config/lembrete"))
              : pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className="relative z-10 flex flex-1 flex-col items-center gap-1 px-1"
            >
              <div
                className={
                  active
                    ? "flex h-8 w-8 -translate-y-1.5 items-center justify-center rounded-full shadow-sm transition-transform"
                    : "flex h-6 w-6 items-center justify-center rounded-full bg-brand-card transition-transform"
                }
                style={active ? { background: "var(--accent)" } : undefined}
              >
                <Icon
                  size={active ? 16 : 14}
                  className={active ? "text-white" : "text-brand-ink-soft"}
                />
              </div>
              <span
                className={
                  active
                    ? "text-center text-[9px] font-semibold leading-tight text-brand-ink"
                    : "text-center text-[9px] font-medium leading-tight text-brand-ink-soft"
                }
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
