// src/hooks/useThemeToggle.ts
import { useEffect, useState } from "react";

// Los 3 temas disponibles
export type Theme = "classic" | "neon" | "white";

export function useThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "classic";

    const stored = window.localStorage.getItem("oxe-theme") as Theme | null;
    if (stored === "classic" || stored === "neon" || stored === "white") {
      return stored;
    }
    return "classic";
  });

  // Aplicar la clase al <html> (o <body>) para que las CSS vars funcionen en todo
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement; // <html>

    root.classList.remove(
      "oxe-theme-classic",
      "oxe-theme-neon",
      "oxe-theme-white"
    );
    root.classList.add(`oxe-theme-${theme}`);

    window.localStorage.setItem("oxe-theme", theme);
  }, [theme]);

  // Cambia de tema en círculo: classic -> neon -> white -> classic
  const cycleTheme = () => {
    setTheme((prev) =>
      prev === "classic" ? "neon" : prev === "neon" ? "white" : "classic"
    );
  };

  return {
    theme,
    cycleTheme,
  };
}
