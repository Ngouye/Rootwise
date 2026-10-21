"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Les animations respectent le réglage « réduire les animations » du système. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
