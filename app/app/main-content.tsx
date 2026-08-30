"use client";

import { usePathname } from "next/navigation";

/**
 * Em "Meu mês" o rodapé fixo ganha uma barra de busca em cima do menu, então
 * o conteúdo da página precisa de um respiro a mais embaixo pra não ficar
 * escondido atrás dela — só nessa tela.
 */
export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <main className={pathname === "/app" ? "pb-16" : undefined}>{children}</main>;
}
