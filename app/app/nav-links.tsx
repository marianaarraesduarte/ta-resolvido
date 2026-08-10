"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Gauge, Ruler, Tags, Target, type LucideIcon } from "lucide-react";

const BASE_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app", label: "Meu mês", icon: Ruler },
  { href: "/app/resumo", label: "Resumo do mês", icon: ClipboardList },
  { href: "/app/categorias", label: "Por categoria", icon: Tags },
  { href: "/app/limites", label: "Limites de gasto", icon: Gauge },
  { href: "/app/metas", label: "Metas", icon: Target },
];

export function NavLinks({ hideMetas }: { hideMetas: boolean }) {
  const pathname = usePathname();
  const links = hideMetas ? BASE_LINKS.filter((l) => l.href !== "/app/metas") : BASE_LINKS;

  return (
    <nav className="relative flex items-center gap-3.5 px-1">
      <div className="pointer-events-none absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-brand-line" />
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-label={link.label}
            className="relative z-10 flex flex-shrink-0 flex-col items-center"
          >
            <div
              className={
                active
                  ? "flex h-8 w-8 -translate-y-1.5 items-center justify-center rounded-full shadow-sm transition-transform"
                  : "flex h-6 w-6 items-center justify-center rounded-full bg-brand-card transition-transform"
              }
              style={active ? { background: "var(--accent)" } : undefined}
            >
              <Icon size={active ? 16 : 14} className={active ? "text-brand-card" : "text-brand-ink-soft"} />
            </div>
            {active && (
              <span className="mt-0.5 whitespace-nowrap text-[9px] font-semibold text-brand-ink">
                {link.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
