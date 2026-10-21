"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "cn";

/**
 * Carte dont la bordure et le fond s'éclairent sous le pointeur (.spotlight-border, .spotlight-fill),
 * sans inclinaison : adaptée aux blocs interactifs (champ de saisie, terminal).
 */
export function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (event.pointerType !== "mouse" || !node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    node.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={cn("spotlight-border spotlight-fill surface relative", className)}>
      {children}
    </div>
  );
}
