"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Décalage vertical de départ, en pixels. */
  y?: number;
};

/** Apparition en fondu et glissement quand l'élément entre dans l'écran (une seule fois). */
export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const group: Variants = {
  hidden: {},
  visible: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

const item: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

/** Conteneur dont les enfants {@link StaggerItem} apparaissent les uns après les autres. */
export function Stagger({ children, className, stagger = 0.08 }: { children: ReactNode; className?: string; stagger?: number }) {
  return (
    <motion.div
      className={className}
      variants={group}
      custom={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** Mots du grand titre : ils sortent du flou en basculant vers le lecteur. */
const heroWord: Variants = {
  hidden: { opacity: 0, y: "0.5em", rotateX: -60, filter: "blur(14px)" },
  visible: { opacity: 1, y: "0em", rotateX: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
};

/** Titre dont les mots apparaissent un à un ; `accent` s'affiche en couleur sur une nouvelle ligne. */
export function HeroTitle({ text, accent, className }: { text: string; accent: string; className?: string }) {
  const words = text.split(" ");
  const accentWords = accent.split(" ");
  return (
    <motion.h1
      className={className}
      style={{ perspective: 900 }}
      initial="hidden"
      animate="visible"
      variants={group}
      custom={0.08}
      aria-label={`${text} ${accent}`}
    >
      {words.map((word, index) => (
        <motion.span key={`t-${index}`} variants={heroWord} className="mr-[0.26em] inline-block origin-bottom" aria-hidden>
          {word}
        </motion.span>
      ))}
      <br />
      {accentWords.map((word, index) => (
        <motion.span
          key={`a-${index}`}
          variants={heroWord}
          className={`text-accent-gradient animate-shimmer-text inline-block origin-bottom pb-[0.08em] ${index < accentWords.length - 1 ? "mr-[0.26em]" : ""}`}
          aria-hidden
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}
