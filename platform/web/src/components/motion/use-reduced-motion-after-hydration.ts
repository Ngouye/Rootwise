"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Préférence « réduire les animations », appliquée seulement après l'hydratation : le serveur ne
 * connaît pas cette préférence, et le premier rendu client doit produire le même HTML que lui.
 */
export function useReducedMotionAfterHydration(): boolean {
  const reduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return hydrated && !!reduced;
}
