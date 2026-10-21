import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "cn";
import { CourseCard } from "@/components/course-card";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { TopicIcon } from "@/components/home/topic-icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { LEVEL_LABELS, type CourseSummary, type Level, type Tag } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Cours",
  description: "Cours de cybersécurité par niveau et par thème : cryptographie, TLS, PKI, administration Linux, réseau, supervision…",
};

const LEVELS = Object.keys(LEVEL_LABELS) as Level[];

export default async function CatalogPage({ searchParams }: PageProps<"/cours">) {
  const params = await searchParams;
  const level = typeof params.niveau === "string" && LEVELS.includes(params.niveau as Level) ? (params.niveau as Level) : undefined;
  const tag = typeof params.theme === "string" && params.theme ? params.theme : undefined;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const search = new URLSearchParams();
  if (level) search.set("level", level);
  if (tag) search.set("tag", tag);
  if (query) search.set("q", query);
  const [courses, tags] = await Promise.all([
    apiGet<CourseSummary[]>(`/public/courses?${search}`),
    apiGet<Tag[]>("/public/tags"),
  ]);
  const activeTag = (tags ?? []).find((item) => item.slug === tag);
  const filtered = !!(level || tag || query);

  /** Lien de filtre qui conserve les autres filtres actifs. */
  const filterHref = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { niveau: level, theme: tag, q: query || undefined, ...changes };
    Object.entries(merged).forEach(([key, value]) => value && next.set(key, value));
    const qs = next.toString();
    return qs ? `/cours?${qs}` : "/cours";
  };

  return (
    <div className="relative">
      <SmoothScroll />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] overflow-hidden">
        <div className="aurora-blob -top-56 -left-24 size-[30rem] bg-[oklch(0.8_0.12_190)]" />
        <div className="aurora-blob -top-40 right-0 size-[26rem] bg-[oklch(0.74_0.13_235)]" />
      </div>
      <div aria-hidden className="bg-grid absolute inset-x-0 top-0 h-80 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-page relative py-12">
        <Reveal className="flex flex-col gap-3">
          <span className="eyebrow w-fit">Catalogue</span>
          <h1 className="heading-display text-4xl sm:text-5xl">
            Trouvez le cours{" "}
            <span className="text-accent-gradient">
              <ScrambleText text="qu’il vous faut" delay={200} />
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Des bases jusqu&apos;aux usages avancés, avec quiz de chapitre et certificat signé.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="surface border-beam mt-8 flex flex-col gap-4 p-4 shadow-lift sm:p-5">
            <form action="/cours" className="flex flex-col gap-3 md:flex-row" role="search">
              {tag && <input type="hidden" name="theme" value={tag} />}
              <label className="flex flex-1 items-center gap-3 rounded-xl border bg-background px-4 focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/15">
                <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Rechercher un cours : AES, Bash, TLS, réseau…"
                  aria-label="Rechercher un cours"
                  className="h-12 w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/70"
                />
              </label>
              <label className="flex items-center gap-2 rounded-xl border bg-background px-4">
                <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden />
                <select name="niveau" defaultValue={level ?? ""} aria-label="Niveau" className="h-12 bg-transparent pr-2 text-sm font-semibold outline-none">
                  <option value="">Tous niveaux</option>
                  {LEVELS.map((value) => (
                    <option key={value} value={value}>{LEVEL_LABELS[value]}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className={buttonVariants({ size: "lg", className: "h-12 rounded-xl px-6" })}>
                <Search aria-hidden /> Rechercher
              </button>
            </form>

            <nav aria-label="Thèmes" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <Chip href={filterHref({ theme: undefined })} active={!tag}>Tous les thèmes</Chip>
              {(tags ?? []).map((item) => (
                <Chip key={item.slug} href={filterHref({ theme: item.slug })} active={tag === item.slug}>
                  <TopicIcon slug={item.slug} className="size-3.5" />
                  {item.name}
                </Chip>
              ))}
            </nav>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="text-lg font-extrabold text-foreground">{courses?.length ?? 0}</span>{" "}
            {(courses?.length ?? 0) > 1 ? "cours trouvés" : "cours trouvé"}
          </p>
          {filtered && (
            <div className="flex flex-wrap items-center gap-2">
              {query && <ActiveFilter href={filterHref({ q: undefined })}>« {query} »</ActiveFilter>}
              {level && <ActiveFilter href={filterHref({ niveau: undefined })}>{LEVEL_LABELS[level]}</ActiveFilter>}
              {activeTag && <ActiveFilter href={filterHref({ theme: undefined })}>{activeTag.name}</ActiveFilter>}
              <Link href="/cours" className="text-xs font-semibold text-primary hover:underline">
                Tout effacer
              </Link>
            </div>
          )}
        </div>

        {courses && courses.length > 0 ? (
          <Stagger key={`${level}-${tag}-${query}`} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {courses.map((course) => (
              <StaggerItem key={course.slug} className="h-full">
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="surface mt-6 flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Search className="size-6" aria-hidden />
            </span>
            <p className="font-bold">Aucun cours ne correspond à ces critères.</p>
            <p className="text-sm text-muted-foreground">Essayez un autre mot-clé ou retirez un filtre.</p>
            <Link href="/cours" className={buttonVariants({ variant: "outline", className: "rounded-xl" })}>
              Voir tous les cours
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-300",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function ActiveFilter({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:bg-secondary/70"
      aria-label={`Retirer le filtre ${typeof children === "string" ? children : ""}`}
    >
      {children}
      <X className="size-3" aria-hidden />
    </Link>
  );
}
