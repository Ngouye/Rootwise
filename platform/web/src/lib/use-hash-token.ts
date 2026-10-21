"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/**
 * Jeton reçu par e-mail dans le fragment de l'URL (#token=…). Le fragment n'est jamais
 * envoyé au serveur : il ne finit ni dans les journaux ni dans l'en-tête Referer.
 */
export function useHashToken(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.hash.slice(1)).get("token"),
    () => null,
  );
}

/** Retire le jeton de la barre d'adresse une fois utilisé. */
export function clearHash() {
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}
