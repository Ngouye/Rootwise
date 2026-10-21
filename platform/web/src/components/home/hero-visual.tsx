"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { Award, CheckCircle2, CirclePlay, ListChecks, Lock } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { formatDuration, type Author, type CourseSummary } from "@/lib/courses";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Écran de démonstration du héros : un cours en cours de lecture et des cartes qui flottent autour. */
export function HeroVisual({ course, author }: { course: CourseSummary | null; author: Author | null }) {
  // Position du pointeur dans la fenêtre, de -1 à 1 : l'écran s'incline, les cartes flottent à
  // des profondeurs différentes (parallaxe).
  const reduced = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const rotateY = useTransform(mx, [-1, 1], [-9, 9]);
  const rotateX = useTransform(my, [-1, 1], [7, -7]);
  const nearX = useTransform(mx, [-1, 1], [26, -26]);
  const nearY = useTransform(my, [-1, 1], [18, -18]);
  const farX = useTransform(mx, [-1, 1], [-34, 34]);
  const farY = useTransform(my, [-1, 1], [-24, 24]);
  const midX = useTransform(mx, [-1, 1], [-14, 14]);
  const midY = useTransform(my, [-1, 1], [12, -12]);

  useEffect(() => {
    if (reduced) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      mx.set((event.clientX / window.innerWidth) * 2 - 1);
      my.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, mx, my]);

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden>
      {/* Arc lumineux et halo, comme sur les maquettes. */}
      <div className="glow-arc animate-spin-slow top-1/2 left-1/2 aspect-square w-[112%] -translate-x-1/2 -translate-y-1/2 opacity-70" />
      <div className="glow-orb top-10 left-1/3 size-72 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.25, ease: EASE }}
        style={{ transformPerspective: 1200 }}
        className="relative"
      >
        <motion.div style={{ rotateX, rotateY, transformPerspective: 1400 }} className="[transform-style:preserve-3d]">
        {/* Écran */}
        <div className="rounded-[1.6rem] bg-gradient-to-b from-[oklch(0.3_0.04_250)] to-[oklch(0.18_0.035_250)] p-2.5 shadow-lift">
          <div className="overflow-hidden rounded-[1.1rem] bg-card">
            <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2.5">
              <span className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </span>
              <span className="mx-auto flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-[0.65rem] text-muted-foreground">
                <Lock className="size-3" /> rootwise.app/cours
              </span>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-[1.25fr_1fr]">
              <div className="flex flex-col gap-3">
                {course?.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- image servie par l'API
                  <img src={course.coverUrl} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
                ) : (
                  <div className="surface-navy aspect-[16/9] w-full rounded-xl" />
                )}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[0.65rem] font-bold tracking-wider text-primary uppercase">Cours en cours</span>
                  <span className="line-clamp-2 text-sm leading-snug font-bold text-foreground">
                    {course?.title ?? "Fonctions de hachage, MAC et mots de passe"}
                  </span>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.7_0.12_205)]"
                      initial={{ width: "0%" }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 1.6, delay: 1, ease: EASE }}
                    />
                  </div>
                  <span className="text-[0.65rem] text-muted-foreground">
                    68 % terminé · {course ? `${course.lessonCount} leçons · ${formatDuration(course.durationMinutes)}` : "11 leçons"}
                  </span>
                </div>
              </div>
              <div className="hidden flex-col gap-2 sm:flex">
                {["Introduction", "Les commandes clés", "Pièges à éviter", "Quiz du chapitre"].map((label, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.12, ease: EASE }}
                    className="flex items-center gap-2 rounded-lg border bg-background/60 px-2.5 py-2"
                  >
                    {index < 2 ? (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    ) : index === 2 ? (
                      <CirclePlay className="size-4 shrink-0 text-sky-500" />
                    ) : (
                      <ListChecks className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-[0.7rem] font-medium text-foreground">{label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Pied de l'écran */}
        <div className="mx-auto h-6 w-24 bg-gradient-to-b from-[oklch(0.3_0.03_250)] to-[oklch(0.22_0.03_250)] [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" />
        <div className="mx-auto h-2.5 w-44 rounded-full bg-[oklch(0.25_0.03_250)] shadow-lift" />
        </motion.div>
      </motion.div>

      {/* Cartes flottantes */}
      {author && (
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          className="absolute top-6 -left-4 sm:-left-10"
        >
          <motion.div style={{ x: nearX, y: nearY }}>
          <div className="animate-float flex items-center gap-3 rounded-2xl border bg-card/95 px-3 py-2.5 shadow-lift backdrop-blur">
            <span className="animate-pulse-ring rounded-full">
              <Avatar name={author.displayName} src={author.avatarUrl} className="size-10" />
            </span>
            <span className="flex flex-col">
              <span className="text-[0.62rem] font-semibold tracking-wide text-muted-foreground uppercase">Votre formateur</span>
              <span className="text-xs font-bold text-foreground">{author.displayName}</span>
            </span>
          </div>
          </motion.div>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
        className="absolute -right-2 -bottom-4 sm:-right-8 sm:bottom-16"
      >
        <motion.div style={{ x: farX, y: farY }}>
        <div className="animate-float-slow flex items-center gap-3 rounded-2xl border bg-card/95 px-3.5 py-3 shadow-lift backdrop-blur">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
            <Award className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-xs font-bold text-foreground">Certificat obtenu</span>
            <span className="text-[0.65rem] text-muted-foreground">Signé Ed25519 · vérifiable</span>
          </span>
        </div>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.35, ease: EASE }}
        className="absolute -top-4 right-6 hidden sm:block"
      >
        <motion.div style={{ x: midX, y: midY }}>
          <div className="animate-float flex items-center gap-2 rounded-full border bg-card/95 px-3 py-1.5 shadow-soft backdrop-blur">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-[0.7rem] font-bold text-foreground">Quiz réussi · 100 %</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
