"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copie un bloc de code dans le presse-papiers (bouton discret de la barre de titre). */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // presse-papiers indisponible (contexte non sécurisé) : rien à faire
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
      aria-label={copied ? "Code copié" : "Copier le code"}
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}
