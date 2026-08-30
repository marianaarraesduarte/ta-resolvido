"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const TAB_ORDER = ["/app", "/app/resumo", "/app/mais"];
const SWIPE_THRESHOLD = 70;
const DIRECTION_LOCK_THRESHOLD = 10;
// Perto da borda o celular já entende como "voltar" (gesto do sistema) — se a
// gente também reagir aí, os dois gestos brigam e a navegação parece "voltar
// sozinha" logo depois de trocar de aba.
const EDGE_MARGIN = 24;

/**
 * Em "Meu mês" o rodapé fixo ganha uma barra de busca em cima do menu, então
 * o conteúdo da página precisa de um respiro a mais embaixo pra não ficar
 * escondido atrás dela — só nessa tela.
 *
 * Arrastar a tela pro lado troca de aba (Meu mês / Quanto gastei / Mais),
 * além de tocar no menu — mas só nas 3 telas principais, e não em "Meu mês"
 * (lá o arrasto lateral já troca de mês, é a régua quem cuida disso).
 * Elementos marcados com data-swipe-exempt (a régua rolável, as linhas com
 * swipe-pra-excluir) ficam de fora pra não brigar com o próprio gesto deles.
 */
export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/app";
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef<"h" | "v" | null>(null);
  const cooldownUntil = useRef(0);

  function handlePointerDown(e: React.PointerEvent) {
    if (isHome) return;
    // Sem isso, um segundo arrasto disparado rápido demais (antes do pathname
    // atualizar de verdade) calculava o próximo índice em cima da aba antiga,
    // e podia "repetir" a mesma tela em vez de avançar.
    if (Date.now() < cooldownUntil.current) return;
    if ((e.target as HTMLElement).closest("[data-swipe-exempt]")) return;
    if (e.clientX < EDGE_MARGIN || e.clientX > window.innerWidth - EDGE_MARGIN) return;
    start.current = { x: e.clientX, y: e.clientY };
    locked.current = null;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!locked.current) {
      if (Math.abs(dx) < DIRECTION_LOCK_THRESHOLD && Math.abs(dy) < DIRECTION_LOCK_THRESHOLD) return;
      locked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!start.current || locked.current !== "h") {
      start.current = null;
      return;
    }
    const dx = e.clientX - start.current.x;
    start.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    const index = TAB_ORDER.indexOf(pathname);
    if (index === -1) return;
    const nextIndex = dx < 0 ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= TAB_ORDER.length) return;
    cooldownUntil.current = Date.now() + 700;
    router.push(TAB_ORDER[nextIndex]);
  }

  function handlePointerCancel() {
    start.current = null;
  }

  return (
    <main
      className={isHome ? "pb-16" : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {children}
    </main>
  );
}
