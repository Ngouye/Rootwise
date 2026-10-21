"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Award, BookOpenCheck, Compass } from "lucide-react";
import { useRef } from "react";
import { Tilt } from "@/components/fx/tilt";

const STEPS = [
  {
    icon: Compass,
    title: "Choisissez votre parcours",
    text: "Filtrez par niveau et par thème : cryptographie, Linux, réseau, supervision. Les premières leçons sont en accès libre.",
  },
  {
    icon: BookOpenCheck,
    title: "Apprenez en pratiquant",
    text: "Des leçons courtes, des schémas, des commandes testées dans un vrai terminal et des encadrés qui signalent chaque piège.",
  },
  {
    icon: Award,
    title: "Validez et certifiez",
    text: "Un quiz à la fin des chapitres, puis un certificat signé en Ed25519 que n'importe qui peut vérifier en ligne.",
  },
];

/** Trois étapes reliées par une ligne lumineuse qui se trace au fil du défilement. */
export function StepsTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <div ref={ref} className="mt-14">
      {/* Frise : la ligne se trace au défilement et chaque jalon s'allume quand elle l'atteint. */}
      <div aria-hidden className="relative mx-[16.667%] mb-8 hidden h-12 md:block">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />
        <motion.div
          className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 origin-left rounded-full bg-gradient-to-r from-primary via-[oklch(0.7_0.12_205)] to-primary shadow-[0_0_14px_oklch(0.7_0.12_190)]"
          style={{ scaleX: progress }}
        />
        {STEPS.map((step, index) => (
          <Milestone key={step.title} index={index} at={index / (STEPS.length - 1)} progress={progress} />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: index * 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Tilt className="h-full">
              <div className="surface relative flex h-full flex-col gap-4 p-7">
                <span className="flex items-center justify-between">
                  <span className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.42_0.08_220)] text-primary-foreground shadow-lift">
                    <step.icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-mono text-5xl font-bold text-primary/12 md:hidden">0{index + 1}</span>
                </span>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Milestone({ index, at, progress }: { index: number; at: number; progress: MotionValue<number> }) {
  // Allumage juste avant que la ligne n'atteigne le jalon.
  const lit = useTransform(progress, [Math.max(0, at - 0.06), at + 0.001], [0, 1]);
  const scale = useTransform(lit, [0, 1], [0.85, 1]);
  return (
    <span className="absolute top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center" style={{ left: `${at * 100}%` }}>
      <span className="absolute inset-0 rounded-full border-2 border-border bg-background" />
      <motion.span
        style={{ opacity: lit, scale }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-[oklch(0.42_0.08_220)] shadow-[0_0_0_6px_color-mix(in_oklch,var(--primary)_15%,transparent),0_0_24px_oklch(0.7_0.13_190/60%)]"
      />
      <span className="relative font-mono text-sm font-bold text-muted-foreground">0{index + 1}</span>
      <motion.span style={{ opacity: lit }} className="absolute font-mono text-sm font-bold text-primary-foreground">
        0{index + 1}
      </motion.span>
    </span>
  );
}
