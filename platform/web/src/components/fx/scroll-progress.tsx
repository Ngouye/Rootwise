"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Fine barre lumineuse en haut de l'écran, qui suit l'avancée dans la page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-primary via-[oklch(0.7_0.14_220)] to-[oklch(0.8_0.13_170)] shadow-[0_0_12px_oklch(0.7_0.13_190)]"
    />
  );
}
