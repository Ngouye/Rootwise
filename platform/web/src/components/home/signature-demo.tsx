"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

/** Certificat dont la signature Ed25519 se vérifie sous les yeux : document, empreinte, coche. */
export function SignatureDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative flex h-full flex-col items-center justify-center gap-5 py-2">
      <div className="relative">
        <motion.div
          initial={{ rotate: -6, y: 12, opacity: 0 }}
          animate={inView ? { rotate: -4, y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-52 rounded-2xl border bg-card p-4 shadow-lift"
        >
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600" />
            <span className="flex flex-col gap-1">
              <span className="h-1.5 w-24 rounded-full bg-foreground/70" />
              <span className="h-1.5 w-16 rounded-full bg-muted-foreground/40" />
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            {[100, 88, 94, 70].map((width, index) => (
              <motion.span
                key={index}
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                style={{ width: `${width}%` }}
                className="h-1.5 origin-left rounded-full bg-muted-foreground/25"
              />
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9 }}
            className="mt-4 truncate font-mono text-[0.6rem] text-muted-foreground"
          >
            sig: 3f9a…c27e · ed25519
          </motion.p>
        </motion.div>
        <motion.span
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 1.1 }}
          className="animate-pulse-ring absolute -right-5 -bottom-5 flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lift"
        >
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.35, ease: "easeOut" }}
            />
          </svg>
        </motion.span>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.6 }}
        className="text-center text-sm font-bold text-emerald-600 dark:text-emerald-400"
      >
        Signature valide · certificat authentique
      </motion.p>
    </div>
  );
}
