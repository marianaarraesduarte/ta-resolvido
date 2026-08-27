"use client";

import { useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "theme-preference";

function applyTheme(pref: ThemePreference) {
  if (pref === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", pref);
  }
}

// Preferência de tema é por aparelho (igual um app nativo) — guardada só no
// localStorage, sem precisar sincronizar com o perfil no banco.
export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") setPreference(stored);
  }, []);

  function updatePreference(next: ThemePreference) {
    setPreference(next);
    applyTheme(next);
    if (next === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  }

  return { preference, setPreference: updatePreference };
}
