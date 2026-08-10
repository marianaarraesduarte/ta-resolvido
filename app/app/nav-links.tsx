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
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-line bg-brand-card pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5">
      <div className="relative mx-auto flex max-w-sm items-start justify-around px-2">
        <div className="pointer-events-none absolute inset-x-3 top-3 h-px bg-brand-line" />
        {links.map((link) => {
          const active = pathname === link.href;
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
                  className={active ? "text-brand-card" : "text-brand-ink-soft"}
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
