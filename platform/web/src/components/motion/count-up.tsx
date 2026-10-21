"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const format = new Intl.NumberFormat("fr-FR");

/** Nombre qui défile de 0 à sa valeur quand il devient visible. */
export function CountUp({ value, suffix = "", duration = 1.6 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    if (reduced) {
      node.textContent = format.format(value) + suffix;
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format.format(Math.round(latest)) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value, suffix, duration]);

  // Valeur finale dans le HTML : correcte sans JavaScript et pour les moteurs de recherche.
  return (
    <span ref={ref} className="tabular-nums">
      {format.format(value) + suffix}
    </span>
  );
}
