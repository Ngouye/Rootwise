"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

/** Script exécuté avant l'affichage : applique le thème mémorisé sans éclair blanc. */
export const THEME_SCRIPT = `(function(){try{var d=localStorage.getItem("theme")==="dark";var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(_){}})()`;

/** Suit la classe « dark » de <html>, modifiée par le script de thème ou par ce bouton. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // stockage indisponible (navigation privée) : le choix vaut pour cette page
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Passer au thème clair" : "Passer au thème sombre"}
      className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border bg-card text-muted-foreground shadow-soft transition-colors hover:text-foreground"
    >
      <Sun className="size-4 transition-all duration-500 dark:-rotate-90 dark:scale-0" aria-hidden />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-all duration-500 dark:scale-100 dark:rotate-0" aria-hidden />
    </button>
  );
}
