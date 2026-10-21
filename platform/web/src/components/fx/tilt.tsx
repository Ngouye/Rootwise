"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "cn";

type TiltProps = {
  children: ReactNode;
  className?: string;
  /** Inclinaison maximale, en degrés. */
  max?: number;
  /** Reflet lumineux qui suit le pointeur. */
  glare?: boolean;
};

/**
 * Carte qui s'incline en 3D vers le pointeur, avec un reflet et une bordure lumineuse
 * (variables --mx/--my utilisées par .spotlight-border). Souris uniquement : au toucher, la carte
 * reste à plat.
 */
export function Tilt({ children, className, max = 7, glare = true }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const glareX = useTransform(px, (value) => `${value * 100}%`);
  const glareY = useTransform(py, (value) => `${value * 100}%`);
  const glareOpacity = useSpring(0, spring);
  const background = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 55%)`;

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    ref.current.style.setProperty("--mx", `${x * 100}%`);
    ref.current.style.setProperty("--my", `${y * 100}%`);
    if (reduced) return;
    px.set(x);
    py.set(y);
    glareOpacity.set(1);
  }

  function onPointerLeave() {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className={cn("spotlight-border relative rounded-2xl [transform-style:preserve-3d]", className)}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] mix-blend-soft-light"
          style={{ background, opacity: glareOpacity }}
        />
      )}
    </motion.div>
  );
}
