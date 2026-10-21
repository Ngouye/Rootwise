"use client";

import { motion } from "motion/react";

/**
 * Fondu à chaque changement de page. Pas de déplacement : une transformation sur ce conteneur
 * décalerait les éléments fixes ou collants (barre de lecture, programme du cours).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
