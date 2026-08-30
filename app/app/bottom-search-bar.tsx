"use client";

import { usePathname } from "next/navigation";
import { EntrySearch } from "./entry-search";

/**
 * Colada em cima do menu (NavLinks), separada do resto da tela — só aparece
 * em "Meu mês", que é onde faz sentido buscar um lançamento.
 */
export function BottomSearchBar() {
  const pathname = usePathname();
  if (pathname !== "/app") return null;

  return (
    <div className="border-t border-brand-line bg-brand-bg px-3 pb-2.5 pt-2.5">
      <div className="mx-auto max-w-sm">
        <EntrySearch />
      </div>
    </div>
  );
}
