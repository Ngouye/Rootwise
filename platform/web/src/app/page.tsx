import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpenCheck,
  Clock,
  GraduationCap,
  Hash,
  Layers,
  ListChecks,
  Search,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { GlowCard } from "@/components/fx/glow-card";
import { Magnetic } from "@/components/fx/magnetic";
import { Parallax } from "@/components/fx/parallax";
import { Particles } from "@/components/fx/particles";
import { RotatingScramble, ScrambleText } from "@/components/fx/scramble-text";
import { ScrollProgress } from "@/components/fx/scroll-progress";
import { ScrollWords } from "@/components/fx/scroll-words";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { SpotlightArea } from "@/components/fx/spotlight";
import { Tilt } from "@/components/fx/tilt";
import { CourseGallery } from "@/components/home/course-gallery";
import { HashDemo } from "@/components/home/hash-demo";
import { HeroVisual } from "@/components/home/hero-visual";
import { LiveTerminal } from "@/components/home/live-terminal";
import { Orbit } from "@/components/home/orbit";
import { SignatureDemo } from "@/components/home/signature-demo";
import { StepsTimeline } from "@/components/home/steps-timeline";
import { TopicIcon } from "@/components/home/topic-icon";
import { CountUp } from "@/components/motion/count-up";
import { HeroTitle, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { LEVEL_LABELS, mainAuthor, type CourseSummary, type Level, type Tag } from "@/lib/courses";

const CRYPTO_KEYWORDS = ["AES-GCM", "RSA-PSS", "Ed25519", "TLS 1.3", "X.509", "ML-KEM", "SHA-3", "Argon2id", "HMAC"];
const SYSTEM_KEYWORDS = ["Bash", "head · tail · cat", "usermod", "dnf", "apt", "ss", "tcpdump", "nmap", "journalctl", "PM2", "Netdata"];

const SUBJECTS = ["la cryptographie", "Linux", "les réseaux", "la supervision", "la cybersécurité"];

const PROMISES = [
  { icon: Layers, title: "Leçons structurées", text: "Du premier pas au cas réel, sans jargon inutile." },
  { icon: Terminal, title: "Commandes testées", text: "Chaque exemple a été exécuté avant d'être publié." },
  { icon: ListChecks, title: "Quiz de validation", text: "Vérifiez vos acquis à la fin de chaque chapitre." },
  { icon: BadgeCheck, title: "Certificat vérifiable", text: "Signé Ed25519 et contrôlable par tous." },
];

export default async function HomePage() {
  const [courseList, tagList] = await Promise.all([
    apiGet<CourseSummary[]>("/public/courses").catch(() => null),
    apiGet<Tag[]>("/public/tags").catch(() => null),
  ]);
  const courses = courseList ?? [];
  const tags = tagList ?? [];
  const lessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const hours = Math.round(courses.reduce((sum, course) => sum + course.durationMinutes, 0) / 60);
  const instructor = mainAuthor(courses);
  const instructorCourses = instructor ? courses.filter((course) => course.author.username === instructor.username) : [];
  const topicCounts = new Map<string, number>();
  courses.forEach((course) => course.tags.forEach((tag) => topicCounts.set(tag.slug, (topicCounts.get(tag.slug) ?? 0) + 1)));
  const topics = tags.filter((tag) => topicCounts.has(tag.slug)).sort((a, b) => (topicCounts.get(b.slug) ?? 0) - (topicCounts.get(a.slug) ?? 0));
  const popular = topics.slice(0, 5);

  return (
    <>
      <SmoothScroll />
      <ScrollProgress />

      {/* ───────────── Héros ───────────── */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        <SpotlightArea>
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0">
              <div className="aurora-blob -top-48 -left-40 size-[38rem] bg-[oklch(0.8_0.12_190)]" />
              <div className="aurora-blob top-24 -right-40 size-[32rem] bg-[oklch(0.74_0.13_235)]" />
              <div className="aurora-blob -bottom-56 left-1/3 size-[30rem] bg-[oklch(0.84_0.11_165)]" />
            </div>
            <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black_25%,transparent_80%)]" />
            <div className="grid-reveal absolute inset-0" />
            <Particles className="absolute inset-0 size-full opacity-70" density={16000} maxPoints={70} />
          </div>

          <div className="container-page relative grid items-center gap-14 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-24">
            <div className="flex flex-col gap-7">
              <Reveal y={12}>
                <Link href="/cours?theme=linux" className="eyebrow border-beam group w-fit bg-card/70 backdrop-blur">
                  <Sparkles className="size-3.5" aria-hidden />
                  Nouveau · 8 cours d&apos;administration Linux
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </Reveal>
              <HeroTitle
                text="Apprenez la cybersécurité"
                accent="sans la complexité."
                className="heading-display text-[2.6rem] sm:text-6xl lg:text-[3.6rem] xl:text-[3.9rem]"
              />
              <Reveal delay={0.55} y={10}>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm text-muted-foreground">
                  <span className="text-primary">$</span>
                  <span>apprendre --sujet</span>
                  <RotatingScramble words={SUBJECTS} className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary" />
                </p>
              </Reveal>
              <Reveal delay={0.65}>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                  Des leçons claires, des commandes testées, des quiz pour valider vos acquis et un certificat signé que tout le
                  monde peut vérifier.
                </p>
              </Reveal>

              <Reveal delay={0.75}>
                <form action="/cours" role="search" className="surface border-beam flex flex-col gap-2 p-2 shadow-lift sm:flex-row sm:items-center">
                  <label className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2 focus-within:bg-muted/60">
                    <Search className="size-5 shrink-0 text-primary" aria-hidden />
                    <span className="flex flex-1 flex-col">
                      <span className="text-[0.65rem] font-bold tracking-wider text-muted-foreground uppercase">Que voulez-vous apprendre ?</span>
                      <input
                        name="q"
                        placeholder="AES, Bash, TLS, réseau…"
                        className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground/70"
                      />
                    </span>
                  </label>
                  <label className="flex flex-col rounded-xl px-3 py-2 focus-within:bg-muted/60 sm:border-l sm:pl-4">
                    <span className="text-[0.65rem] font-bold tracking-wider text-muted-foreground uppercase">Niveau</span>
                    <select name="niveau" className="bg-transparent text-sm font-semibold text-foreground outline-none" defaultValue="">
                      <option value="">Tous niveaux</option>
                      {(Object.keys(LEVEL_LABELS) as Level[]).map((level) => (
                        <option key={level} value={level}>{LEVEL_LABELS[level]}</option>
                      ))}
                    </select>
                  </label>
                  <Magnetic className="w-full sm:w-auto" strength={0.25}>
                    <button type="submit" className={buttonVariants({ size: "lg", className: "group shine-sweep h-12 w-full rounded-xl px-5 text-sm" })}>
                      Trouver un cours
                      <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </button>
                  </Magnetic>
                </form>
              </Reveal>

              {popular.length > 0 && (
                <Reveal delay={0.85}>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Populaires :</span>
                    {popular.map((tag) => (
                      <Link
                        key={tag.slug}
                        href={`/cours?theme=${tag.slug}`}
                        className="rounded-full border bg-card/80 px-3 py-1 text-xs font-semibold text-foreground shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            <HeroVisual course={courses[0] ?? null} author={instructor} />
          </div>

          {/* Bandeau de statistiques. */}
          <div className="container-page relative pb-6">
            <Reveal>
              <div className="surface-navy noise relative grid gap-6 rounded-3xl p-6 text-white shadow-lift sm:grid-cols-2 sm:p-8 lg:grid-cols-[repeat(4,1fr)_auto] lg:items-center">
                <Stat icon={GraduationCap} value={courses.length} label="cours disponibles" />
                <Stat icon={BookOpenCheck} value={lessons} label="leçons pratiques" />
                <Stat icon={Clock} value={hours} suffix=" h" label="de contenu" />
                <Stat icon={Award} value={100} suffix=" %" label="gratuit, certificat compris" />
                <Link href="/cours" className={buttonVariants({ variant: "outline", size: "lg", className: "group relative h-11 rounded-xl border-white/25 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white sm:col-span-2 lg:col-span-1" })}>
                  Voir le catalogue
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </SpotlightArea>
      </section>

      {/* ───────────── Mots-clés défilants, sur deux rangs opposés ───────────── */}
      <section aria-label="Notions abordées" className="flex flex-col gap-3 overflow-hidden py-12 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <KeywordRow keywords={CRYPTO_KEYWORDS} />
        <KeywordRow keywords={SYSTEM_KEYWORDS} reverse />
      </section>

      {/* ───────────── Manifeste qui s'allume au défilement ───────────── */}
      <section className="container-page py-20 sm:py-28" aria-label="Notre approche">
        <ScrollWords
          text="Chaque commande est testée, chaque notion est illustrée et chaque certificat est signé : ici, on apprend la sécurité comme on la pratique sur le terrain."
          highlight={["testée", "illustrée", "signé", "terrain"]}
          className="mx-auto max-w-5xl text-center text-[1.9rem] leading-[1.25] font-extrabold tracking-[-0.02em] text-foreground sm:text-5xl sm:leading-[1.15]"
        />
      </section>

      {/* ───────────── Démonstrations en direct (bento) ───────────── */}
      <section className="container-page py-16" aria-labelledby="en-direct">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="eyebrow">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            En direct
          </span>
          <h2 id="en-direct" className="heading-section">
            La sécurité, <span className="text-accent-gradient">sous vos yeux</span>
          </h2>
          <p className="text-muted-foreground">Pas de captures figées : ces démonstrations tournent réellement dans votre navigateur.</p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <GlowCard className="flex h-full flex-col gap-5 p-6">
              <BentoHeader icon={Terminal} title="Un vrai terminal, de vraies sorties" text="Les commandes des cours, exécutées et vérifiées avant publication." />
              <div className="h-72">
                <LiveTerminal />
              </div>
            </GlowCard>
          </Reveal>
          <Reveal delay={0.1}>
            <GlowCard className="flex h-full flex-col gap-5 p-6">
              <BentoHeader icon={Hash} title="L'effet avalanche" text="Tapez : l'empreinte SHA-256 est recalculée à chaque lettre." />
              <HashDemo />
            </GlowCard>
          </Reveal>
          <Reveal>
            <GlowCard className="flex h-full flex-col gap-5 p-6">
              <BentoHeader icon={BadgeCheck} title="Certificats infalsifiables" text="Une signature Ed25519 que tout le monde peut contrôler." />
              <SignatureDemo />
            </GlowCard>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-2">
            <GlowCard className="grid h-full items-center gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
              <div className="flex flex-col gap-5">
                <BentoHeader icon={Layers} title="Tous les fronts de la défense" text="Cryptographie, systèmes, réseau et supervision : un parcours cohérent, du premier pas au cas réel." />
                <div className="flex flex-wrap gap-2">
                  {topics.slice(0, 8).map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`/cours?theme=${tag.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <TopicIcon slug={tag.slug} className="size-3.5 text-primary" />
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="w-56 justify-self-center sm:w-64">
                <Orbit />
              </div>
            </GlowCard>
          </Reveal>
        </div>
      </section>

      {/* ───────────── Catalogue : galerie épinglée ───────────── */}
      {courses.length > 0 && (
        <CourseGallery
          courses={courses.slice(0, 8)}
          total={courses.length}
          heading={
            <>
              Des cours pensés pour <span className="text-accent-gradient">la pratique</span>
            </>
          }
        />
      )}

      {/* ───────────── Comment ça marche ───────────── */}
      <section className="relative py-16" aria-labelledby="comment">
        <div className="container-page">
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <span className="eyebrow">Comment ça marche</span>
            <h2 id="comment" className="heading-section">
              De la première leçon <span className="text-accent-gradient">au certificat</span>
            </h2>
            <p className="text-muted-foreground">Trois étapes, à votre rythme, depuis n&apos;importe quel appareil.</p>
          </Reveal>
          <StepsTimeline />
        </div>
      </section>

      {/* ───────────── Thèmes ───────────── */}
      {topics.length > 0 && (
        <section className="container-page py-16" aria-labelledby="themes">
          <Reveal className="flex flex-col gap-3">
            <span className="eyebrow w-fit">Thèmes</span>
            <h2 id="themes" className="heading-section">
              Explorez par <span className="text-accent-gradient">domaine</span>
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" stagger={0.05}>
            {topics.map((tag) => (
              <StaggerItem key={tag.slug} className="h-full">
                <Tilt className="h-full" max={10}>
                  <Link href={`/cours?theme=${tag.slug}`} className="group surface flex h-full items-center gap-4 p-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                      <TopicIcon slug={tag.slug} className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-bold text-foreground">{tag.name}</span>
                      <span className="text-xs text-muted-foreground">{topicCounts.get(tag.slug)} cours</span>
                    </span>
                  </Link>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* ───────────── Le formateur ───────────── */}
      {instructor && (
        <section className="container-page py-16" aria-labelledby="formateur">
          <div className="surface relative grid items-center gap-10 overflow-hidden p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
            <div aria-hidden className="glow-orb -right-24 -bottom-24 size-80 opacity-30" />
            <div aria-hidden className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_left,black,transparent_65%)]" />
            <Parallax offset={36} className="relative mx-auto w-full max-w-sm">
              <div aria-hidden className="glow-arc animate-spin-slow -inset-6" />
              <Tilt max={9} className="rounded-[2rem]">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[oklch(0.42_0.08_220)] p-1.5 shadow-lift">
                  {instructor.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- image servie par l'API
                    <img src={instructor.avatarUrl} alt={`Photo de ${instructor.displayName}`} className="aspect-square w-full rounded-[1.6rem] object-cover" />
                  ) : (
                    <Avatar name={instructor.displayName} className="aspect-square h-auto w-full rounded-[1.6rem] text-6xl" />
                  )}
                </div>
              </Tilt>
              <div className="animate-float absolute -right-3 bottom-8 z-20 flex items-center gap-2 rounded-2xl border bg-card px-3.5 py-2.5 shadow-lift">
                <BadgeCheck className="size-5 text-primary" aria-hidden />
                <span className="text-xs font-bold">Formateur vérifié</span>
              </div>
            </Parallax>
            <Reveal delay={0.15} className="relative flex flex-col gap-5">
              <span className="eyebrow w-fit">Votre formateur</span>
              <h2 id="formateur" className="heading-section">
                <ScrambleText text={instructor.displayName} trigger="view" duration={1400} />
              </h2>
              {instructor.headline && <p className="text-lg font-semibold text-primary">{instructor.headline}</p>}
              {instructor.bio && <p className="leading-7 text-muted-foreground">{instructor.bio}</p>}
              <dl className="grid grid-cols-3 gap-3">
                <MiniStat value={instructorCourses.length} label="cours" />
                <MiniStat value={instructorCourses.reduce((sum, course) => sum + course.lessonCount, 0)} label="leçons" />
                <MiniStat value={new Set(instructorCourses.flatMap((course) => course.tags.map((tag) => tag.slug))).size} label="thèmes" />
              </dl>
              <div className="flex flex-wrap gap-3">
                {instructor.username && (
                  <Magnetic>
                    <Link href={`/formateurs/${instructor.username}`} className={buttonVariants({ size: "lg", className: "group h-11 rounded-xl px-5" })}>
                      Découvrir ses cours
                      <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </Magnetic>
                )}
                <Link href="/inscription" className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 rounded-xl px-5" })}>
                  Créer un compte gratuit
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ───────────── Appel final ───────────── */}
      <section className="container-page pt-8" aria-labelledby="pret">
        <Reveal>
          <div className="surface-navy noise border-beam relative overflow-hidden rounded-[2rem] px-6 py-14 text-white shadow-lift sm:px-12 sm:py-16">
            <Particles className="pointer-events-none absolute inset-0 size-full opacity-60" density={12000} maxPoints={60} />
            <div aria-hidden className="glow-arc animate-spin-slow -top-[70%] -right-[22%] aspect-square w-[48%] opacity-60" />
            <div className="relative flex max-w-2xl flex-col gap-5">
              <h2 id="pret" className="heading-section text-white sm:text-5xl">
                Prêt à passer <span className="text-[oklch(0.82_0.12_190)]">au niveau supérieur ?</span>
              </h2>
              <p className="text-lg text-white/75">
                Créez votre compte en une minute et commencez dès maintenant : les cours, les quiz et le certificat sont gratuits.
              </p>
              <div className="flex flex-wrap gap-3">
                <Magnetic>
                  <Link href="/inscription" className={buttonVariants({ size: "lg", className: "group shine-sweep h-12 rounded-xl bg-[oklch(0.78_0.12_182)] px-6 text-[oklch(0.2_0.045_250)] hover:bg-[oklch(0.84_0.11_182)]" })}>
                    Commencer gratuitement
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Link href="/cours" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 rounded-xl border-white/25 bg-white/5 px-6 text-white hover:bg-white/15 hover:text-white" })}>
                    Explorer les cours
                  </Link>
                </Magnetic>
              </div>
            </div>
            <div className="relative mt-12 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
              {PROMISES.map((promise) => (
                <div key={promise.title} className="flex gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[oklch(0.82_0.12_190)]">
                    <promise.icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold">{promise.title}</span>
                    <span className="text-xs leading-5 text-white/60">{promise.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/** Rang de mots-clés en boucle : la liste est répétée pour couvrir les écrans les plus larges. */
function KeywordRow({ keywords, reverse = false }: { keywords: string[]; reverse?: boolean }) {
  const repeated = [...keywords, ...keywords, ...keywords, ...keywords];
  return (
    <div className={`marquee ${reverse ? "marquee-reverse" : ""}`}>
      <div className="marquee-track">
        {repeated.map((keyword, index) => (
          <span
            key={`${keyword}-${index}`}
            aria-hidden={index >= keywords.length}
            className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 font-mono text-sm font-medium whitespace-nowrap text-foreground/80 shadow-soft"
          >
            <span className={`size-1.5 rounded-full ${reverse ? "bg-[oklch(0.65_0.13_235)]" : "bg-primary"}`} />
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}

function BentoHeader({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.42_0.08_220)] text-primary-foreground shadow-soft">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="flex flex-col gap-0.5">
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, suffix, label }: { icon: LucideIcon; value: number; suffix?: string; label: string }) {
  return (
    <div className="relative flex items-center gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-[oklch(0.82_0.12_190)]">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="text-2xl font-extrabold tracking-tight">
          <CountUp value={value} suffix={suffix} />
        </span>
        <span className="text-xs text-white/60">{label}</span>
      </span>
    </div>
  );
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border bg-background/60 p-4 text-center">
      <dt className="sr-only">{label}</dt>
      <dd className="flex flex-col">
        <span className="text-2xl font-extrabold text-foreground">
          <CountUp value={value} />
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </dd>
    </div>
  );
}
