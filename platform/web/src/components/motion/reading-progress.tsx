"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barre de lecture en haut de l'écran, qui suit le défilement de la leçon. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-primary via-[oklch(0.7_0.12_205)] to-primary"
      style={{ scaleX }}
    />
  );
}
