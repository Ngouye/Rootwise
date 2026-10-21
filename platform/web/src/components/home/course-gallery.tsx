"use client";

import Link from "next/link";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CourseCard } from "@/components/course-card";
import type { CourseSummary } from "@/lib/courses";

type CourseGalleryProps = { courses: CourseSummary[]; total: number; heading: React.ReactNode };

/**
 * Galerie épinglée : sur grand écran, la section reste fixe pendant que le défilement vertical fait
 * glisser les cours de droite à gauche. Sur mobile, simple carrousel à balayer.
 */
export function CourseGallery({ courses, total, heading }: CourseGalleryProps) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const offset = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * offset.get());

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      const value = Math.max(0, node.scrollWidth - window.innerWidth + 64);
      offset.set(value);
      setDistance(value);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [offset]);

  return (
    <>
      {/* Grand écran : défilement horizontal piloté par le défilement vertical. */}
      <section ref={section} aria-labelledby="galerie" className="relative hidden lg:block" style={{ height: `calc(100vh + ${distance}px)` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center gap-10 overflow-hidden">
          <div className="container-page flex items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="eyebrow w-fit">Catalogue</span>
              <h2 id="galerie" className="heading-section">{heading}</h2>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Link href="/cours" className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Voir les {total} cours
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-primary to-[oklch(0.7_0.12_205)]" style={{ scaleX: scrollYProgress }} />
              </div>
            </div>
          </div>
          <motion.div ref={track} style={{ x }} className="flex w-max gap-6 pr-16 pl-[max(1rem,calc((100vw-80rem)/2+2rem))]">
            {courses.map((course) => (
              <div key={course.slug} className="w-[24rem] shrink-0">
                <CourseCard course={course} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile et tablette : carrousel à balayer. */}
      <section aria-labelledby="galerie-mobile" className="py-16 lg:hidden">
        <div className="container-page flex flex-col gap-3">
          <span className="eyebrow w-fit">Catalogue</span>
          <h2 id="galerie-mobile" className="heading-section">{heading}</h2>
          <Link href="/cours" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
            Voir les {total} cours <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:scroll-px-6 sm:px-6 [scrollbar-width:none]">
          {courses.map((course) => (
            <div key={course.slug} className="w-[82vw] max-w-sm shrink-0 snap-start">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
