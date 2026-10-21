"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/client-api";

type FormState = {
  pending: boolean;
  error: ApiError | null;
  fieldErrors: Record<string, string>;
};

/**
 * Soumission d'un formulaire vers l'API : état d'envoi, erreur globale et erreurs par champ
 * (renvoyées par l'API au format problem+json).
 */
export function useApiForm(submit: (data: FormData) => Promise<void>) {
  const [state, setState] = useState<FormState>({ pending: false, error: null, fieldErrors: {} });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ pending: true, error: null, fieldErrors: {} });
    try {
      await submit(new FormData(event.currentTarget));
      setState({ pending: false, error: null, fieldErrors: {} });
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(0, "NETWORK", "Impossible de joindre le serveur. Vérifiez votre connexion.");
      setState({ pending: false, error: apiError, fieldErrors: apiError.fieldErrors });
    }
  }

  return { ...state, onSubmit };
}

export function field(data: FormData, name: string): string {
  return String(data.get(name) ?? "");
}
