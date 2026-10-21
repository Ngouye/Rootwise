"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "cn";

/**
 * Zone dont le fond s'éclaire là où se trouve le pointeur (variables --sx/--sy lues par
 * .spotlight-area::before). Aucun rendu React pendant le mouvement.
 */
export function SpotlightArea({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--sx", `${clientX - rect.left}px`);
      node.style.setProperty("--sy", `${clientY - rect.top}px`);
    });
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={cn("spotlight-area", className)}>
      {children}
    </div>
  );
}
