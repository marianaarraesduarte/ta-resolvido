"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/app", label: "Régua" },
  { href: "/app/resumo", label: "Resumo" },
  { href: "/app/categorias", label: "Categorias" },
  { href: "/app/limites", label: "Limites" },
  { href: "/app/metas", label: "Metas" },
];

export function NavLinks({ hideMetas }: { hideMetas: boolean }) {
  const pathname = usePathname();
  const links = hideMetas ? BASE_LINKS.filter((l) => l.href !== "/app/metas") : BASE_LINKS;

  return (
    <nav className="flex w-max gap-1 rounded-full bg-brand-card p-1">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "flex-shrink-0 whitespace-nowrap rounded-full bg-brand-ink px-3.5 py-1.5 text-sm font-semibold text-brand-card"
                : "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-brand-ink-soft"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
