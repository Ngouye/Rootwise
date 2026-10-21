import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock } from "lucide-react";
import { cn } from "cn";
import { Avatar } from "@/components/avatar";
import { Tilt } from "@/components/fx/tilt";
import { LEVEL_LABELS, formatDuration, type CourseSummary, type Level } from "@/lib/courses";

export const LEVEL_STYLES: Record<Level, string> = {
  BEGINNER: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
  INTERMEDIATE: "bg-sky-500/12 text-sky-700 ring-sky-500/25 dark:text-sky-300",
  EXPERT: "bg-violet-500/12 text-violet-700 ring-violet-500/25 dark:text-violet-300",
};

export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-bold ring-1 ring-inset", LEVEL_STYLES[level], className)}>
      {LEVEL_LABELS[level]}
    </span>
  );
}

/**
 * Carte d'un cours (catalogue, accueil, « Mes cours ») : image, niveau, formateur, volume. Elle
 * s'incline vers le pointeur et sa bordure s'illumine à son passage.
 */
export function CourseCard({ course, footer }: { course: CourseSummary; footer?: React.ReactNode }) {
  return (
    <Tilt className="h-full" max={5}>
      <article className="group card-lift surface relative flex h-full flex-col overflow-hidden">
        <Link href={`/cours/${course.slug}`} className="card-shine block focus-visible:outline-none" tabIndex={-1} aria-hidden>
          {course.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- image servie par l'API, dimensions libres
            <img
              src={course.coverUrl}
              alt=""
              loading="lazy"
              className="aspect-[16/8] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="surface-navy flex aspect-[16/8] items-end p-4 font-mono text-xs text-white/70">
              {course.tags.map((tag) => `#${tag.slug}`).join(" ")}
            </div>
          )}
          <span className="absolute top-3 left-3">
            <LevelBadge level={course.level} className="bg-card/90 backdrop-blur" />
          </span>
          <span className="absolute top-3 right-3 flex size-9 translate-y-1 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-soft backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 3).map((tag) => (
              <span key={tag.slug} className="rounded-md bg-secondary px-2 py-0.5 text-[0.7rem] font-semibold text-secondary-foreground">
                {tag.name}
              </span>
            ))}
          </div>
          {/* Vrai titre : les lecteurs d'écran naviguent de cours en cours. */}
          <h2 className="text-lg leading-snug font-bold tracking-tight">
            <Link href={`/cours/${course.slug}`} className="after:absolute after:inset-0 hover:text-primary focus-visible:outline-none">
              {course.title}
            </Link>
          </h2>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{course.summary}</p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-2">
              <Avatar name={course.author.displayName} src={course.author.avatarUrl} className="size-7 text-[0.6rem] ring-2 ring-card" />
              <span className="truncate font-semibold text-foreground">{course.author.displayName}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" aria-hidden /> {course.lessonCount}
                <span className="sr-only">leçons</span>
              </span>
              {course.durationMinutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden /> {formatDuration(course.durationMinutes)}
                </span>
              )}
            </span>
          </div>
          {footer && <div className="relative z-10">{footer}</div>}
        </div>
      </article>
    </Tilt>
  );
}
