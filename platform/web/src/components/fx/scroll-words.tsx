"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { useReducedMotionAfterHydration } from "@/components/motion/use-reduced-motion-after-hydration";

/**
 * Phrase dont les mots s'allument un à un au fil du défilement. `highlight` : mots mis en
 * couleur (comparaison sans ponctuation).
 */
export function ScrollWords({ text, highlight = [], className }: { text: string; highlight?: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotionAfterHydration();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  const marked = new Set(highlight.map((word) => word.toLowerCase()));

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => {
        const accent = marked.has(word.toLowerCase().replace(/[.,;:!?]/g, ""));
        return (
          <Word
            key={`${word}-${index}`}
            progress={scrollYProgress}
            range={[index / words.length, (index + 1) / words.length]}
            reduced={reduced}
            accent={accent}
          >
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  reduced,
  accent,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  reduced: boolean;
  accent: boolean;
}) {
  // Animations réduites : mots pleinement visibles, sans glissement.
  const opacity = useTransform(progress, range, reduced ? [1, 1] : [0.14, 1]);
  const y = useTransform(progress, range, reduced ? [0, 0] : [8, 0]);
  return (
    <motion.span
      style={{ opacity, y }}
      className={`mr-[0.25em] inline-block ${accent ? "text-accent-gradient" : ""}`}
    >
      {children}
    </motion.span>
  );
}
