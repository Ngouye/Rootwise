"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Défilement fluide (Lenis) sur les pages vitrines. Absent des leçons et du studio, où les zones
 * défilantes imbriquées doivent garder le comportement natif ; désactivé si l'utilisateur réduit
 * les animations.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 1 });
    return () => lenis.destroy();
  }, []);
  return null;
}
