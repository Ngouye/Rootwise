"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const LOWER = "abcdefghijkmnopqrstuvwxyz0123456789";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ#$%&@";

/** Glyphe aléatoire de même casse que la cible (la ligne garde sa largeur) ; ponctuation intacte. */
function randomGlyph(target: string): string {
  const pool = target.toLowerCase() !== target ? UPPER : /[\p{L}\p{N}]/u.test(target) ? LOWER : "";
  return pool ? pool[Math.floor(Math.random() * pool.length)] : target;
}

type ScrambleTextProps = {
  text: string;
  className?: string;
  /** Durée du déchiffrement, en millisecondes. */
  duration?: number;
  delay?: number;
  /** « mount » : dès l'affichage ; « view » : quand le texte entre dans l'écran. */
  trigger?: "mount" | "view";
};

/**
 * Texte qui se « déchiffre » : des caractères aléatoires se résolvent un à un en texte clair.
 * Le DOM est modifié directement (pas de rendu React par image) ; le texte réel reste lu par les
 * lecteurs d'écran et affiché tel quel si l'utilisateur réduit les animations.
 */
export function ScrambleText({ text, className, duration = 1100, delay = 0, trigger = "mount" }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || (trigger === "view" && !inView)) return;
    const from = previous.current ?? "";
    previous.current = text;
    let frame = 0;
    let start = 0;
    const timer = window.setTimeout(() => {
      const tick = (now: number) => {
        if (!start) start = now;
        const progress = Math.min(1, (now - start) / duration);
        const length = Math.max(text.length, from.length);
        let output = "";
        for (let i = 0; i < length; i++) {
          const target = text[i] ?? "";
          const revealAt = (i / length) * 0.75 + 0.2;
          if (progress >= revealAt) output += target;
          else if (progress < 0.15 && from[i]) output += from[i];
          else output += randomGlyph(target || from[i] || "a");
        }
        node.textContent = output;
        if (progress < 1) frame = requestAnimationFrame(tick);
        else node.textContent = text;
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      node.textContent = text;
    };
  }, [text, inView, reduced, trigger, duration, delay]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}

/** Mots qui se succèdent, chacun se déchiffrant à partir du précédent. */
export function RotatingScramble({ words, interval = 2800, className }: { words: string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((value) => (value + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [inView, reduced, interval, words.length]);

  return (
    <span ref={ref} className={className}>
      <ScrambleText text={words[index]} duration={900} />
    </span>
  );
}
