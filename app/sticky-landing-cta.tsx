"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Mesmo CTA do topo, fixo no rodapé — só aparece depois que a pessoa já
 * rolou uma boa parte da página (decidida a continuar lendo), pra quem quer
 * começar não precisar voltar lá em cima pra achar o botão.
 */
export function StickyLandingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
      setVisible(pct >= 0.4);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 pt-8 transition-transform duration-300 motion-reduce:transition-none ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ background: "linear-gradient(180deg, transparent, rgb(var(--color-brand-bg)) 40%)" }}
    >
      <Link
        href="/login"
        tabIndex={visible ? undefined : -1}
        className="flex items-center gap-2 rounded-2xl bg-brand-plum px-8 py-4 font-display text-[15.5px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(122,92,126,0.55)]"
      >
        Quero começar, de graça
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
