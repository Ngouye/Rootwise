"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotionAfterHydration } from "@/components/motion/use-reduced-motion-after-hydration";

/** Élément qui glisse plus lentement (ou plus vite) que la page pendant le défilement. */
export function Parallax({ children, className, offset = 50 }: { children: ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionAfterHydration();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
