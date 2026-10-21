"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

async function sha256(text: string): Promise<string> {
  // WebCrypto n'existe qu'en contexte sécurisé (HTTPS ou localhost).
  if (!globalThis.crypto?.subtle) return "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Vraie empreinte SHA-256 calculée dans le navigateur (WebCrypto) : modifier une seule lettre
 * change environ la moitié des caractères — l'effet avalanche, montré en direct.
 */
export function HashDemo() {
  const [text, setText] = useState("Bonjour le monde");
  const [hash, setHash] = useState("");
  const previous = useRef("");
  const [changed, setChanged] = useState<Set<number>>(new Set());

  useEffect(() => {
    let alive = true;
    sha256(text).then((value) => {
      if (!alive) return;
      const before = previous.current;
      setChanged(before ? new Set([...value].map((char, i) => (char !== before[i] ? i : -1)).filter((i) => i >= 0)) : new Set());
      previous.current = value;
      setHash(value);
    });
    return () => {
      alive = false;
    };
  }, [text]);

  return (
    <div className="flex h-full flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.7rem] font-bold tracking-wider text-muted-foreground uppercase">Votre message</span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={80}
          spellCheck={false}
          className="h-11 rounded-xl border bg-background px-3.5 font-mono text-sm outline-none focus:border-primary/60 focus:ring-3 focus:ring-primary/15"
        />
      </label>
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center justify-between text-[0.7rem] font-bold tracking-wider text-muted-foreground uppercase">
          Empreinte SHA-256
          <AnimatePresence mode="popLayout">
            {changed.size > 0 && (
              <motion.span
                key={hash}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-full bg-amber-500/15 px-2 py-0.5 normal-case tracking-normal text-amber-700 dark:text-amber-300"
              >
                {changed.size}/64 caractères changés
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <code className="grid grid-cols-16 gap-x-0.5 gap-y-1 rounded-xl border bg-[#0b1220] p-3 font-mono text-[0.78rem] text-[#7dd3c0]">
          {[...(hash || "0".repeat(64))].map((char, index) => (
            <motion.span
              key={`${index}-${char}`}
              initial={changed.has(index) ? { color: "#fbbf24", scale: 1.35 } : false}
              animate={{ color: "#7dd3c0", scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-center"
            >
              {char}
            </motion.span>
          ))}
        </code>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Calculée réellement par votre navigateur. Changez une seule lettre : environ la moitié de l&apos;empreinte bascule.
      </p>
    </div>
  );
}
